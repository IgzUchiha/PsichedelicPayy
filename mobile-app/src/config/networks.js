// Top Ethereum Networks Configuration
export const NETWORKS = [
  {
    id: 'ethereum',
    name: 'Ethereum',
    symbol: 'ETH',
    chainId: 1,
    rpcUrl: 'https://eth.llamarpc.com',
    explorerUrl: 'https://etherscan.io',
    icon: '⟠',
    color: '#627EEA',
    decimals: 18,
    coingeckoId: 'ethereum',
  },
  {
    id: 'arbitrum',
    name: 'Arbitrum',
    symbol: 'ARB',
    chainId: 42161,
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    explorerUrl: 'https://arbiscan.io',
    icon: '🔵',
    color: '#28A0F0',
    decimals: 18,
    coingeckoId: 'ethereum',  // Uses ETH price for native balance
  },
  {
    id: 'optimism',
    name: 'Optimism',
    symbol: 'OP',
    chainId: 10,
    rpcUrl: 'https://mainnet.optimism.io',
    explorerUrl: 'https://optimistic.etherscan.io',
    icon: '🔴',
    color: '#FF0420',
    decimals: 18,
    coingeckoId: 'ethereum',  // Uses ETH price for native balance
  },
  {
    id: 'polygon',
    name: 'Polygon',
    symbol: 'POL',
    chainId: 137,
    rpcUrl: 'https://polygon-rpc.com',
    explorerUrl: 'https://polygonscan.com',
    icon: '🟣',
    color: '#8247E5',
    decimals: 18,
    coingeckoId: 'matic-network',
  },
  {
    id: 'base',
    name: 'Base',
    symbol: 'BASE',
    chainId: 8453,
    rpcUrl: 'https://mainnet.base.org',
    explorerUrl: 'https://basescan.org',
    icon: '🔷',
    color: '#0052FF',
    decimals: 18,
    coingeckoId: 'ethereum',  // Uses ETH price for native balance
  },
  {
    id: 'bsc',
    name: 'BNB Chain',
    symbol: 'BNB',
    chainId: 56,
    rpcUrl: 'https://bsc-dataseed.binance.org',
    explorerUrl: 'https://bscscan.com',
    icon: '🟡',
    color: '#F0B90B',
    decimals: 18,
    coingeckoId: 'binancecoin',
  },
  {
    id: 'avalanche',
    name: 'Avalanche',
    symbol: 'AVAX',
    chainId: 43114,
    rpcUrl: 'https://api.avax.network/ext/bc/C/rpc',
    explorerUrl: 'https://snowtrace.io',
    icon: '🔺',
    color: '#E84142',
    decimals: 18,
    coingeckoId: 'avalanche-2',
  },
];

// Cache for crypto prices
let priceCache = {};
let priceCacheTime = 0;
const PRICE_CACHE_DURATION = 60000; // 1 minute

// Fetch crypto prices from CoinGecko
export async function fetchCryptoPrices() {
  // Return cached prices if still valid
  if (Date.now() - priceCacheTime < PRICE_CACHE_DURATION && Object.keys(priceCache).length > 0) {
    return priceCache;
  }

  try {
    const coinIds = [...new Set(NETWORKS.map(n => n.coingeckoId))].join(',');
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coinIds}&vs_currencies=usd`,
      { headers: { 'Accept': 'application/json' } }
    );
    
    if (!response.ok) {
      console.warn('Price fetch failed:', response.status);
      return priceCache; // Return cached prices on error
    }
    
    const data = await response.json();
    priceCache = data;
    priceCacheTime = Date.now();
    
    console.log('Fetched crypto prices:', data);
    return data;
  } catch (error) {
    console.error('Error fetching crypto prices:', error.message);
    return priceCache; // Return cached prices on error
  }
}

// Fetch balance from a network using JSON-RPC
export async function fetchNetworkBalance(network, address) {
  try {
    // Validate address format
    if (!address || !address.startsWith('0x') || address.length !== 42) {
      console.warn(`Invalid address format for ${network.name}: ${address}`);
      return 0;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

    const response = await fetch(network.rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_getBalance',
        params: [address, 'latest'],
        id: 1,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`HTTP error for ${network.name}: ${response.status}`);
      return 0;
    }

    const data = await response.json();
    
    if (data.error) {
      console.warn(`RPC error for ${network.name}:`, data.error);
      return 0;
    }

    if (data.result) {
      // Convert hex to decimal and format
      const balanceWei = BigInt(data.result);
      const balanceEth = Number(balanceWei) / Math.pow(10, network.decimals);
      return balanceEth;
    }
    return 0;
  } catch (error) {
    if (error.name === 'AbortError') {
      console.warn(`Timeout fetching balance for ${network.name}`);
    } else {
      console.error(`Error fetching balance for ${network.name}:`, error.message);
    }
    return 0;
  }
}

// Fetch balances from all networks with USD values
export async function fetchAllNetworkBalances(address) {
  // Fetch prices in parallel with balances
  const [prices, balanceResults] = await Promise.all([
    fetchCryptoPrices(),
    Promise.all(
      NETWORKS.map(async (network) => {
        const balance = await fetchNetworkBalance(network, address);
        return { network, balance };
      })
    )
  ]);

  const balances = balanceResults.map(({ network, balance }) => {
    const price = prices[network.coingeckoId]?.usd || 0;
    const usdValue = balance * price;
    
    return {
      ...network,
      balance,
      formattedBalance: formatBalance(balance),
      price,
      usdValue,
      formattedUsdValue: formatUsdValue(usdValue),
    };
  });
  
  return balances;
}

function formatUsdValue(value) {
  if (value === 0) return '$0.00';
  if (value < 0.01) return '<$0.01';
  return '$' + value.toFixed(2);
}

function formatBalance(balance) {
  if (balance === 0) return '0';
  if (balance < 0.0001) return '<0.0001';
  if (balance < 1) return balance.toFixed(4);
  if (balance < 1000) return balance.toFixed(4);
  return balance.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

export default NETWORKS;
