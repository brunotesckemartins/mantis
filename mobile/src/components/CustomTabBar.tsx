
import React, { useContext } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { Feather } from '@expo/vector-icons';

import { ThemeContext } from '../contexts/ThemeContext';
import { SPACING } from '../theme';

type FeatherIconName = keyof typeof Feather.glyphMap;

const TAB_ICONS: Record<string, FeatherIconName> = {
  Home: 'home',
  Tickets: 'layers',
  Academic: 'book-open',
  Profile: 'user',
  Settings: 'settings',
};

export default function CustomTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const { isDark, colors } = useContext(ThemeContext);

  return (
    <View style={styles.tabBarContainer}>
      <BlurView
        intensity={isDark ? 40 : 70}
        tint={isDark ? 'dark' : 'light'}
        style={[
          styles.blurView,
          {
            borderColor: colors.border,
            backgroundColor: colors.glassTint,
          },
        ]}
      >
        <View style={styles.tabBar}>
          {state.routes.map((route, index) => {
            const isFocused = state.index === index;
            const options = descriptors[route.key].options;

            const iconName = TAB_ICONS[route.name] ?? 'circle';

            const label =
              options.tabBarAccessibilityLabel ??
              options.title ??
              route.name;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            const onLongPress = () => {
              navigation.emit({
                type: 'tabLongPress',
                target: route.key,
              });
            };

            return (
              <TouchableOpacity
                key={route.key}
                style={styles.tabItem}
                onPress={onPress}
                onLongPress={onLongPress}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={label}
                accessibilityState={{ selected: isFocused }}
                testID={options.tabBarButtonTestID}
              >
                <Feather
                  name={iconName}
                  size={22}
                  color={
                    isFocused
                      ? colors.accentSilver
                      : colors.textMuted
                  }
                />

                {isFocused && (
                  <View
                    style={[
                      styles.activeDot,
                      { backgroundColor: colors.accentSilver },
                    ]}
                  />
                )}
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
  },

  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: SPACING.sm + 4,
    paddingHorizontal: SPACING.xs,
  },

  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
  },

  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 4,
  },
});
