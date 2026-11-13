// mobile/src/theme.ts
import { DefaultTheme, DarkTheme } from '@react-navigation/native';

export const DARK_COLORS = {
  background: '#0A0C10',       // Um pouco mais claro que o preto puro
  backgroundDeep: '#050608',
  surface: 'rgba(26, 31, 38, 0.6)',
  surfaceElevated: '#1A1F26',
  border: 'rgba(255, 255, 255, 0.1)',
  textPrimary: '#F1F3F5',
  textSecondary: '#A4ABB4',
  textMuted: '#737C87',
  accentSilver: '#C9D0D8',
  accentIce: '#AFC2D5',
  glassTint: 'rgba(255, 255, 255, 0.05)',
  
  statusSuccess: '#98C379',
  statusWarning: '#E5C07B', 
  statusDanger: '#E06C75',  
  statusInfo: '#61AFEF',    
  
  // Ondas mais visíveis no modo escuro
  waveColors: ['rgba(201, 208, 216, 0.15)', 'transparent', 'rgba(175, 194, 213, 0.15)'],
  isDark: true
};

export const LIGHT_COLORS: typeof DARK_COLORS = {
  background: '#E5E9F0',
  backgroundDeep: '#F8F9FA',
  surface: 'rgba(255, 255, 255, 0.7)',
  surfaceElevated: '#FFFFFF',  
  border: 'rgba(0, 0, 0, 0.08)', 
  textPrimary: '#1C1C1E',      
  textSecondary: '#4A4A4A',    
  textMuted: '#8E8E93',        
  accentSilver: '#5E6C84',     
  accentIce: '#8FA1B8',        
  glassTint: 'rgba(0, 0, 0, 0.03)',

  statusSuccess: '#50A14F',
  statusWarning: '#C18401',
  statusDanger: '#E45649',
  statusInfo: '#4078F2',

  waveColors: ['rgba(255, 255, 255, 0.4)', 'transparent', 'rgba(200, 210, 220, 0.3)'],
  isDark: false
};

export type ThemeColors = typeof DARK_COLORS;

export const SPACING = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, borderRadius: 24 };

export const getNavigationTheme = (isDark: boolean) => {
  const baseTheme = isDark ? DarkTheme : DefaultTheme;
  const colors = isDark ? DARK_COLORS : LIGHT_COLORS;
  
  return {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      background: colors.background,
      card: colors.surfaceElevated,
      text: colors.textPrimary,
      border: colors.border,
      primary: colors.accentSilver,
    },
  };
};