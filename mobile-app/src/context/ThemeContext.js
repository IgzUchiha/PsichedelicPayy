import { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';

const ThemeContext = createContext(null);

const THEME_STORAGE_KEY = 'payy_theme';

// Dark theme (current default)
export const darkTheme = {
  isDark: true,
  // Primary backgrounds
  background: '#000000',
  cardBackground: '#1C1C1E',
  surfaceLight: '#2C2C2E',
  
  // Text colors
  textPrimary: '#FFFFFF',
  textSecondary: '#8E8E93',
  textMuted: '#636366',
  
  // Accent colors
  accent: '#00C805',
  accentLight: '#00D409',
  red: '#FF3B30',
  
  // UI elements
  border: '#38383A',
  divider: '#2C2C2E',
  
  // Action colors
  primary: '#00C805',
  secondary: '#5856D6',
};

// Light theme (white and purple)
export const lightTheme = {
  isDark: false,
  // Primary backgrounds
  background: '#FFFFFF',
  cardBackground: '#F5F5F7',
  surfaceLight: '#E8E8ED',
  
  // Text colors
  textPrimary: '#1C1C1E',
  textSecondary: '#636366',
  textMuted: '#8E8E93',
  
  // Accent colors (purple instead of green)
  accent: '#8B5CF6',
  accentLight: '#A78BFA',
  red: '#FF3B30',
  
  // UI elements
  border: '#D1D1D6',
  divider: '#E5E5EA',
  
  // Action colors
  primary: '#8B5CF6',
  secondary: '#5856D6',
};

export function ThemeProvider({ children }) {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [loading, setLoading] = useState(true);

  // Load theme preference on app start
  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const storedTheme = await SecureStore.getItemAsync(THEME_STORAGE_KEY);
      if (storedTheme !== null) {
        setIsDarkMode(storedTheme === 'dark');
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTheme = async () => {
    try {
      const newMode = !isDarkMode;
      setIsDarkMode(newMode);
      await SecureStore.setItemAsync(THEME_STORAGE_KEY, newMode ? 'dark' : 'light');
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider
      value={{
        isDarkMode,
        theme,
        toggleTheme,
        loading,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export default ThemeContext;
