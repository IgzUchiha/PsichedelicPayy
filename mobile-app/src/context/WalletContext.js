import { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Wallet, computeAddress } from 'ethers';

const WalletContext = createContext(null);

const WALLET_STORAGE_KEY = 'payy_wallet';
const NOTES_STORAGE_KEY = 'payy_notes';

export function WalletProvider({ children }) {
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(null);
  const [notes, setNotes] = useState([]); // UTXO notes owned by this wallet

  // Load wallet and notes from secure storage on app start
  useEffect(() => {
    loadWallet();
  }, []);

  const loadWallet = async () => {
    try {
      const storedWallet = await SecureStore.getItemAsync(WALLET_STORAGE_KEY);
      if (storedWallet) {
        const walletData = JSON.parse(storedWallet);
        setWallet(walletData);
      }
      
      // Load stored notes
      const storedNotes = await SecureStore.getItemAsync(NOTES_STORAGE_KEY);
      if (storedNotes) {
        const notesData = JSON.parse(storedNotes);
        setNotes(notesData);
        calculateBalance(notesData);
      } else {
        setBalance({ total: '0.00', change: 0, changePercent: 0 });
      }
    } catch (error) {
      console.error('Error loading wallet:', error);
      setBalance({ total: '0.00', change: 0, changePercent: 0 });
    } finally {
      setLoading(false);
    }
  };

  // Calculate balance from notes
  const calculateBalance = (notesList) => {
    const totalMicro = notesList
      .filter(n => !n.spent)
      .reduce((sum, note) => {
        // Parse value from hex or number
        let value = 0;
        if (typeof note.value === 'string') {
          if (note.value.startsWith('0x')) {
            value = parseInt(note.value, 16);
          } else {
            value = parseInt(note.value, 10);
          }
        } else {
          value = note.value || 0;
        }
        return sum + value;
      }, 0);
    
    // Convert from micro units (6 decimals) to dollars
    const totalDollars = (totalMicro / 1_000_000).toFixed(2);
    
    setBalance({
      total: totalDollars,
      change: 0,
      changePercent: 0,
    });
  };

  // Add a new note (from faucet or receiving)
  const addNote = async (noteInfo) => {
    try {
      const newNote = {
        ...noteInfo,
        spent: false,
        receivedAt: Date.now(),
      };
      
      const updatedNotes = [...notes, newNote];
      setNotes(updatedNotes);
      
      // Save to storage
      await SecureStore.setItemAsync(NOTES_STORAGE_KEY, JSON.stringify(updatedNotes));
      
      // Recalculate balance
      calculateBalance(updatedNotes);
      
      return { success: true };
    } catch (error) {
      console.error('Error adding note:', error);
      return { success: false, error: error.message };
    }
  };

  // Mark a note as spent
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

  // Get unspent notes
  const getUnspentNotes = () => {
    return notes.filter(n => !n.spent);
  };

  // Clear all notes (for debugging/reset)
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

  const importWallet = async (privateKey, name = 'My Wallet') => {
    try {
      const cleanKey = privateKey.trim();
      if (!isValidPrivateKey(cleanKey)) {
        throw new Error('Invalid private key format');
      }

      const address = deriveAddress(cleanKey);

      const walletData = {
        name,
        address,
        privateKey: cleanKey,
        importedAt: Date.now(),
      };

      await SecureStore.setItemAsync(WALLET_STORAGE_KEY, JSON.stringify(walletData));
      setWallet(walletData);
      
      // Clear notes when importing new wallet
      setNotes([]);
      await SecureStore.setItemAsync(NOTES_STORAGE_KEY, JSON.stringify([]));
      setBalance({ total: '0.00', change: 0, changePercent: 0 });

      return { success: true, address };
    } catch (error) {
      console.error('Error importing wallet:', error);
      return { success: false, error: error.message };
    }
  };

  const removeWallet = async () => {
    try {
      await SecureStore.deleteItemAsync(WALLET_STORAGE_KEY);
      await SecureStore.deleteItemAsync(NOTES_STORAGE_KEY);
      setWallet(null);
      setBalance(null);
      setNotes([]);
      return { success: true };
    } catch (error) {
      console.error('Error removing wallet:', error);
      return { success: false, error: error.message };
    }
  };

  const refreshBalance = async () => {
    calculateBalance(notes);
  };

  const createWallet = async (name = 'My Wallet') => {
    try {
      const newWallet = Wallet.createRandom();
      
      const walletData = {
        name,
        address: newWallet.address,
        privateKey: newWallet.privateKey,
        mnemonic: newWallet.mnemonic?.phrase,
        createdAt: Date.now(),
      };

      await SecureStore.setItemAsync(WALLET_STORAGE_KEY, JSON.stringify(walletData));
      setWallet(walletData);
      
      // Clear notes for new wallet
      setNotes([]);
      await SecureStore.setItemAsync(NOTES_STORAGE_KEY, JSON.stringify([]));
      setBalance({ total: '0.00', change: 0, changePercent: 0 });

      return { success: true, address: newWallet.address, mnemonic: walletData.mnemonic };
    } catch (error) {
      console.error('Error creating wallet:', error);
      return { success: false, error: error.message };
    }
  };

  return (
    <WalletContext.Provider
      value={{
        wallet,
        balance,
        notes,
        loading,
        createWallet,
        importWallet,
        removeWallet,
        refreshBalance,
        addNote,
        spendNote,
        getUnspentNotes,
        clearNotes,
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
  const hexPattern = /^(0x)?[a-fA-F0-9]{64}$/;
  return hexPattern.test(key);
}

function deriveAddress(privateKey) {
  const cleanKey = privateKey.startsWith('0x') ? privateKey : '0x' + privateKey;
  return computeAddress(cleanKey);
}

export default WalletContext;
