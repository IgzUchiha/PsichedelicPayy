# Quick Start Guide

Get the Payy mobile app running in 5 minutes!

## Step 1: Install Dependencies

```bash
cd mobile-app
npm install
```

## Step 2: Configure API Endpoint

Edit `src/api/payyApi.js` and set your backend URL:

### For iOS Simulator (Mac):
```javascript
const BASE_URL = 'http://localhost:8080';  // Already set as default
```

### For Android Emulator:
```javascript
const BASE_URL = 'http://10.0.2.2:8080';
```

### For Physical Device:
Find your computer's IP:
```bash
# Mac/Linux
ifconfig | grep "inet " | grep -v 127.0.0.1

# Windows
ipconfig
```

Then update:
```javascript
const BASE_URL = 'http://YOUR_IP:8080';  // e.g., http://192.168.1.100:8080
```

## Step 3: Verify Backend is Running

Make sure your Payy backend is running:

```bash
# Check if backend is accessible
curl http://localhost:8080/

# Should return:
# { "network": "polybase", "service": "node", "version": "1.3.0" }
```

## Step 4: Start the App

```bash
npm start
```

Then:
- Press `i` for iOS simulator
- Press `a` for Android emulator  
- Scan QR code with Expo Go app on your phone

## That's it! 🎉

You should now see the Payy ZK Rollup app with:
- ✅ Node status and chain info
- ✅ Block explorer
- ✅ Transaction viewer

## Need Help?

See the full [README.md](./README.md) for detailed troubleshooting.

