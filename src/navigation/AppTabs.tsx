import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AccountScreen } from '@/screens/AccountScreen';
import { CompanySwitcherScreen } from '@/screens/CompanySwitcherScreen';
import { InvoiceDetailScreen } from '@/screens/InvoiceDetailScreen';
import { InvoicesScreen } from '@/screens/InvoicesScreen';
import { Colors } from '@/theme/colors';

import type { AccountStackParamList, AppTabParamList, InvoicesStackParamList } from './types';

const InvoicesStack = createNativeStackNavigator<InvoicesStackParamList>();
const AccountStack = createNativeStackNavigator<AccountStackParamList>();
const Tab = createBottomTabNavigator<AppTabParamList>();

function InvoicesStackNavigator() {
  return (
    <InvoicesStack.Navigator screenOptions={{ headerTintColor: Colors.ink[900] }}>
      <InvoicesStack.Screen name="InvoicesList" component={InvoicesScreen} options={{ title: 'Mina fakturor' }} />
      <InvoicesStack.Screen name="InvoiceDetail" component={InvoiceDetailScreen} options={{ title: 'Faktura' }} />
    </InvoicesStack.Navigator>
  );
}

function AccountStackNavigator() {
  return (
    <AccountStack.Navigator screenOptions={{ headerTintColor: Colors.ink[900] }}>
      <AccountStack.Screen name="AccountHome" component={AccountScreen} options={{ title: 'Konto' }} />
      <AccountStack.Screen
        name="CompanySwitcher"
        component={CompanySwitcherScreen}
        options={{ title: 'Byt företag' }}
      />
    </AccountStack.Navigator>
  );
}

export function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.sienna[500],
        tabBarInactiveTintColor: Colors.mist[400],
        tabBarStyle: { backgroundColor: '#ffffff', borderTopColor: Colors.ink[50] },
      }}
    >
      <Tab.Screen name="Fakturor" component={InvoicesStackNavigator} />
      <Tab.Screen name="Konto" component={AccountStackNavigator} />
    </Tab.Navigator>
  );
}
