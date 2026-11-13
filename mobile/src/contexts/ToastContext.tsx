// mobile/src/contexts/ToastContext.tsx
import React, { createContext, useState, useContext, useRef, useEffect } from 'react';
import { Animated, Text, StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { Feather } from '@expo/vector-icons';
import { ThemeContext } from './ThemeContext';

type ToastType = 'success' | 'error' | 'info';

interface ToastContextData {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextData>({} as ToastContextData);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const { colors, isDark } = useContext(ThemeContext);
  const [message, setMessage] = useState('');
  const [type, setType] = useState<ToastType>('info');
  const [visible, setVisible] = useState(false);
  
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const showToast = (msg: string, toastType: ToastType = 'info') => {
    setMessage(msg);
    setType(toastType);
    setVisible(true);

    Animated.parallel([
      Animated.spring(translateY, { toValue: 50, useNativeDriver: true, friction: 6, tension: 40 }),
      Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true })
    ]).start();

    setTimeout(() => {
      Animated.parallel([
        Animated.timing(translateY, { toValue: -100, duration: 300, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true })
      ]).start(() => setVisible(false));
    }, 3000);
  };

  const getIcon = () => {
    if (type === 'success') return 'check-circle';
    if (type === 'error') return 'alert-circle';
    return 'info';
  };

  const getIconColor = () => {
    if (type === 'success') return colors.statusSuccess;
    if (type === 'error') return colors.statusDanger;
    return colors.statusInfo;
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {visible && (
        <Animated.View style={[styles.toastContainer, { transform: [{ translateY }], opacity }]}>
          <BlurView intensity={isDark ? 60 : 80} tint={isDark ? 'dark' : 'light'} style={[styles.blur, { borderColor: colors.border }]}>
            <View style={styles.content}>
              <Feather name={getIcon() as any} size={20} color={getIconColor()} />
              <Text style={[styles.text, { color: colors.textPrimary }]}>{message}</Text>
            </View>
          </BlurView>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    zIndex: 9999,
    alignItems: 'center',
  },
  blur: {
    width: '100%',
    borderRadius: 30,
    overflow: 'hidden',
    borderWidth: 1,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  text: {
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 10,
  }
});