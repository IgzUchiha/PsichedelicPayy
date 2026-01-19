import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, ActivityIndicator } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

import { WalletProvider, useWallet } from './src/context/WalletContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import HomeScreen from './src/screens/HomeScreen';
import BlocksScreen from './src/screens/BlocksScreen';
import TransactionsScreen from './src/screens/TransactionsScreen';
import SubmitTransactionScreen from './src/screens/SubmitTransactionScreen';
import ReceiveScreen from './src/screens/ReceiveScreen';
import ImportWalletScreen from './src/screens/ImportWalletScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import ChainDetailScreen from './src/screens/ChainDetailScreen';
import WelcomeScreen from './src/screens/WelcomeScreen';
import CreateWalletScreen from './src/screens/CreateWalletScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Error Boundary to catch crashes
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000', padding: 20 }}>
          <Text style={{ color: '#fff', fontSize: 18, marginBottom: 10 }}>Something went wrong</Text>
          <Text style={{ color: '#888', fontSize: 12, textAlign: 'center' }}>{this.state.error?.toString()}</Text>
          <TouchableOpacity 
            style={{ marginTop: 20, padding: 15, backgroundColor: '#00C805', borderRadius: 10 }}
            onPress={() => this.setState({ hasError: false, error: null })}
          >
            <Text style={{ color: '#000', fontWeight: '700' }}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

// Custom SVG Icons
function HomeIcon({ color, size = 24 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 9.5L12 3L21 9.5V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9.5Z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M9 22V12H15V22"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function ActivityIcon({ color, size = 24 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth={2} />
      <Path
        d="M12 7V12L15 15"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function BlocksIcon({ color, size = 24 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="3" width="7" height="7" rx="1" stroke={color} strokeWidth={2} />
      <Rect x="14" y="3" width="7" height="7" rx="1" stroke={color} strokeWidth={2} />
      <Rect x="3" y="14" width="7" height="7" rx="1" stroke={color} strokeWidth={2} />
      <Rect x="14" y="14" width="7" height="7" rx="1" stroke={color} strokeWidth={2} />
    </Svg>
  );
}

function ProfileIcon({ color, size = 24 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="8" r="4" stroke={color} strokeWidth={2} />
      <Path
        d="M4 20C4 17 7 14 12 14C17 14 20 17 20 20"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
}

function TabIcon({ IconComponent, label, focused, theme }) {
  const color = focused ? theme.accent : theme.textSecondary;
  return (
    <View style={tabStyles.iconContainer}>
      <IconComponent color={color} size={24} />
      <Text style={[
        tabStyles.label, 
        { color: focused ? theme.accent : theme.textSecondary }
      ]}>{label}</Text>
    </View>
  );
}

function PayButton({ onPress, theme }) {
  return (
    <TouchableOpacity 
      style={[tabStyles.payButton, { backgroundColor: theme.accent, shadowColor: theme.accent }]} 
      onPress={onPress} 
      activeOpacity={0.8}
    >
      <Text style={tabStyles.payIcon}>$</Text>
    </TouchableOpacity>
  );
}

function HomeTabs() {
  const { theme } = useTheme();
  
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: [
          tabStyles.tabBar, 
          { backgroundColor: theme.background, borderTopColor: 'transparent' }
        ],
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon IconComponent={HomeIcon} label="Home" focused={focused} theme={theme} />,
        }}
      />
      <Tab.Screen
        name="Activity"
        component={TransactionsScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon IconComponent={ActivityIcon} label="Activity" focused={focused} theme={theme} />,
        }}
      />
      <Tab.Screen
        name="Pay"
        component={SubmitTransactionScreen}
        options={{
          tabBarIcon: ({ focused }) => null,
          tabBarButton: (props) => <PayButton {...props} theme={theme} />,
        }}
      />
      <Tab.Screen
        name="BlocksTab"
        component={BlocksScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon IconComponent={BlocksIcon} label="Blocks" focused={focused} theme={theme} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon IconComponent={ProfileIcon} label="Profile" focused={focused} theme={theme} />,
        }}
      />
    </Tab.Navigator>
  );
}

function AppContent() {
  const { theme, isDarkMode } = useTheme();
  const { hasWallet, loading } = useWallet();
  
  const navigationTheme = {
    ...DefaultTheme,
    dark: isDarkMode,
    colors: {
      ...DefaultTheme.colors,
      primary: theme.accent,
      background: theme.background,
      card: theme.cardBackground,
      text: theme.textPrimary,
      border: theme.border,
    },
  };

  if (loading) {
    return (
      <View style={[tabStyles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.accent} />
      </View>
    );
  }

  return (
    <>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <NavigationContainer theme={navigationTheme}>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: theme.background },
          }}
          initialRouteName={hasWallet ? 'Main' : 'Welcome'}
        >
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen 
            name="CreateWallet" 
            component={CreateWalletScreen}
            options={{ gestureEnabled: false }}
          />
          <Stack.Screen name="ImportWallet" component={ImportWalletScreen} />
          <Stack.Screen name="Main" component={HomeTabs} />
          <Stack.Screen
            name="SubmitTransaction"
            component={SubmitTransactionScreen}
            options={{ presentation: 'modal' }}
          />
          <Stack.Screen
            name="Receive"
            component={ReceiveScreen}
            options={{ presentation: 'modal' }}
          />
          <Stack.Screen
            name="ChainDetail"
            component={ChainDetailScreen}
            options={{ presentation: 'card' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <ThemeProvider>
          <WalletProvider>
            <AppContent />
          </WalletProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

const tabStyles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBar: {
    borderTopWidth: 0,
    height: 85,
    paddingTop: 10,
    paddingBottom: 20,
    elevation: 0,
    shadowOpacity: 0,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 4,
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 4,
  },
  payButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -15,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  payIcon: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
  },
});
