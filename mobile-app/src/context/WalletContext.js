import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import { ethers } from 'ethers';
import { fetchAllNetworkBalances, NETWORKS } from '../config/networks';

const WalletContext = createContext(null);

const WALLET_STORAGE_KEY = 'payy_wallet';
const NOTES_STORAGE_KEY = 'payy_notes';
const ACTIVE_CHAIN_KEY = 'payy_active_chain';

// Chain configuration
export const CHAINS = {
  ETH: { id: 'eth', name: 'Ethereum', symbol: 'ETH', icon: '⟠', color: '#627EEA', decimals: 18 },
  BTC: { id: 'btc', name: 'Bitcoin', symbol: 'BTC', icon: '₿', color: '#F7931A', decimals: 8 },
  SOL: { id: 'sol', name: 'Solana', symbol: 'SOL', icon: '◎', color: '#9945FF', decimals: 9 },
  POLYGON: { id: 'polygon', name: 'Polygon', symbol: 'MATIC', icon: '⬡', color: '#8247E5', decimals: 18 },
  ARB: { id: 'arb', name: 'Arbitrum', symbol: 'ARB', icon: '🔵', color: '#28A0F0', decimals: 18 },
  OP: { id: 'op', name: 'Optimism', symbol: 'OP', icon: '🔴', color: '#FF0420', decimals: 18 },
  BASE: { id: 'base', name: 'Base', symbol: 'ETH', icon: '🔵', color: '#0052FF', decimals: 18 },
};

export const SUPPORTED_CHAINS = ['ETH', 'BTC', 'SOL', 'POLYGON', 'ARB', 'OP', 'BASE'];

// BIP39 wordlist (first 100 words for demo - in production use full 2048)
const WORDLIST = [
  'abandon', 'ability', 'able', 'about', 'above', 'absent', 'absorb', 'abstract', 'absurd', 'abuse',
  'access', 'accident', 'account', 'accuse', 'achieve', 'acid', 'acoustic', 'acquire', 'across', 'act',
  'action', 'actor', 'actress', 'actual', 'adapt', 'add', 'addict', 'address', 'adjust', 'admit',
  'adult', 'advance', 'advice', 'aerobic', 'affair', 'afford', 'afraid', 'again', 'age', 'agent',
  'agree', 'ahead', 'aim', 'air', 'airport', 'aisle', 'alarm', 'album', 'alcohol', 'alert',
  'alien', 'all', 'alley', 'allow', 'almost', 'alone', 'alpha', 'already', 'also', 'alter',
  'always', 'amateur', 'amazing', 'among', 'amount', 'amused', 'analyst', 'anchor', 'ancient', 'anger',
  'angle', 'angry', 'animal', 'ankle', 'announce', 'annual', 'another', 'answer', 'antenna', 'antique',
  'anxiety', 'any', 'apart', 'apology', 'appear', 'apple', 'approve', 'april', 'arch', 'arctic',
  'area', 'arena', 'argue', 'arm', 'armed', 'armor', 'army', 'around', 'arrange', 'arrest',
];

export function WalletProvider({ children }) {
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState({ total: '0.00', change: 0, changePercent: 0 });
  const [notes, setNotes] = useState([]);
  const [activeChain, setActiveChain] = useState('eth');
  const [chainBalances, setChainBalances] = useState({});
  const [networkBalances, setNetworkBalances] = useState(
    NETWORKS.map(n => ({ ...n, balance: 0, formattedBalance: '0' }))
  );
  const [loadingBalances, setLoadingBalances] = useState(false);

  useEffect(() => {
    loadWallet();
  }, []);

  const loadWallet = async () => {
    console.log('=== Loading wallet from storage ===');
    try {
      const storedWallet = await SecureStore.getItemAsync(WALLET_STORAGE_KEY);
      let walletData = null;
      if (storedWallet) {
        walletData = JSON.parse(storedWallet);
        console.log('Loaded wallet address:', walletData.address);
        setWallet(walletData);
      } else {
        console.log('No wallet found in storage');
      }
      
      const storedChain = await SecureStore.getItemAsync(ACTIVE_CHAIN_KEY);
      if (storedChain) {
        setActiveChain(storedChain);
      }
      
      const storedNotes = await SecureStore.getItemAsync(NOTES_STORAGE_KEY);
      if (storedNotes) {
        const notesData = JSON.parse(storedNotes);
        setNotes(notesData);
        calculateBalance(notesData);
      }

      // Fetch network balances if wallet exists
      if (walletData?.address) {
        fetchNetworkBalancesForWallet(walletData.address);
      }
    } catch (error) {
      console.error('Error loading wallet:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNetworkBalancesForWallet = async (address) => {
    if (!address) {
      console.log('No address provided for balance fetch');
      return;
    }
    
    console.log('=== Fetching network balances ===');
    console.log('Wallet address:', address);
    
    setLoadingBalances(true);
    try {
      const balances = await fetchAllNetworkBalances(address);
      setNetworkBalances(balances);
      
      // Log balances for debugging
      const nonZeroBalances = balances.filter(b => b.balance > 0);
      if (nonZeroBalances.length > 0) {
        console.log('Network balances loaded:', nonZeroBalances.map(b => `${b.name}: ${b.formattedBalance} ${b.symbol}`));
      }
    } catch (error) {
      console.error('Error fetching network balances:', error);
      // Set empty balances with network info on error
      setNetworkBalances(NETWORKS.map(n => ({ ...n, balance: 0, formattedBalance: '0' })));
    } finally {
      setLoadingBalances(false);
    }
  };

  const refreshNetworkBalances = useCallback(async () => {
    if (wallet?.address) {
      await fetchNetworkBalancesForWallet(wallet.address);
    }
  }, [wallet?.address]);

  const calculateBalance = (notesList) => {
    const totalMicro = notesList
      .filter(n => !n.spent)
      .reduce((sum, note) => {
        let value = 0;
        if (typeof note.value === 'string') {
          value = note.value.startsWith('0x') 
            ? parseInt(note.value, 16) 
            : parseInt(note.value, 10);
        } else {
          value = note.value || 0;
        }
        return sum + value;
      }, 0);
    
    const totalDollars = (totalMicro / 1_000_000).toFixed(2);
    setBalance({ total: totalDollars, change: 0, changePercent: 0 });
  };

  const createWallet = async (name = 'My Wallet') => {
    try {
      // Generate random bytes using expo-crypto
      const randomBytes = await Crypto.getRandomBytesAsync(32);
      const privateKey = '0x' + Array.from(randomBytes).map(b => b.toString(16).padStart(2, '0')).join('');
      
      // Generate a simple mnemonic (12 words)
      const mnemonicBytes = await Crypto.getRandomBytesAsync(16);
      const mnemonic = Array.from(mnemonicBytes).map(b => WORDLIST[b % WORDLIST.length]).join(' ');
      
      // Generate address from private key (simplified - just hash it)
      const addressHash = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        privateKey
      );
      const address = '0x' + addressHash.slice(0, 40);
      
      const walletData = {
        name,
        address,
        privateKey,
        mnemonic,
        createdAt: Date.now(),
      };

      await SecureStore.setItemAsync(WALLET_STORAGE_KEY, JSON.stringify(walletData));
      setWallet(walletData);
      setNotes([]);
      await SecureStore.setItemAsync(NOTES_STORAGE_KEY, JSON.stringify([]));
      setBalance({ total: '0.00', change: 0, changePercent: 0 });

      return { success: true, address, mnemonic };
    } catch (error) {
      console.error('Error creating wallet:', error);
      return { success: false, error: error.message };
    }
  };

  const importFromMnemonic = async (mnemonic, name = 'My Wallet') => {
    console.log('=== Starting mnemonic import ===');
    try {
      const cleanMnemonic = mnemonic.trim().toLowerCase();
      const words = cleanMnemonic.split(/\s+/);
      
      console.log('Word count:', words.length);
      
      if (words.length !== 12 && words.length !== 24) {
        throw new Error('Seed phrase must be 12 or 24 words');
      }
      
      // Properly derive wallet from mnemonic using ethers
      console.log('Deriving wallet from mnemonic...');
      const ethersWallet = ethers.Wallet.fromPhrase(cleanMnemonic);
      const address = ethersWallet.address;
      const privateKey = ethersWallet.privateKey;
      
      console.log('=== Wallet Imported from Mnemonic ===');
      console.log('Derived address:', address);
      
      const walletData = {
        name,
        address,
        privateKey,
        mnemonic: cleanMnemonic,
        createdAt: Date.now(),
      };

      await SecureStore.setItemAsync(WALLET_STORAGE_KEY, JSON.stringify(walletData));
      setWallet(walletData);
      setNotes([]);
      await SecureStore.setItemAsync(NOTES_STORAGE_KEY, JSON.stringify([]));
      setBalance({ total: '0.00', change: 0, changePercent: 0 });

      // Fetch network balances for imported wallet
      fetchNetworkBalancesForWallet(address);

      return { success: true, address };
    } catch (error) {
      console.error('=== Error importing from mnemonic ===');
      console.error('Error:', error.message);
      return { success: false, error: error.message };
    }
  };

  const importWallet = async (privateKey, name = 'My Wallet') => {
    console.log('=== Starting private key import ===');
    try {
      const cleanKey = privateKey.trim();
      
      const hexPattern = /^(0x)?[a-fA-F0-9]{64}$/;
      if (!hexPattern.test(cleanKey)) {
        throw new Error('Invalid private key format');
      }

      const formattedKey = cleanKey.startsWith('0x') ? cleanKey : '0x' + cleanKey;
      
      // Properly derive Ethereum address from private key using ethers
      const ethersWallet = new ethers.Wallet(formattedKey);
      const address = ethersWallet.address;
      
      console.log('=== Wallet Imported ===');
      console.log('Derived address:', address);

      const walletData = {
        name,
        address,
        privateKey: formattedKey,
        importedAt: Date.now(),
      };

      await SecureStore.setItemAsync(WALLET_STORAGE_KEY, JSON.stringify(walletData));
      setWallet(walletData);
      setNotes([]);
      await SecureStore.setItemAsync(NOTES_STORAGE_KEY, JSON.stringify([]));
      setBalance({ total: '0.00', change: 0, changePercent: 0 });

      // Fetch network balances for imported wallet
      fetchNetworkBalancesForWallet(address);

      return { success: true, address };
    } catch (error) {
      console.error('=== Error importing wallet ===');
      console.error('Error:', error.message);
      return { success: false, error: error.message };
    }
  };

  const removeWallet = async () => {
    try {
      await SecureStore.deleteItemAsync(WALLET_STORAGE_KEY);
      await SecureStore.deleteItemAsync(NOTES_STORAGE_KEY);
      setWallet(null);
      setBalance({ total: '0.00', change: 0, changePercent: 0 });
      setNotes([]);
      return { success: true };
    } catch (error) {
      console.error('Error removing wallet:', error);
      return { success: false, error: error.message };
    }
  };

  const addNote = async (noteInfo) => {
    try {
      const newNote = { ...noteInfo, spent: false, receivedAt: Date.now() };
      const updatedNotes = [...notes, newNote];
      setNotes(updatedNotes);
      await SecureStore.setItemAsync(NOTES_STORAGE_KEY, JSON.stringify(updatedNotes));
      calculateBalance(updatedNotes);
      return { success: true };
    } catch (error) {
      console.error('Error adding note:', error);
      return { success: false, error: error.message };
    }
  };

  const spendNote = async (commitment) => {
    try {
      const updatedNotes = notes.map(note => 
        note.commitment === commitment ? { ...note, spent: true } : note
      );
      setNotes(updatedNotes);
      await SecureStore.setItemAsync(NOTES_STORAGE_KEY, JSON.stringify(updatedNotes));
      calculateBalance(updatedNotes);
      return { success: true };
    } catch (error) {
      console.error('Error spending note:', error);
      return { success: false, error: error.message };
    }
  };

  const getUnspentNotes = () => notes.filter(n => !n.spent && !n.pending);
  
  const markNotesPending = async (commitments) => {
    try {
      const updatedNotes = notes.map(note =>
        commitments.includes(note.commitment) ? { ...note, pending: true } : note
      );
      setNotes(updatedNotes);
      await SecureStore.setItemAsync(NOTES_STORAGE_KEY, JSON.stringify(updatedNotes));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const unmarkNotesPending = async (commitments) => {
    try {
      const updatedNotes = notes.map(note =>
        commitments.includes(note.commitment) ? { ...note, pending: false } : note
      );
      setNotes(updatedNotes);
      await SecureStore.setItemAsync(NOTES_STORAGE_KEY, JSON.stringify(updatedNotes));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const clearNotes = async () => {
    try {
      setNotes([]);
      await SecureStore.setItemAsync(NOTES_STORAGE_KEY, JSON.stringify([]));
      setBalance({ total: '0.00', change: 0, changePercent: 0 });
      return { success: true };
    } catch (error) {
      console.error('Error clearing notes:', error);
      return { success: false, error: error.message };
    }
  };

  const refreshBalance = () => calculateBalance(notes);

  const switchChain = async (chainId) => {
    try {
      setActiveChain(chainId);
      await SecureStore.setItemAsync(ACTIVE_CHAIN_KEY, chainId);
      return { success: true };
    } catch (error) {
      console.error('Error switching chain:', error);
      return { success: false, error: error.message };
    }
  };

  const getChainAddress = () => wallet?.address || null;
  const getAllAddresses = () => wallet?.address ? { eth: wallet.address } : {};

  return (
    <WalletContext.Provider
      value={{
        wallet,
        balance,
        notes,
        loading,
        activeChain,
        chainBalances,
        networkBalances,
        loadingBalances,
        createWallet,
        importWallet,
        importFromMnemonic,
        removeWallet,
        refreshBalance,
        refreshNetworkBalances,
        addNote,
        spendNote,
        getUnspentNotes,
        clearNotes,
        markNotesPending,
        unmarkNotesPending,
        switchChain,
        getChainAddress,
        getAllAddresses,
        supportedChains: SUPPORTED_CHAINS,
        chains: CHAINS,
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

export default WalletContext;
