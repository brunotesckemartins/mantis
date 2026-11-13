// mobile/src/theme.ts
import { DefaultTheme, DarkTheme } from '@react-navigation/native';

export const DARK_COLORS = {
  background: '#08090C',
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
  statusBar: 'light',
  waveColors: ['rgba(201, 208, 216, 0.05)', 'transparent', 'rgba(175, 194, 213, 0.05)']
};

export const LIGHT_COLORS = {
  background: '#E5E9F0',       // Fundo prateado claro
  backgroundDeep: '#F8F9FA',   // Áreas mais claras
  surface: 'rgba(255, 255, 255, 0.7)', // Vidro claro
  surfaceElevated: '#FFFFFF',  
  border: 'rgba(0, 0, 0, 0.08)', 
  textPrimary: '#1C1C1E',      
  textSecondary: '#4A4A4A',    
  textMuted: '#8E8E93',        
  accentSilver: '#5E6C84',     // Cinza azulado elegante em vez de azul iOS
  accentIce: '#8FA1B8',        
  glassTint: 'rgba(0, 0, 0, 0.03)',
  statusBar: 'dark',
  waveColors: ['rgba(255, 255, 255, 0.4)', 'transparent', 'rgba(200, 210, 220, 0.3)'] // Ondas brancas brilhantes
};

export const SPACING = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 };

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