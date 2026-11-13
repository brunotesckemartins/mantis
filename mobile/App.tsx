// mobile/App.tsx
import React, { useContext } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AuthProvider, AuthContext } from './src/contexts/AuthContext';
import { ThemeProvider, ThemeContext } from './src/contexts/ThemeContext';
import { getNavigationTheme } from './src/theme';

import Login from './src/screens/Login';
import Home from './src/screens/Home';
import MyTickets from './src/screens/MyTickets';
import NewTicket from './src/screens/NewTicket';
import TicketDetails from './src/screens/TicketDetails';
import Dashboard from './src/screens/Dashboard';
import ManageCategories from './src/screens/ManageCategories';
import Profile from './src/screens/Profile';

const Stack = createNativeStackNavigator();

function AppRoutes() {
  const { user, loading } = useContext(AuthContext);
  const { isDark, colors } = useContext(ThemeContext);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.accentSilver} />
      </View>
    );
  }

  return (
    <NavigationContainer theme={getNavigationTheme(isDark)}>
      <Stack.Navigator 
        screenOptions={{ 
          headerShown: false,
          headerStyle: { backgroundColor: colors.surfaceElevated },
          headerTintColor: colors.textPrimary,
        }}
      >
        {user ? (
          <>
            <Stack.Screen name="Home" component={Home} />
            <Stack.Screen name="MyTickets" component={MyTickets} options={{ headerShown: true, title: 'Meus Chamados' }} />
            <Stack.Screen name="NewTicket" component={NewTicket} options={{ headerShown: true, title: 'Criar Solicitação' }} />
            <Stack.Screen name="TicketDetails" component={TicketDetails} options={{ headerShown: true, title: 'Detalhes' }} />
            <Stack.Screen name="Dashboard" component={Dashboard} options={{ headerShown: true, title: 'Painel' }} />
            <Stack.Screen name="ManageCategories" component={ManageCategories} options={{ headerShown: true, title: 'Categorias' }} />
            <Stack.Screen name="Profile" component={Profile} options={{ headerShown: true, title: 'Perfil' }} />
          </>
        ) : (
          <Stack.Screen name="Login" component={Login} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ThemeProvider>
  );
}