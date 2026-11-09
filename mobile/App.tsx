// mobile/App.tsx
import React, { useContext } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AuthProvider, AuthContext } from './src/contexts/AuthContext';
import Login from './src/screens/Login';
import MyTickets from './src/screens/MyTickets';
import NewTicket from './src/screens/NewTicket';

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
          // Se estiver logado, mostra as telas internas
          <>
            <Stack.Screen name="MyTickets" component={MyTickets} />
            <Stack.Screen 
              name="NewTicket" 
              component={NewTicket} 
              options={{ headerShown: true, title: 'Abrir Chamado' }} // Mostra o cabeçalho padrão com botão de voltar
            />
          </>
        ) : (
          // Se não estiver logado, mostra a tela de Login
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