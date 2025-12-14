import axios from 'axios';

// Update this to your machine's IP address if testing on physical device
// or use 'localhost' for simulator
const BASE_URL = 'http://192.168.1.71:8080';

// For iOS simulator, use: http://localhost:8080
// For Android emulator, use: http://10.0.2.2:8080
// For physical device, use your computer's IP: http://192.168.1.X:8080

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
      return response.data;
    } catch (error) {
      console.error('Error fetching health:', error);
      throw error;
    }
  },

  // Get current block height
  getHeight: async () => {
    try {
      const response = await api.get('/v0/height');
      return response.data;
    } catch (error) {
      console.error('Error fetching height:', error);
      throw error;
    }
  },

  // Get stats
  getStats: async () => {
    try {
      const response = await api.get('/v0/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching stats:', error);
      throw error;
    }
  },

  // List blocks
  listBlocks: async (limit = 10, offset = 0) => {
    try {
      const response = await api.get('/v0/blocks', {
        params: { limit, offset },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching blocks:', error);
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
    try {
      const response = await api.get('/v0/transactions', {
        params: { limit, offset },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching transactions:', error);
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
};

export default payyApi;

