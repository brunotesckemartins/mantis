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
import ManageCategories from './src/screens/ManageCategories'; // <-- Importando a nova tela

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
            <Stack.Screen 
              name="NewTicket" 
              component={NewTicket} 
              options={{ headerShown: true, title: 'Abrir Chamado' }} 
            />
            {/* Nova tela registrada aqui */}
            <Stack.Screen 
              name="TicketDetails" 
              component={TicketDetails} 
              options={{ headerShown: true, title: 'Detalhes do Chamado' }} 
            />
            <Stack.Screen 
              name="ManageCategories" 
              component={ManageCategories} 
              options={{ headerShown: true, title: 'Gerenciar Categorias' }} 
            />
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