import axios from 'axios';

// Use environment variable or fallback to localhost
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080';

// For iOS simulator, use: http://localhost:8080
// For Android emulator, use: http://10.0.2.2:8080
// For physical device, use your computer's IP: http://192.168.1.X:8080

// Track if backend is available to avoid repeated timeout waits
let backendAvailable = null;
let lastBackendCheck = 0;
const BACKEND_CHECK_INTERVAL = 30000; // Check every 30 seconds

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 3000, // Reduced from 10s to 3s for faster failure
  headers: {
    'Content-Type': 'application/json',
  },
});

// Quick check if we should skip API calls (backend known to be down)
const shouldSkipCall = () => {
  if (backendAvailable === false && Date.now() - lastBackendCheck < BACKEND_CHECK_INTERVAL) {
    return true;
  }
  return false;
};

// Update backend status
const updateBackendStatus = (isAvailable) => {
  backendAvailable = isAvailable;
  lastBackendCheck = Date.now();
};

export const payyApi = {
  // Get node info
  getNodeInfo: async () => {
    try {
      const response = await api.get('/');
      return response.data;
    } catch (error) {
      console.error('Error fetching node info:', error);
      throw error;
    }
  },

  // Get health status
  getHealth: async () => {
    try {
      const response = await api.get('/v0/health');
      updateBackendStatus(true);
      return response.data;
    } catch (error) {
      updateBackendStatus(false);
      throw error;
    }
  },

  // Get current block height
  getHeight: async () => {
    if (shouldSkipCall()) return null;
    try {
      const response = await api.get('/v0/height');
      updateBackendStatus(true);
      return response.data;
    } catch (error) {
      updateBackendStatus(false);
      throw error;
    }
  },

  // Get stats
  getStats: async () => {
    if (shouldSkipCall()) return null;
    try {
      const response = await api.get('/v0/stats');
      updateBackendStatus(true);
      return response.data;
    } catch (error) {
      updateBackendStatus(false);
      throw error;
    }
  },

  // List blocks
  listBlocks: async (limit = 10, offset = 0) => {
    if (shouldSkipCall()) return [];
    try {
      const response = await api.get('/v0/blocks', {
        params: { limit, offset },
      });
      updateBackendStatus(true);
      return response.data;
    } catch (error) {
      updateBackendStatus(false);
      throw error;
    }
  },

  // Get specific block
  getBlock: async (blockHeight) => {
    try {
      const response = await api.get(`/v0/blocks/${blockHeight}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching block:', error);
      throw error;
    }
  },

  // List transactions
  listTransactions: async (limit = 10, offset = 0) => {
    if (shouldSkipCall()) return [];
    try {
      const response = await api.get('/v0/transactions', {
        params: { limit, offset },
      });
      updateBackendStatus(true);
      return response.data;
    } catch (error) {
      updateBackendStatus(false);
      throw error;
    }
  },

  // Get specific transaction
  getTransaction: async (hash) => {
    try {
      const response = await api.get(`/v0/transactions/${hash}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching transaction:', error);
      throw error;
    }
  },

  // Submit transaction
  submitTransaction: async (txData) => {
    try {
      const response = await api.post('/v0/transactions', txData);
      return response.data;
    } catch (error) {
      console.error('Error submitting transaction:', error);
      throw error;
    }
  },

  // Get elements
  listElements: async (elements) => {
    try {
      const response = await api.get('/v0/elements', {
        params: { elements: elements.join(',') },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching elements:', error);
      throw error;
    }
  },

  // Get merkle paths
  getMerklePaths: async (elements) => {
    try {
      const response = await api.get('/v0/merkle', {
        params: { elements: elements.join(',') },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching merkle paths:', error);
      throw error;
    }
  },

  // === Proving Endpoints ===

  // Derive address from secret key
  deriveAddress: async (secretKey) => {
    try {
      const response = await api.post('/v0/prove/derive-address', {
        secret_key: secretKey,
      });
      return response.data;
    } catch (error) {
      console.error('Error deriving address:', error);
      throw error;
    }
  },

  // Generate random psi for a new note
  generatePsi: async () => {
    try {
      const response = await api.get('/v0/prove/generate-psi');
      return response.data;
    } catch (error) {
      console.error('Error generating psi:', error);
      throw error;
    }
  },

  // Calculate note commitment
  calculateCommitment: async (note) => {
    try {
      const response = await api.post('/v0/prove/commitment', note);
      return response.data;
    } catch (error) {
      console.error('Error calculating commitment:', error);
      throw error;
    }
  },

  // Generate transfer proof
  generateTransferProof: async (proofRequest) => {
    try {
      const response = await api.post('/v0/prove/transfer', proofRequest, {
        timeout: 120000, // 2 minute timeout for proof generation
      });
      return response.data;
    } catch (error) {
      console.error('Error generating proof:', error);
      throw error;
    }
  },

  // Request test tokens from faucet (development only)
  requestFaucet: async (address, amount = 100000000) => {
    try {
      const response = await api.post('/v0/prove/faucet', {
        address,
        amount,
      }, {
        timeout: 120000, // 2 minute timeout for proof generation
      });
      return response.data;
    } catch (error) {
      console.error('Error requesting faucet:', error);
      throw error;
    }
  },

  // Get merkle paths for note commitments (with current root)
  getMerklePathsForNotes: async (commitments) => {
    try {
      const response = await api.post('/v0/prove/merkle-paths', {
        commitments,
      }, {
        timeout: 30000,
      });
      return response.data;
    } catch (error) {
      console.error('Error getting merkle paths:', error);
      throw error;
    }
  },

  // === Payment Links API ===

  /**
   * Create a new payment link (stored server-side for validation)
   * @param {Object} paymentData - Payment link data
   * @returns {Object} Created payment link with server-assigned ID
   */
  createPaymentLink: async (paymentData) => {
    try {
      const response = await api.post('/v0/payment-links', {
        payment_id: paymentData.paymentId,
        amount_cents: paymentData.amount,
        currency: paymentData.currency,
        recipient: paymentData.recipient,
        recipient_name: paymentData.recipientName,
        note: paymentData.note,
        expires_at: paymentData.expiresAt,
        signature: paymentData.signature,
        version: paymentData.version || 1,
      });
      updateBackendStatus(true);
      return response.data;
    } catch (error) {
      updateBackendStatus(false);
      console.error('Error creating payment link:', error);
      throw error;
    }
  },

  /**
   * Get payment link details by ID
   * @param {string} paymentId - The payment link ID
   * @returns {Object} Payment link data
   */
  getPaymentLink: async (paymentId) => {
    try {
      const response = await api.get(`/v0/payment-links/${paymentId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching payment link:', error);
      throw error;
    }
  },

  /**
   * Validate a payment link (check signature, expiration, status)
   * @param {string} paymentId - The payment link ID
   * @param {Object} params - URL parameters for signature verification
   * @returns {Object} Validation result
   */
  validatePaymentLink: async (paymentId, params) => {
    try {
      const response = await api.post(`/v0/payment-links/${paymentId}/validate`, {
        amount_cents: params.amount,
        currency: params.currency,
        recipient: params.recipient,
        expires_at: params.expiresAt,
        signature: params.signature,
      });
      return response.data;
    } catch (error) {
      console.error('Error validating payment link:', error);
      throw error;
    }
  },

  /**
   * Claim a payment link (initiate ZK transfer to claimer)
   * @param {string} paymentId - The payment link ID
   * @param {Object} claimData - Claimer's wallet info and proof
   * @returns {Object} Claim result with transaction info
   */
  claimPaymentLink: async (paymentId, claimData) => {
    try {
      const response = await api.post(`/v0/payment-links/${paymentId}/claim`, {
        claimer_address: claimData.claimerAddress,
        claimer_public_key: claimData.claimerPublicKey,
        proof: claimData.proof, // ZK proof of authorization
      }, {
        timeout: 120000, // 2 min for ZK proof verification
      });
      return response.data;
    } catch (error) {
      console.error('Error claiming payment link:', error);
      throw error;
    }
  },

  /**
   * Cancel a payment link (only by creator)
   * @param {string} paymentId - The payment link ID
   * @param {Object} cancelData - Creator signature for authorization
   * @returns {Object} Cancellation result
   */
  cancelPaymentLink: async (paymentId, cancelData) => {
    try {
      const response = await api.post(`/v0/payment-links/${paymentId}/cancel`, {
        signature: cancelData.signature,
        recipient: cancelData.recipient,
      });
      return response.data;
    } catch (error) {
      console.error('Error cancelling payment link:', error);
      throw error;
    }
  },

  /**
   * List payment links for a user
   * @param {string} address - User's wallet address
   * @param {Object} options - Filter options
   * @returns {Array} List of payment links
   */
  listPaymentLinks: async (address, options = {}) => {
    if (shouldSkipCall()) return [];
    try {
      const response = await api.get('/v0/payment-links', {
        params: {
          address,
          status: options.status, // 'pending', 'claimed', 'expired', 'cancelled'
          type: options.type, // 'sent', 'received'
          limit: options.limit || 50,
          offset: options.offset || 0,
        },
      });
      updateBackendStatus(true);
      return response.data;
    } catch (error) {
      updateBackendStatus(false);
      console.error('Error listing payment links:', error);
      throw error;
    }
  },

  /**
   * Get ZK proof for claiming a payment link
   * @param {string} paymentId - The payment link ID
   * @param {Object} claimRequest - Claim request details
   * @returns {Object} Generated ZK proof
   */
  generateClaimProof: async (paymentId, claimRequest) => {
    try {
      const response = await api.post(`/v0/payment-links/${paymentId}/generate-proof`, {
        claimer_address: claimRequest.claimerAddress,
        claimer_secret_key: claimRequest.claimerSecretKey,
        amount_cents: claimRequest.amountCents,
      }, {
        timeout: 180000, // 3 min for proof generation
      });
      return response.data;
    } catch (error) {
      console.error('Error generating claim proof:', error);
      throw error;
    }
  },
};

export default payyApi;

