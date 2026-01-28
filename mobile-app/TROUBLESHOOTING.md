# PSI Mobile App - Troubleshooting Guide

## Balance Issues

### Problem: All balances show $0.00

**Possible Causes:**
1. Wallet is new and has no funds
2. Backend API is not running
3. Network RPC endpoints are unreachable
4. Wallet address format is invalid

**Solutions:**
1. Check wallet address in Profile screen - should start with `0x` and be 42 chars
2. Verify backend is running: `curl http://localhost:8080/v0/health`
3. Test RPC endpoint: `curl -X POST https://eth.llamarpc.com -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'`
4. Send test tokens to wallet address from a faucet
5. Pull to refresh on home screen

### Problem: Network balances not updating

**Solutions:**
1. Check network connectivity
2. Pull to refresh (drag down on home screen)
3. Check if RPC endpoints are responding
4. Restart the app
5. Check console logs for errors: `npx expo start --ios` and look for error messages

### Problem: PSI Rollup balance not updating

**Solutions:**
1. PSI balance only updates when notes are created
2. Notes are created when receiving funds through PSI protocol
3. Check if backend is creating notes for your address
4. Check SecureStore for stored notes: Add logging in WalletContext.js

## App Crashes

### Problem: App crashes on startup

**Solutions:**
1. Clear app cache: Delete app and reinstall
2. Check error boundary message for details
3. Check console logs: `npx expo start --ios`
4. Verify all dependencies are installed: `npm install`
5. Clear Metro bundler cache: `npx expo start --ios --clear`

### Problem: App crashes when creating wallet

**Solutions:**
1. Check if expo-crypto is installed: `npm list expo-crypto`
2. Verify SecureStore is working
3. Check console for specific error message
4. Try importing wallet instead of creating new one

### Problem: App crashes when importing wallet

**Solutions:**
1. Verify seed phrase format (12 or 24 words, space-separated)
2. Verify private key format (64 hex characters, with or without 0x prefix)
3. Check console for validation error message
4. Try with a known valid seed phrase for testing

## Network Issues

### Problem: "Network Error" in console logs

**Solutions:**
1. Check if backend API is running
2. Verify API URL in `src/api/payyApi.js`
3. Check if firewall is blocking requests
4. For physical device: Use your computer's IP instead of localhost
5. Check network connectivity on device

### Problem: RPC calls timing out

**Solutions:**
1. RPC endpoints may be slow - this is normal
2. Timeout is set to 8 seconds per call
3. Try different RPC endpoints in `src/config/networks.js`
4. Check internet connection speed
5. Try again later if RPC is experiencing issues

## Build Issues

### Problem: Build fails with "xcrun is not configured"

**Solutions:**
```bash
sudo xcode-select --reset
sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
```

### Problem: "No iOS devices available in Simulator"

**Solutions:**
```bash
# Create a new simulator
xcrun simctl create "iPhone 15" com.apple.CoreSimulator.SimDeviceType.iPhone-15 com.apple.CoreSimulator.SimRuntime.iOS-18-0

# Or use Xcode to create one
open /Applications/Xcode.app/Contents/Developer/Applications/Simulator.app
```

### Problem: Build stuck or hanging

**Solutions:**
1. Kill Metro bundler: `lsof -i :8081` then `kill -9 <PID>`
2. Clear cache: `npx expo start --ios --clear`
3. Restart simulator: `xcrun simctl erase all`
4. Restart computer

## TestFlight Issues

### Problem: Build not appearing in TestFlight

**Solutions:**
1. Check build status: `eas build:list`
2. Verify Apple ID credentials are correct
3. Check if build completed successfully
4. Wait 5-10 minutes for TestFlight to process
5. Check email for TestFlight invitation

### Problem: "Invalid username and password"

**Solutions:**
1. Verify Apple ID is correct
2. Check if 2FA is enabled (it should be)
3. Use app-specific password if 2FA is enabled
4. Try logging out and back in: `npx expo logout`

## Performance Issues

### Problem: App is slow or laggy

**Solutions:**
1. Close other apps on device
2. Restart device
3. Clear app cache and reinstall
4. Check if backend is slow
5. Reduce number of transactions displayed

### Problem: Balance loading is slow

**Solutions:**
1. This is normal - RPC calls can take 2-5 seconds
2. Parallel fetching is already implemented
3. Consider adding balance caching
4. Check internet connection speed

## Debugging

### Enable Verbose Logging

Add to `src/context/WalletContext.js`:
```javascript
const loadWallet = async () => {
  console.log('Loading wallet...');
  try {
    const storedWallet = await SecureStore.getItemAsync(WALLET_STORAGE_KEY);
    console.log('Stored wallet:', storedWallet ? 'Found' : 'Not found');
    // ... rest of code
  }
}
```

### Check SecureStore Contents

Add to Profile screen temporarily:
```javascript
const debugSecureStore = async () => {
  const wallet = await SecureStore.getItemAsync('payy_wallet');
  const notes = await SecureStore.getItemAsync('payy_notes');
  console.log('Wallet:', wallet);
  console.log('Notes:', notes);
};
```

### Monitor Network Requests

Check console output from `npx expo start --ios` for:
- `Error fetching height:`
- `Error fetching stats:`
- `Error fetching transactions:`
- `Error fetching balance for`

## Getting Help

1. Check console logs: `npx expo start --ios`
2. Check error boundary message on screen
3. Review this troubleshooting guide
4. Check BALANCE_LOADING_GUIDE.md for balance-specific issues
5. Check CURRENT_STATUS.md for feature status

## Common Commands

```bash
# Start development server
npx expo start --ios

# Clear cache and restart
npx expo start --ios --clear

# Build for preview (QR code)
eas build --platform ios --profile preview

# Build for production (TestFlight)
eas build --platform ios --profile production --auto-submit

# Check build status
eas build:list

# View logs
eas build:view <BUILD_ID>

# Logout
npx expo logout

# Check installed packages
npm list
```
