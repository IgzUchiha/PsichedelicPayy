# Balance Loading Guide

## Overview

The PSI mobile app displays balances from two sources:

### 1. PSI Rollup Balance (Private Balance)
- **Source**: Local notes stored in SecureStore
- **Display**: Shows as "PSI Rollup" card on the home screen
- **How it works**: 
  - When you receive funds through the PSI protocol, notes are created and stored locally
  - The balance is calculated by summing all unspent notes
  - This is your private balance on the PSI Rollup

### 2. Network Balances (On-chain Balances)
- **Source**: Public blockchain RPC endpoints
- **Display**: Shows as individual chain cards (Ethereum, Arbitrum, Optimism, Base, Polygon, BSC, Avalanche)
- **How it works**:
  - Fetches balance from each network's RPC endpoint using `eth_getBalance`
  - Shows your actual on-chain balance on each network
  - Updates when you pull to refresh or navigate back to home

## Why Balances Show $0.00

### PSI Rollup Balance
- Shows $0.00 because no notes have been created yet
- Notes are created when:
  - You receive funds through the PSI protocol
  - You submit a transaction that creates new notes
  - The backend processes and creates notes for your address

### Network Balances
- Shows $0 if your wallet address has no funds on that network
- This is normal for a new wallet
- To test with funds:
  - Send test tokens to your wallet address from a faucet
  - Or use the `/v0/prove/faucet` endpoint if available on your backend

## Testing Balance Loading

### Option 1: Manual Testing with Real Funds
1. Get your wallet address from the Profile screen
2. Send test tokens to your address on any network
3. Pull to refresh on the home screen
4. Network balances should update within a few seconds

### Option 2: Testing with Backend Faucet
If your backend has a faucet endpoint:
```bash
curl -X POST http://localhost:8080/v0/prove/faucet \
  -H "Content-Type: application/json" \
  -d '{"address":"0x...", "amount":100000000}'
```

### Option 3: Testing with Mock Data
To test the UI with sample balances, you can temporarily modify `WalletContext.js`:

```javascript
// In loadWallet() function, after loading wallet:
if (walletData?.address) {
  // For testing: set mock balances
  setNetworkBalances([
    { ...NETWORKS[0], balance: 0.5, formattedBalance: '0.5000' },
    { ...NETWORKS[1], balance: 1.25, formattedBalance: '1.2500' },
    // ... etc
  ]);
}
```

## Debugging Balance Loading Issues

### Check Network Connectivity
```javascript
// In HomeScreen.js, add logging:
const fetchData = async () => {
  try {
    console.log('Fetching data for address:', wallet?.address);
    // ... rest of fetch
  }
}
```

### Verify RPC Endpoints
Test if RPC endpoints are working:
```bash
curl -X POST https://eth.llamarpc.com \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_getBalance","params":["0x0000000000000000000000000000000000000000","latest"],"id":1}'
```

### Check Wallet Address Format
- Must start with `0x`
- Must be exactly 42 characters (0x + 40 hex chars)
- Example: `0x1234567890123456789012345678901234567890`

## Performance Notes

- Network balance fetching happens in parallel for all networks
- Each RPC call has an 8-second timeout
- If a network is slow, it won't block other networks
- Pull-to-refresh triggers all balance updates

## Future Improvements

- [ ] Add balance caching to reduce RPC calls
- [ ] Add balance history/charts
- [ ] Add token balance support (ERC-20)
- [ ] Add transaction history integration
- [ ] Add balance alerts/notifications
