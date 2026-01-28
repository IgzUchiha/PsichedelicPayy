# PSI Mobile App - Current Status

## ✅ Completed Features

### Core Functionality
- ✅ Non-custodial wallet with 12-word seed phrase
- ✅ Wallet creation and import (seed phrase or private key)
- ✅ Secure key storage using expo-secure-store
- ✅ Sign out functionality
- ✅ Multi-chain support (Ethereum, Arbitrum, Optimism, Base, Polygon, BSC, Avalanche)

### UI/UX
- ✅ Custom bottom tab navigation with Home, Activity, Pay, Blocks, Profile
- ✅ Floating green Pay button in center of tab bar
- ✅ Balance cards with gradient backgrounds for each chain
- ✅ Skeleton loaders for Activity and Blocks sections
- ✅ Pull-to-refresh on home screen
- ✅ Dark/Light theme support
- ✅ Error boundary for crash handling

### Balance System
- ✅ PSI Rollup private balance (calculated from stored notes)
- ✅ Network balance fetching from public RPC endpoints
- ✅ Parallel balance fetching for all networks
- ✅ Timeout handling (8 seconds per RPC call)
- ✅ Error handling and fallback to $0 on network errors

### Build & Deployment
- ✅ iOS builds working (Build 27+)
- ✅ Preview profile for internal testing via QR code
- ✅ Production profile for TestFlight submission
- ✅ No startup crashes (fixed ethers.js polyfill issue)

## 📊 Balance Loading

### PSI Rollup Balance
- Shows $0.00 until notes are created
- Notes are created when receiving funds through PSI protocol
- Calculated from unspent notes in SecureStore

### Network Balances
- Fetches from public RPC endpoints
- Shows $0 if wallet has no funds on that network
- Updates on pull-to-refresh or navigation

**To test with funds:**
1. Get wallet address from Profile screen
2. Send test tokens to address on any network
3. Pull to refresh on home screen
4. Balances should update within seconds

## 🔧 Technical Details

### Dependencies
- React Native 0.74.5
- Expo 51.0.0
- ethers.js 6.16.0 (imported dynamically, not at startup)
- expo-crypto for random number generation
- expo-secure-store for key storage

### Key Files
- `App.js` - Main app structure and navigation
- `src/context/WalletContext.js` - Wallet state management
- `src/screens/HomeScreen.js` - Home screen with balances
- `src/config/networks.js` - Network RPC configuration
- `src/api/payyApi.js` - Backend API client

### API Configuration
- Base URL: `http://localhost:8080` (or `EXPO_PUBLIC_API_URL` env var)
- Endpoints: `/v0/health`, `/v0/height`, `/v0/stats`, `/v0/transactions`, etc.

## 🚀 Next Steps

### Immediate
1. Test balance loading with real funds or faucet
2. Verify backend API is running and accessible
3. Test transaction submission flow

### Short Term
1. Implement transaction history display
2. Add transaction submission UI
3. Add receive address QR code
4. Test on physical device

### Medium Term
1. Add balance caching to reduce RPC calls
2. Add token balance support (ERC-20)
3. Add transaction notifications
4. Add biometric authentication

## 📱 Testing

### On Simulator
```bash
cd mobile-app
npx expo start --ios
```

### On Physical Device
```bash
cd mobile-app
eas build --platform ios --profile preview
# Scan QR code with Expo Go app
```

### Submit to TestFlight
```bash
cd mobile-app
eas build --platform ios --profile production --auto-submit
```

## 🐛 Known Issues

None currently - app is stable and running without crashes.

## 📝 Notes

- App uses default Expo entry point (node_modules/expo/AppEntry.js)
- No custom index.js polyfills
- ethers.js only imported when needed (wallet creation/import)
- All crypto operations use expo-crypto for native performance
