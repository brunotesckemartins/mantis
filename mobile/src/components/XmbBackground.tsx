// mobile/src/components/XmbBackground.tsx
import React, { useEffect, useRef, useContext } from 'react';
import { StyleSheet, View, Animated, Easing, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemeContext } from '../contexts/ThemeContext';

const { width, height } = Dimensions.get('window');

export default function XmbBackground({ children }: { children: React.ReactNode }) {
  const { isDark, colors } = useContext(ThemeContext);
  const anim1 = useRef(new Animated.Value(0)).current;
  const anim2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(Animated.timing(anim1, { toValue: 1, duration: 15000, easing: Easing.linear, useNativeDriver: true })).start();
    Animated.loop(Animated.timing(anim2, { toValue: 1, duration: 20000, easing: Easing.linear, useNativeDriver: true })).start();
  }, []);

  const wave1Translate = anim1.interpolate({ inputRange: [0, 1], outputRange: [-width * 0.2, width * 0.2] });
  const wave2Translate = anim2.interpolate({ inputRange: [0, 1], outputRange: [width * 0.2, -width * 0.2] });

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundDeep }]}>
      <LinearGradient
        colors={isDark ? ['#050608', '#08090C', '#10141a'] : ['#F8F9FA', '#E5E9F0', '#D0D6E0']}
        style={StyleSheet.absoluteFillObject}
      />
      
      <View style={styles.waveContainer}>
        <Animated.View style={[styles.wave, { transform: [{ translateX: wave1Translate }, { rotate: '-15deg' }] }]}>
          <LinearGradient
            colors={colors.waveColors as any}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={styles.waveGradient}
          />
        </Animated.View>

        <Animated.View style={[styles.wave, { top: '40%', transform: [{ translateX: wave2Translate }, { rotate: '10deg' }] }]}>
          <LinearGradient
            colors={colors.waveColors as any}
            start={{ x: 1, y: 0 }} end={{ x: 0, y: 1 }}
            style={styles.waveGradient}
          />
        </Animated.View>
      </View>

      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  waveContainer: { ...StyleSheet.absoluteFillObject, overflow: 'hidden', opacity: 1 },
  wave: { position: 'absolute', top: '10%', left: -width, width: width * 3, height: height * 0.4, borderRadius: width },
  waveGradient: { flex: 1, borderRadius: width },
});