import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { WalletProvider } from './src/context/WalletContext';
import HomeScreen from './src/screens/HomeScreen';
import BlocksScreen from './src/screens/BlocksScreen';
import TransactionsScreen from './src/screens/TransactionsScreen';
import SubmitTransactionScreen from './src/screens/SubmitTransactionScreen';
import ReceiveScreen from './src/screens/ReceiveScreen';
import ImportWalletScreen from './src/screens/ImportWalletScreen';
import ProfileScreen from './src/screens/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const colors = {
  background: '#000000',
  cardBackground: '#1C1C1E',
  textPrimary: '#FFFFFF',
  textSecondary: '#8E8E93',
  green: '#00C805',
  border: '#38383A',
};

const DarkTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.green,
    background: colors.background,
    card: colors.cardBackground,
    text: colors.textPrimary,
    border: colors.border,
  },
};

function TabIcon({ icon, label, focused }) {
  return (
    <View style={tabStyles.iconContainer}>
      <Text style={[tabStyles.icon, focused && tabStyles.iconFocused]}>{icon}</Text>
      <Text style={[tabStyles.label, focused && tabStyles.labelFocused]}>{label}</Text>
    </View>
  );
}

function PayButton({ onPress }) {
  return (
    <TouchableOpacity style={tabStyles.payButton} onPress={onPress} activeOpacity={0.8}>
      <Text style={tabStyles.payIcon}>$</Text>
    </TouchableOpacity>
  );
}

function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: tabStyles.tabBar,
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="🏠" label="Home" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Activity"
        component={TransactionsScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="📊" label="Activity" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Pay"
        component={SubmitTransactionScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="$" label="Pay" focused={focused} />,
          tabBarButton: (props) => <PayButton {...props} />,
        }}
      />
      <Tab.Screen
        name="BlocksTab"
        component={BlocksScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="⬡" label="Blocks" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="👤" label="Profile" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}



export default function App() {
  return (
    <SafeAreaProvider>
      <WalletProvider>
        <NavigationContainer theme={DarkTheme}>
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.background },
            }}
          >
            <Stack.Screen name="Main" component={HomeTabs} />
            <Stack.Screen
              name="SubmitTransaction"
              component={SubmitTransactionScreen}
              options={{
                presentation: 'modal',
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="Receive"
              component={ReceiveScreen}
              options={{
                presentation: 'modal',
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="ImportWallet"
              component={ImportWalletScreen}
              options={{
                presentation: 'modal',
                headerShown: false,
              }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </WalletProvider>
    </SafeAreaProvider>
  );
}

const tabStyles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.cardBackground,
    borderTopColor: colors.border,
    borderTopWidth: 0.5,
    height: 85,
    paddingTop: 8,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 22,
    marginBottom: 4,
  },
  iconFocused: {
    opacity: 1,
  },
  label: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  labelFocused: {
    color: colors.textPrimary,
  },
  payButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.green,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -20,
    shadowColor: colors.green,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  payIcon: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
  },
});
