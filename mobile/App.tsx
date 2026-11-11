// mobile/App.tsx
import React, { useContext } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AuthProvider, AuthContext } from './src/contexts/AuthContext';
import Login from './src/screens/Login';
import MyTickets from './src/screens/MyTickets';
import NewTicket from './src/screens/NewTicket';
import TicketDetails from './src/screens/TicketDetails';
import Dashboard from './src/screens/Dashboard';
import ManageCategories from './src/screens/ManageCategories';
import Profile from './src/screens/Profile'; // <-- NOVA TELA

const Stack = createNativeStackNavigator();

function AppRoutes() {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <>
            <Stack.Screen name="MyTickets" component={MyTickets} />
            <Stack.Screen name="NewTicket" component={NewTicket} options={{ headerShown: true, title: 'Abrir Chamado' }} />
            <Stack.Screen name="TicketDetails" component={TicketDetails} options={{ headerShown: true, title: 'Detalhes do Chamado' }} />
            <Stack.Screen name="Dashboard" component={Dashboard} options={{ headerShown: true, title: 'Painel do Gestor' }} />
            <Stack.Screen name="ManageCategories" component={ManageCategories} options={{ headerShown: true, title: 'Gerenciar Categorias' }} />
            <Stack.Screen name="Profile" component={Profile} options={{ headerShown: true, title: 'Meu Perfil' }} />
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
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}