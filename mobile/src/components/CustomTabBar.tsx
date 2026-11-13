// mobile/src/components/CustomTabBar.tsx
import React, { useContext } from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { Feather } from '@expo/vector-icons';
import { ThemeContext } from '../contexts/ThemeContext';
import { SPACING } from '../theme';

export default function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { isDark, colors } = useContext(ThemeContext);

  return (
    <View style={styles.tabBarContainer}>
      <BlurView intensity={isDark ? 40 : 70} tint={isDark ? 'dark' : 'light'} style={styles.blurView}>
        <View style={styles.tabBar}>
          {state.routes.map((route, index) => {
            const isFocused = state.index === index;

            const onPress = () => {
              const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
              if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name);
            };

            let iconName: any = 'circle';
            if (route.name === 'Home') iconName = 'home';
            else if (route.name === 'Tickets') iconName = 'layers';
            else if (route.name === 'Academic') iconName = 'book-open';
            else if (route.name === 'Profile') iconName = 'user';
            else if (route.name === 'Settings') iconName = 'settings';

            return (
              <TouchableOpacity key={route.key} onPress={onPress} style={styles.tabItem} activeOpacity={0.7}>
                <Feather name={iconName} size={22} color={isFocused ? colors.accentSilver : colors.textMuted} />
                {isFocused && <View style={[styles.activeDot, { backgroundColor: colors.accentSilver }]} />}
              </TouchableOpacity>
            );
          })}
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 30 : 20,
    left: 20,
    right: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  blurView: {
    width: '100%',
    borderRadius: SPACING.borderRadius,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
    height: 40,
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 4,
  }
});