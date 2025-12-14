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
  },
  {
    id: 'arbitrum',
    name: 'Arbitrum',
    symbol: 'ETH',
    chainId: 42161,
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    explorerUrl: 'https://arbiscan.io',
    icon: '🔵',
    color: '#28A0F0',
    decimals: 18,
  },
  {
    id: 'optimism',
    name: 'Optimism',
    symbol: 'ETH',
    chainId: 10,
    rpcUrl: 'https://mainnet.optimism.io',
    explorerUrl: 'https://optimistic.etherscan.io',
    icon: '🔴',
    color: '#FF0420',
    decimals: 18,
  },
  {
    id: 'polygon',
    name: 'Polygon',
    symbol: 'MATIC',
    chainId: 137,
    rpcUrl: 'https://polygon-rpc.com',
    explorerUrl: 'https://polygonscan.com',
    icon: '🟣',
    color: '#8247E5',
    decimals: 18,
  },
  {
    id: 'base',
    name: 'Base',
    symbol: 'ETH',
    chainId: 8453,
    rpcUrl: 'https://mainnet.base.org',
    explorerUrl: 'https://basescan.org',
    icon: '🔷',
    color: '#0052FF',
    decimals: 18,
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
  },
];

// Fetch balance from a network using JSON-RPC
export async function fetchNetworkBalance(network, address) {
  try {
    const response = await fetch(network.rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_getBalance',
        params: [address, 'latest'],
        id: 1,
      }),
    });

    const data = await response.json();
    if (data.result) {
      // Convert hex to decimal and format
      const balanceWei = BigInt(data.result);
      const balanceEth = Number(balanceWei) / Math.pow(10, network.decimals);
      return balanceEth;
    }
    return 0;
  } catch (error) {
    console.error(`Error fetching balance for ${network.name}:`, error);
    return 0;
  }
}

// Fetch balances from all networks
export async function fetchAllNetworkBalances(address) {
  const balances = await Promise.all(
    NETWORKS.map(async (network) => {
      const balance = await fetchNetworkBalance(network, address);
      return {
        ...network,
        balance,
        formattedBalance: formatBalance(balance),
      };
    })
  );
  return balances;
}

function formatBalance(balance) {
  if (balance === 0) return '0';
  if (balance < 0.0001) return '<0.0001';
  if (balance < 1) return balance.toFixed(4);
  if (balance < 1000) return balance.toFixed(4);
  return balance.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

export default NETWORKS;
