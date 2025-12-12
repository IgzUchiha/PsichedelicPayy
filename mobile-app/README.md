# Payy ZK Rollup Mobile App

A React Native mobile application for interacting with the Payy ZK Rollup backend.

## Features

- 📊 View node status and chain information
- 📦 Browse blocks in the rollup chain
- 💸 View transaction history
- 🔄 Pull-to-refresh for real-time updates
- 📱 Works on iOS and Android

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Expo CLI**: `npm install -g expo-cli`

For iOS development:
- **Xcode** (Mac only)
- **iOS Simulator** or physical iOS device

For Android development:
- **Android Studio**
- **Android Emulator** or physical Android device

## Backend Setup

Make sure your Payy ZK Rollup backend is running:

1. Start the Ethereum node:
```bash
cd ../eth
yarn eth-node
```

2. Deploy contracts (in a new terminal):
```bash
cd ../eth
DEV_USE_NOOP_VERIFIER=1 yarn deploy:local
```

3. Start the Payy node (in a new terminal):
```bash
cd ..
cargo run --release --bin node -- --mode mock-prover
```

Your backend should now be running on:
- Ethereum: `http://localhost:8545`
- Payy Node: `http://localhost:8080`

## Installation

1. Navigate to the mobile app directory:
```bash
cd mobile-app
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

## Configuration

### API Endpoint Configuration

Edit `src/api/payyApi.js` and update the `BASE_URL` based on your development environment:

- **iOS Simulator**: `http://localhost:8080` (default)
- **Android Emulator**: `http://10.0.2.2:8080`
- **Physical Device**: `http://YOUR_COMPUTER_IP:8080` (e.g., `http://192.168.1.100:8080`)

To find your computer's IP address:
- **Mac/Linux**: Run `ifconfig | grep "inet " | grep -v 127.0.0.1`
- **Windows**: Run `ipconfig` and look for IPv4 Address

### Example Configuration for Physical Device

```javascript
// src/api/payyApi.js
const BASE_URL = 'http://192.168.1.100:8080'; // Replace with your IP
```

## Running the App

### Start the development server:
```bash
npm start
# or
yarn start
```

This will open the Expo Dev Tools in your browser.

### Run on iOS Simulator:
```bash
npm run ios
# or
yarn ios
```

Or press `i` in the Expo Dev Tools terminal.

### Run on Android Emulator:
```bash
npm run android
# or
yarn android
```

Or press `a` in the Expo Dev Tools terminal.

### Run on Physical Device:

1. Install the **Expo Go** app on your device:
   - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)
   - [Android Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. Scan the QR code shown in Expo Dev Tools with your device's camera
3. The app will open in Expo Go

## Screens

### Home Screen
- Node information (network, version)
- Current block height and root hash
- Transaction statistics
- Health status indicator
- Quick navigation to Blocks and Transactions

### Blocks Screen
- List of recent blocks
- Block height, hash, and timestamp
- Transaction count per block
- Validator information
- Pull-to-refresh

### Transactions Screen
- List of recent transactions
- Transaction hash and status
- Block height reference
- Amount and fee information
- Transaction type
- Pull-to-refresh

## Troubleshooting

### Cannot connect to backend

**Issue**: App shows "Failed to fetch data" or connection errors.

**Solutions**:
1. Verify backend is running: `curl http://localhost:8080/`
2. Check firewall settings - ensure port 8080 is accessible
3. For physical devices, make sure your phone and computer are on the same WiFi network
4. Update the `BASE_URL` in `src/api/payyApi.js` with your correct IP address
5. On Mac, you may need to disable firewall or add an exception for Node

### iOS Simulator not connecting

Try using your computer's actual IP address instead of `localhost`:
```javascript
const BASE_URL = 'http://192.168.1.X:8080';
```

### Android Emulator not connecting

Use the special Android emulator IP:
```javascript
const BASE_URL = 'http://10.0.2.2:8080';
```

### Port 8080 already in use

If you get a port conflict, you can change the Payy node port:
```bash
cargo run --release --bin node -- --mode mock-prover --rpc-laddr 0.0.0.0:8081
```

Then update `BASE_URL` in the app to match the new port.

## Development

### Project Structure

```
mobile-app/
├── App.js                      # Main app component with navigation
├── package.json                # Dependencies and scripts
├── app.json                    # Expo configuration
├── babel.config.js             # Babel configuration
└── src/
    ├── api/
    │   └── payyApi.js         # API client for backend
    └── screens/
        ├── HomeScreen.js      # Home dashboard
        ├── BlocksScreen.js    # Blocks list
        └── TransactionsScreen.js  # Transactions list
```

### Adding New Features

1. **Add new API endpoints**: Edit `src/api/payyApi.js`
2. **Create new screens**: Add to `src/screens/`
3. **Add navigation**: Update routes in `App.js`

## Building for Production

### iOS

```bash
expo build:ios
```

### Android

```bash
expo build:android
```

For more details, see [Expo Build Documentation](https://docs.expo.dev/build/setup/).

## Technologies Used

- **React Native** - Mobile framework
- **Expo** - Development platform
- **React Navigation** - Navigation
- **React Native Paper** - Material Design UI components
- **Axios** - HTTP client

## License

Same as the main Payy ZK Rollup project.

## Support

For issues related to the mobile app, please check the troubleshooting section above or open an issue in the main repository.

