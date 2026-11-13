// mobile/App.tsx
import React, { useContext } from 'react';
import { View, ActivityIndicator, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';

import { AuthProvider, AuthContext } from './src/contexts/AuthContext';
import { ThemeProvider, ThemeContext } from './src/contexts/ThemeContext';
import { ToastProvider } from './src/contexts/ToastContext'; // <-- Importe o Toast
import { getNavigationTheme } from './src/theme';

import CustomTabBar from './src/components/CustomTabBar';

import Login from './src/screens/Login';
import Register from './src/screens/Register';
import Home from './src/screens/Home';
import MyTickets from './src/screens/MyTickets';
import Sectors from './src/screens/Sectors';
import Profile from './src/screens/Profile';
import Settings from './src/screens/Settings';
import NewTicket from './src/screens/NewTicket';
import TicketDetails from './src/screens/TicketDetails';
import Dashboard from './src/screens/Dashboard';
import ManageCategories from './src/screens/ManageCategories';
import Faq from './src/screens/Faq';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  const { colors } = useContext(ThemeContext);

  return (
    <Tab.Navigator 
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={({ route, navigation }) => ({
        headerShown: route.name !== 'Home',
        headerStyle: { backgroundColor: colors.surfaceElevated, shadowColor: 'transparent', elevation: 0, borderBottomWidth: 1, borderBottomColor: colors.border },
        headerTintColor: colors.textPrimary,
        headerTitleStyle: { fontWeight: 'bold' },
        headerLeft: route.name !== 'Home' ? () => (
          <TouchableOpacity onPress={() => navigation.navigate('Home')} style={{ marginLeft: 15, padding: 5 }}>
            <Feather name="arrow-left" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        ) : undefined,
      })}
    >
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Tickets" component={MyTickets} options={{ title: 'Meus Chamados' }} />
      <Tab.Screen name="Academic" component={Sectors} options={{ title: 'Setores' }} />
      <Tab.Screen name="Profile" component={Profile} options={{ title: 'Meu Perfil' }} />
      <Tab.Screen name="Settings" component={Settings} options={{ title: 'Configurações' }} />
    </Tab.Navigator>
  );
}

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
      <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: colors.surfaceElevated }, headerTintColor: colors.textPrimary }}>
        {user ? (
          <>
            <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
            <Stack.Screen name="NewTicket" component={NewTicket} options={{ title: 'Criar Solicitação', presentation: 'modal' }} />
            <Stack.Screen name="TicketDetails" component={TicketDetails} options={{ title: 'Detalhes' }} />
            <Stack.Screen name="Dashboard" component={Dashboard} options={{ title: 'Painel de Métricas' }} />
            <Stack.Screen name="ManageCategories" component={ManageCategories} options={{ title: 'Categorias' }} />
            <Stack.Screen name="Faq" component={Faq} options={{ title: 'Ajuda' }} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
            <Stack.Screen name="Register" component={Register} options={{ headerShown: false }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider> {/* <-- Adicionado aqui */}
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}