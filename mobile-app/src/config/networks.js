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
    coingeckoId: 'arbitrum',  // ARB token price
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
    coingeckoId: 'optimism',  // OP token price
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
    coingeckoId: 'polygon-ecosystem-token',
  },
  {
    id: 'base',
    name: 'Base',
    symbol: 'ETH',  // Base uses ETH as native token
    chainId: 8453,
    rpcUrl: 'https://mainnet.base.org',
    explorerUrl: 'https://basescan.org',
    icon: '🔷',
    color: '#0052FF',
    decimals: 18,
    coingeckoId: 'ethereum',  // Base uses ETH
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

// Cache for price history (sparklines)
let priceHistoryCache = {};
let priceHistoryCacheTime = 0;
const HISTORY_CACHE_DURATION = 300000; // 5 minutes

// Fetch crypto prices from CoinGecko with 24h change
export async function fetchCryptoPrices() {
  // Return cached prices if still valid
  if (Date.now() - priceCacheTime < PRICE_CACHE_DURATION && Object.keys(priceCache).length > 0) {
    return priceCache;
  }

  try {
    const coinIds = [...new Set(NETWORKS.map(n => n.coingeckoId))].join(',');
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coinIds}&vs_currencies=usd&include_24hr_change=true`,
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

// Fetch sparkline data for all coins (7 day history)
export async function fetchSparklineData() {
  // Return cached data if still valid
  if (Date.now() - priceHistoryCacheTime < HISTORY_CACHE_DURATION && Object.keys(priceHistoryCache).length > 0) {
    return priceHistoryCache;
  }

  try {
    const coinIds = [...new Set(NETWORKS.map(n => n.coingeckoId))].join(',');
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${coinIds}&sparkline=true&price_change_percentage=24h`,
      { headers: { 'Accept': 'application/json' } }
    );
    
    if (!response.ok) {
      console.warn('Sparkline fetch failed:', response.status);
      return priceHistoryCache;
    }
    
    const data = await response.json();
    // Convert array to object keyed by id
    const result = {};
    data.forEach(coin => {
      result[coin.id] = {
        currentPrice: coin.current_price,
        priceChange24h: coin.price_change_24h,
        priceChangePercentage24h: coin.price_change_percentage_24h,
        sparkline: coin.sparkline_in_7d?.price || [],
        high24h: coin.high_24h,
        low24h: coin.low_24h,
        marketCap: coin.market_cap,
        volume24h: coin.total_volume,
      };
    });
    
    priceHistoryCache = result;
    priceHistoryCacheTime = Date.now();
    
    return result;
  } catch (error) {
    console.error('Error fetching sparkline data:', error.message);
    return priceHistoryCache;
  }
}

// Fetch detailed price history for a specific coin
export async function fetchPriceHistory(coingeckoId, days = 1) {
  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/${coingeckoId}/market_chart?vs_currency=usd&days=${days}`,
      { headers: { 'Accept': 'application/json' } }
    );
    
    if (!response.ok) {
      console.warn('Price history fetch failed:', response.status);
      return null;
    }
    
    const data = await response.json();
    return {
      prices: data.prices, // Array of [timestamp, price]
      marketCaps: data.market_caps,
      volumes: data.total_volumes,
    };
  } catch (error) {
    console.error('Error fetching price history:', error.message);
    return null;
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

// Fetch balances from all networks with USD values and sparklines
export async function fetchAllNetworkBalances(address) {
  // Fetch prices, sparklines, and balances in parallel
  const [prices, sparklineData, balanceResults] = await Promise.all([
    fetchCryptoPrices(),
    fetchSparklineData(),
    Promise.all(
      NETWORKS.map(async (network) => {
        const balance = await fetchNetworkBalance(network, address);
        return { network, balance };
      })
    )
  ]);

  const balances = balanceResults.map(({ network, balance }) => {
    const priceData = prices[network.coingeckoId] || {};
    const sparkline = sparklineData[network.coingeckoId] || {};
    const price = priceData.usd || sparkline.currentPrice || 0;
    const priceChange24h = priceData.usd_24h_change || sparkline.priceChangePercentage24h || 0;
    const usdValue = balance * price;
    
    return {
      ...network,
      balance,
      formattedBalance: formatBalance(balance),
      price,
      priceChange24h,
      usdValue,
      formattedUsdValue: formatUsdValue(usdValue),
      sparkline: sparkline.sparkline || [],
      high24h: sparkline.high24h,
      low24h: sparkline.low24h,
      marketCap: sparkline.marketCap,
      volume24h: sparkline.volume24h,
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
