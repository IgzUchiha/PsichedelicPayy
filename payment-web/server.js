/**
 * PSI Payment Links Web Service
 * 
 * Serves:
 * - Payment landing page for users without the app
 * - Apple App Site Association for iOS Universal Links
 * - Android Asset Links for Android App Links
 */

const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuration - UPDATE THESE VALUES
const CONFIG = {
  // Apple Team ID from Apple Developer Portal
  APPLE_TEAM_ID: process.env.APPLE_TEAM_ID || 'YOUR_TEAM_ID',
  
  // iOS Bundle ID
  IOS_BUNDLE_ID: 'com.payy.zkrollup',
  
  // Android Package Name
  ANDROID_PACKAGE: 'com.payy.zkrollup',
  
  // Android SHA256 Fingerprint (from your signing key)
  ANDROID_SHA256: process.env.ANDROID_SHA256 || 'YOUR_SHA256_FINGERPRINT',
  
  // App Store and Play Store URLs
  APP_STORE_URL: 'https://apps.apple.com/app/psi',
  PLAY_STORE_URL: 'https://play.google.com/store/apps/details?id=com.payy.zkrollup',
  
  // Brand colors
  BRAND_PURPLE: '#6F34D5',
};

// Middleware to parse JSON
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'psi-payment-web' });
});

// Apple App Site Association - iOS Universal Links
app.get('/.well-known/apple-app-site-association', (req, res) => {
  const aasa = {
    applinks: {
      apps: [],
      details: [
        {
          appIDs: [`${CONFIG.APPLE_TEAM_ID}.${CONFIG.IOS_BUNDLE_ID}`],
          paths: ['/p/*', '/pay/*'],
        },
      ],
    },
    webcredentials: {
      apps: [`${CONFIG.APPLE_TEAM_ID}.${CONFIG.IOS_BUNDLE_ID}`],
    },
  };
  
  res.setHeader('Content-Type', 'application/json');
  res.json(aasa);
});

// Android Asset Links - Android App Links
app.get('/.well-known/assetlinks.json', (req, res) => {
  const assetLinks = [
    {
      relation: ['delegate_permission/common.handle_all_urls'],
      target: {
        namespace: 'android_app',
        package_name: CONFIG.ANDROID_PACKAGE,
        sha256_cert_fingerprints: [CONFIG.ANDROID_SHA256],
      },
    },
  ];
  
  res.setHeader('Content-Type', 'application/json');
  res.json(assetLinks);
});

// Payment landing page
app.get('/p/:paymentId', (req, res) => {
  const { paymentId } = req.params;
  const { a, c, r, rn, e, n, s, v } = req.query;
  
  // Parse payment data
  const amount = a ? parseInt(a, 10) / 100 : 0;
  const currency = c || 'USD';
  const recipientName = rn ? decodeURIComponent(rn) : null;
  const expiresAt = e ? parseInt(e, 10) : null;
  const note = n ? decodeURIComponent(n) : null;
  
  // Check expiration
  const isExpired = expiresAt ? Date.now() > expiresAt : false;
  
  // Format expiration
  let expirationText = '';
  if (expiresAt) {
    const diff = expiresAt - Date.now();
    if (diff <= 0) {
      expirationText = 'Expired';
    } else {
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      if (hours >= 24) {
        const days = Math.floor(hours / 24);
        expirationText = `Expires in ${days} day${days > 1 ? 's' : ''}`;
      } else if (hours > 0) {
        expirationText = `Expires in ${hours}h ${minutes}m`;
      } else {
        expirationText = `Expires in ${minutes} min`;
      }
    }
  }
  
  // Build deep link
  const queryString = new URLSearchParams(req.query).toString();
  const deepLink = `psi://pay/${paymentId}?${queryString}`;
  
  // Send HTML page
  res.send(generatePaymentPage({
    paymentId,
    amount,
    currency,
    recipientName,
    note,
    expirationText,
    isExpired,
    deepLink,
  }));
});

// Alternative path format
app.get('/pay/:paymentId', (req, res) => {
  // Redirect to /p/ format
  const queryString = new URLSearchParams(req.query).toString();
  res.redirect(`/p/${req.params.paymentId}?${queryString}`);
});

// Root redirect
app.get('/', (req, res) => {
  res.redirect('https://psichedeliclabs.com');
});

// Generate payment landing page HTML
function generatePaymentPage(data) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>PSI Payment Request</title>
    
    <!-- Open Graph / Social Media -->
    <meta property="og:type" content="website">
    <meta property="og:title" content="PSI Payment Request - $${data.amount.toFixed(2)}">
    <meta property="og:description" content="${data.recipientName || 'Someone'} is requesting $${data.amount.toFixed(2)} via PSI - Private, Instant, Zero-Knowledge payments.">
    <meta property="og:image" content="https://psichedeliclabs.com/og-image.png">
    
    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="PSI Payment Request - $${data.amount.toFixed(2)}">
    <meta name="twitter:description" content="Private, Instant, Zero-Knowledge payments">
    
    <!-- App Links -->
    <meta property="al:ios:app_store_id" content="YOUR_APP_STORE_ID">
    <meta property="al:ios:app_name" content="PSI">
    <meta property="al:ios:url" content="${data.deepLink}">
    <meta property="al:android:package" content="${CONFIG.ANDROID_PACKAGE}">
    <meta property="al:android:app_name" content="PSI">
    <meta property="al:android:url" content="${data.deepLink}">
    
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            background: linear-gradient(135deg, ${CONFIG.BRAND_PURPLE} 0%, #5821B0 100%);
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 20px;
            color: #fff;
        }
        
        .container {
            max-width: 400px;
            width: 100%;
            text-align: center;
        }
        
        .logo {
            width: 80px;
            height: 80px;
            margin-bottom: 24px;
        }
        
        .logo svg {
            width: 100%;
            height: 100%;
        }
        
        .card {
            background: #fff;
            border-radius: 24px;
            padding: 32px 24px;
            margin-bottom: 24px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        
        .shield-icon {
            width: 48px;
            height: 48px;
            margin: 0 auto 16px;
        }
        
        .label {
            font-size: 16px;
            color: #666;
            margin-bottom: 8px;
        }
        
        .amount {
            font-size: 56px;
            font-weight: 700;
            color: #000;
            margin-bottom: 8px;
        }
        
        .note {
            font-size: 16px;
            color: #666;
            font-style: italic;
            margin-bottom: 16px;
        }
        
        .expiration {
            display: inline-block;
            background: ${data.isExpired ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.2)'};
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            margin-bottom: 24px;
            color: ${data.isExpired ? '#FCA5A5' : '#fff'};
        }
        
        .zk-info {
            background: rgba(255,255,255,0.1);
            border-radius: 16px;
            padding: 16px;
            margin-bottom: 24px;
        }
        
        .zk-info h3 {
            font-size: 16px;
            margin-bottom: 8px;
        }
        
        .zk-info p {
            font-size: 14px;
            opacity: 0.8;
            line-height: 1.5;
        }
        
        .btn {
            display: block;
            width: 100%;
            padding: 18px 24px;
            border-radius: 14px;
            font-size: 18px;
            font-weight: 700;
            text-decoration: none;
            text-align: center;
            cursor: pointer;
            border: none;
            transition: transform 0.2s, opacity 0.2s;
        }
        
        .btn:hover {
            transform: translateY(-2px);
        }
        
        .btn:active {
            transform: translateY(0);
        }
        
        .btn-primary {
            background: #fff;
            color: ${CONFIG.BRAND_PURPLE};
            margin-bottom: 12px;
        }
        
        .btn-secondary {
            background: rgba(255,255,255,0.2);
            color: #fff;
        }
        
        .store-badges {
            display: flex;
            gap: 12px;
            justify-content: center;
            margin-top: 24px;
        }
        
        .store-badge {
            height: 44px;
            border-radius: 8px;
        }
        
        .footer {
            margin-top: 32px;
            font-size: 12px;
            opacity: 0.6;
        }
        
        .footer a {
            color: #fff;
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Logo -->
        <div class="logo">
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="50" cy="50" r="45" fill="white"/>
                <text x="50" y="65" text-anchor="middle" font-size="40" font-weight="bold" fill="${CONFIG.BRAND_PURPLE}">PSI</text>
            </svg>
        </div>
        
        <!-- Payment Card -->
        <div class="card">
            <div class="shield-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="${CONFIG.BRAND_PURPLE}" stroke-width="2">
                    <path d="M12 2L4 6V12C4 16.42 7.36 20.54 12 21.66C16.64 20.54 20 16.42 20 12V6L12 2Z"/>
                    <path d="M9 12L11 14L15 10"/>
                </svg>
            </div>
            <p class="label">${data.recipientName || 'Someone'} is requesting</p>
            <p class="amount">$${data.amount.toFixed(2)}</p>
            ${data.note ? `<p class="note">"${data.note}"</p>` : ''}
        </div>

        <!-- Expiration -->
        ${data.expirationText ? `<div class="expiration">${data.expirationText}</div>` : ''}

        <!-- ZK Info -->
        <div class="zk-info">
            <h3>🔐 Zero-Knowledge Payment</h3>
            <p>This payment is secured by zero-knowledge cryptography. Only you and the sender will know the details.</p>
        </div>
        
        <!-- Actions -->
        <a href="${data.deepLink}" class="btn btn-primary" id="openApp">Open in PSI App</a>
        <a href="${CONFIG.APP_STORE_URL}" class="btn btn-secondary" id="downloadApp">Download PSI App</a>
        
        <!-- Store Badges -->
        <div class="store-badges">
            <a href="${CONFIG.APP_STORE_URL}" target="_blank">
                <img src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg" alt="Download on App Store" class="store-badge">
            </a>
            <a href="${CONFIG.PLAY_STORE_URL}" target="_blank">
                <img src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png" alt="Get it on Google Play" class="store-badge" style="height: 66px; margin-top: -11px;">
            </a>
        </div>
        
        <!-- Footer -->
        <div class="footer">
            <p>Powered by <a href="https://psichedeliclabs.com">PSI</a> - Private payments for everyone</p>
        </div>
    </div>
    
    <script>
        // Try to open app automatically on mobile
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        const deepLink = "${data.deepLink}";
        const appStoreUrl = "${CONFIG.APP_STORE_URL}";
        const playStoreUrl = "${CONFIG.PLAY_STORE_URL}";
        
        document.getElementById('openApp').addEventListener('click', function(e) {
            e.preventDefault();
            
            // Try deep link
            window.location.href = deepLink;
            
            // Fallback to store after timeout
            setTimeout(function() {
                if (document.hidden) return; // App opened successfully
                
                if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
                    window.location.href = appStoreUrl;
                } else if (/Android/i.test(navigator.userAgent)) {
                    window.location.href = playStoreUrl;
                }
            }, 2000);
        });
        
        // Update download button based on platform
        const downloadBtn = document.getElementById('downloadApp');
        if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
            downloadBtn.href = appStoreUrl;
        } else if (/Android/i.test(navigator.userAgent)) {
            downloadBtn.href = playStoreUrl;
        }
    </script>
</body>
</html>`;
}

// Start server
app.listen(PORT, () => {
  console.log(`PSI Payment Web Service running on port ${PORT}`);
  console.log(`  - Health: http://localhost:${PORT}/health`);
  console.log(`  - AASA: http://localhost:${PORT}/.well-known/apple-app-site-association`);
  console.log(`  - Asset Links: http://localhost:${PORT}/.well-known/assetlinks.json`);
});
