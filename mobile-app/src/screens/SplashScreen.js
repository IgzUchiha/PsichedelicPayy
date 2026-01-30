import React, { useEffect } from 'react';
import { View, StyleSheet, StatusBar, Dimensions, Image } from 'react-native';

const { width } = Dimensions.get('window');

// Brand purple color (matches splash.png)
const BRAND_PURPLE = '#7C3AED';

// Logo size - about 35% of screen width, similar to Coinbase
const LOGO_SIZE = width * 0.35;

export default function SplashScreen({ onFinish }) {
  useEffect(() => {
    // Auto-dismiss after delay
    const timer = setTimeout(() => {
      if (onFinish) onFinish();
    }, 2000);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={BRAND_PURPLE} />
      <Image
        source={require('../../assets/splash.png')}
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BRAND_PURPLE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
  },
});
