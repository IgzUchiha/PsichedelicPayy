/**
 * Deep Linking Configuration for PSI Payment Links
 * 
 * Handles:
 * - Custom URL scheme: psi://pay/[paymentId]?params
 * - Universal links: https://pay.psichedeliclabs.com/p/[paymentId]?params
 */

import * as Linking from 'expo-linking';

// App URL scheme
export const APP_SCHEME = 'psi';

// Universal link domains
export const UNIVERSAL_LINK_DOMAINS = [
  'pay.psichedeliclabs.com',
  'psichedeliclabs.com',
];

/**
 * React Navigation linking configuration
 */
export const linkingConfig = {
  prefixes: [
    Linking.createURL('/'),
    'psi://',
    'https://pay.psichedeliclabs.com',
    'https://psichedeliclabs.com',
  ],
  config: {
    screens: {
      // Payment link claiming screen
      ClaimPayment: {
        path: 'p/:paymentId',
        parse: {
          paymentId: (paymentId) => paymentId,
        },
      },
      // Alternative path format
      ClaimPaymentAlt: {
        path: 'pay/:paymentId',
        parse: {
          paymentId: (paymentId) => paymentId,
        },
      },
      // Direct pay screen (for custom scheme)
      PayScreen: 'pay',
      // Home tabs
      HomeTabs: {
        screens: {
          Home: 'home',
          Transactions: 'activity',
          Settings: 'settings',
        },
      },
    },
  },
};

/**
 * Parse a payment link URL and extract parameters
 * @param {string} url - The payment link URL
 * @returns {Object|null} Parsed payment data or null
 */
export function parsePaymentUrl(url) {
  try {
    const parsed = Linking.parse(url);
    
    // Extract payment ID from path
    let paymentId = null;
    if (parsed.path) {
      // Handle /p/[id] or /pay/[id] patterns
      const pathMatch = parsed.path.match(/^(?:p|pay)\/([a-zA-Z0-9_-]+)/);
      if (pathMatch) {
        paymentId = pathMatch[1];
      }
    }
    
    if (!paymentId) {
      return null;
    }
    
    // Parse query parameters
    const params = parsed.queryParams || {};
    
    return {
      paymentId,
      amount: params.a ? parseInt(params.a, 10) : null, // cents
      amountUsd: params.a ? parseInt(params.a, 10) / 100 : null, // dollars
      currency: params.c || 'USD',
      recipient: params.r || null,
      recipientName: params.rn ? decodeURIComponent(params.rn) : null,
      expiresAt: params.e ? parseInt(params.e, 10) : null,
      signature: params.s || null,
      note: params.n ? decodeURIComponent(params.n) : null,
      version: params.v ? parseInt(params.v, 10) : 1,
      rawUrl: url,
    };
  } catch (error) {
    console.error('Failed to parse payment URL:', error);
    return null;
  }
}

/**
 * Check if a URL is a valid PSI payment link
 * @param {string} url - URL to check
 * @returns {boolean}
 */
export function isPaymentLink(url) {
  if (!url) return false;
  
  // Check custom scheme
  if (url.startsWith('psi://pay/') || url.startsWith('psi://p/')) {
    return true;
  }
  
  // Check universal links
  for (const domain of UNIVERSAL_LINK_DOMAINS) {
    if (url.includes(domain) && (url.includes('/p/') || url.includes('/pay/'))) {
      return true;
    }
  }
  
  return false;
}

/**
 * Generate a deep link URL for a payment
 * @param {string} paymentId - Payment ID
 * @param {Object} params - Payment parameters
 * @returns {string} Deep link URL
 */
export function generateDeepLink(paymentId, params = {}) {
  const queryParams = new URLSearchParams();
  
  if (params.amount) queryParams.set('a', params.amount.toString());
  if (params.currency) queryParams.set('c', params.currency);
  if (params.recipient) queryParams.set('r', params.recipient);
  if (params.recipientName) queryParams.set('rn', encodeURIComponent(params.recipientName));
  if (params.expiresAt) queryParams.set('e', params.expiresAt.toString());
  if (params.signature) queryParams.set('s', params.signature);
  if (params.note) queryParams.set('n', encodeURIComponent(params.note));
  if (params.version) queryParams.set('v', params.version.toString());
  
  const queryString = queryParams.toString();
  return `psi://pay/${paymentId}${queryString ? '?' + queryString : ''}`;
}

/**
 * Get the initial URL that opened the app (if any)
 * @returns {Promise<string|null>}
 */
export async function getInitialPaymentLink() {
  try {
    const url = await Linking.getInitialURL();
    if (url && isPaymentLink(url)) {
      return parsePaymentUrl(url);
    }
    return null;
  } catch (error) {
    console.error('Error getting initial URL:', error);
    return null;
  }
}

/**
 * Subscribe to incoming payment links while app is running
 * @param {Function} callback - Called with parsed payment data
 * @returns {Function} Unsubscribe function
 */
export function subscribeToPaymentLinks(callback) {
  const subscription = Linking.addEventListener('url', ({ url }) => {
    if (isPaymentLink(url)) {
      const paymentData = parsePaymentUrl(url);
      if (paymentData) {
        callback(paymentData);
      }
    }
  });
  
  return () => subscription.remove();
}

export default {
  APP_SCHEME,
  UNIVERSAL_LINK_DOMAINS,
  linkingConfig,
  parsePaymentUrl,
  isPaymentLink,
  generateDeepLink,
  getInitialPaymentLink,
  subscribeToPaymentLinks,
};
