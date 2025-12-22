// Multi-chain configuration and utilities
import { Wallet, computeAddress } from 'ethers';

export const CHAINS = {
  ETH: {
    id: 'eth',
    name: 'Ethereum',
    symbol: 'ETH',
    icon: '⟠',
    color: '#627EEA',
    decimals: 18,
  },
  BTC: {
    id: 'btc',
    name: 'Bitcoin',
    symbol: 'BTC',
    icon: '₿',
    color: '#F7931A',
    decimals: 8,
  },
  SOL: {
    id: 'sol',
    name: 'Solana',
    symbol: 'SOL',
    icon: '◎',
    color: '#9945FF',
    decimals: 9,
  },
  POLYGON: {
    id: 'polygon',
    name: 'Polygon',
    symbol: 'MATIC',
    icon: '⬡',
    color: '#8247E5',
    decimals: 18,
  },
};

export const SUPPORTED_CHAINS = ['ETH', 'BTC', 'SOL', 'POLYGON'];

// Derive EVM address from private key
export function deriveEVMAddress(privateKey) {
  const cleanKey = privateKey.startsWith('0x') ? privateKey : '0x' + privateKey;
  return computeAddress(cleanKey);
}

// Derive Bitcoin address from private key (simplified - P2PKH)
// In production, use a proper BTC library like bitcoinjs-lib
export function deriveBTCAddress(privateKey) {
  // For demo: derive a mock BTC address from the ETH private key
  // Real implementation would use secp256k1 + RIPEMD160 + Base58Check
  const evmAddr = deriveEVMAddress(privateKey);
  // Convert to BTC-like format (this is a placeholder)
  const btcPrefix = '1'; // Mainnet P2PKH
  const hash = evmAddr.slice(2, 34); // Use part of ETH address
  return `${btcPrefix}${hash}`;
}

// Derive Solana address from private key (simplified)
// In production, use @solana/web3.js
export function deriveSOLAddress(privateKey) {
  // For demo: derive a mock SOL address
  // Real implementation would use Ed25519 keypair
  const evmAddr = deriveEVMAddress(privateKey);
  // Solana addresses are base58 encoded 32-byte public keys
  return evmAddr.slice(2, 46); // Placeholder
}

// Get address for a specific chain
export function getAddressForChain(privateKey, chainId) {
  switch (chainId) {
    case 'eth':
    case 'polygon':
      return deriveEVMAddress(privateKey);
    case 'btc':
      return deriveBTCAddress(privateKey);
    case 'sol':
      return deriveSOLAddress(privateKey);
    default:
      return deriveEVMAddress(privateKey);
  }
}

// Format address for display (shortened)
export function formatAddress(address, length = 8) {
  if (!address || address.length < length * 2) return address;
  return `${address.slice(0, length)}...${address.slice(-length)}`;
}

// Validate address format for chain
export function isValidAddress(address, chainId) {
  if (!address) return false;
  
  switch (chainId) {
    case 'eth':
    case 'polygon':
      return /^0x[a-fA-F0-9]{40}$/.test(address);
    case 'btc':
      return /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(address) || 
             /^bc1[a-z0-9]{39,59}$/.test(address); // Bech32
    case 'sol':
      return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
    default:
      return true;
  }
}

export default CHAINS;
