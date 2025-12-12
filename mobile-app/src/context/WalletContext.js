import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';

const WalletContext = createContext(null);

const WALLET_STORAGE_KEY = 'payy_wallet';

export function WalletProvider({ children }) {
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(null);

  // Load wallet from secure storage on app start
  useEffect(() => {
    loadWallet();
  }, []);

  const loadWallet = async () => {
    try {
      const storedWallet = await SecureStore.getItemAsync(WALLET_STORAGE_KEY);
      if (storedWallet) {
        const walletData = JSON.parse(storedWallet);
        setWallet(walletData);
        // Fetch balance for the loaded wallet
        await fetchBalance(walletData.address);
      }
    } catch (error) {
      console.error('Error loading wallet:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBalance = async (address) => {
    try {
      // Try to fetch real balance from API
      const response = await fetch(`http://localhost:8080/v0/balance/${address}`);
      if (response.ok) {
        const data = await response.json();
        setBalance({
          total: data.balance || '0.00',
          change: data.change || 0,
          changePercent: data.changePercent || 0,
        });
      } else {
        // Use demo balance if API fails
        setBalance({
          total: '0.00',
          change: 0,
          changePercent: 0,
        });
      }
    } catch (error) {
      // Fallback to demo balance
      setBalance({
        total: '0.00',
        change: 0,
        changePercent: 0,
      });
    }
  };

  const importWallet = async (privateKey, name = 'My Wallet') => {
    try {
      // Validate private key format (basic validation)
      const cleanKey = privateKey.trim();
      if (!isValidPrivateKey(cleanKey)) {
        throw new Error('Invalid private key format');
      }

      // Derive address from private key (simplified - in production use proper crypto)
      const address = deriveAddress(cleanKey);

      const walletData = {
        name,
        address,
        privateKey: cleanKey,
        importedAt: Date.now(),
      };

      // Store securely
      await SecureStore.setItemAsync(WALLET_STORAGE_KEY, JSON.stringify(walletData));
      setWallet(walletData);
      
      // Fetch balance
      await fetchBalance(address);

      return { success: true, address };
    } catch (error) {
      console.error('Error importing wallet:', error);
      return { success: false, error: error.message };
    }
  };

  const removeWallet = async () => {
    try {
      await SecureStore.deleteItemAsync(WALLET_STORAGE_KEY);
      setWallet(null);
      setBalance(null);
      return { success: true };
    } catch (error) {
      console.error('Error removing wallet:', error);
      return { success: false, error: error.message };
    }
  };

  const refreshBalance = async () => {
    if (wallet?.address) {
      await fetchBalance(wallet.address);
    }
  };

  return (
    <WalletContext.Provider
      value={{
        wallet,
        balance,
        loading,
        importWallet,
        removeWallet,
        refreshBalance,
        hasWallet: !!wallet,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}

// Helper functions
function isValidPrivateKey(key) {
  // Support hex format (with or without 0x prefix)
  const hexPattern = /^(0x)?[a-fA-F0-9]{64}$/;
  // Support base64 format
  const base64Pattern = /^[A-Za-z0-9+/]{43,44}=?$/;
  
  return hexPattern.test(key) || base64Pattern.test(key);
}

function deriveAddress(privateKey) {
  // Simplified address derivation - in production use proper elliptic curve crypto
  // This creates a deterministic "address" from the private key for demo purposes
  const cleanKey = privateKey.startsWith('0x') ? privateKey.slice(2) : privateKey;
  const hash = simpleHash(cleanKey);
  return '0x' + hash.slice(0, 40);
}

function simpleHash(str) {
  // Simple hash function for demo - use proper crypto in production
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  // Convert to hex and pad
  const hex = Math.abs(hash).toString(16);
  return hex.padStart(40, '0').repeat(2).slice(0, 40);
}

export default WalletContext;
