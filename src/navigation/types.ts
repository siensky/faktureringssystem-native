import type { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Login: undefined;
  App: NavigatorScreenParams<AppTabParamList> | undefined;
};

export type AppTabParamList = {
  Fakturor: NavigatorScreenParams<InvoicesStackParamList> | undefined;
  Konto: NavigatorScreenParams<AccountStackParamList> | undefined;
};

export type InvoicesStackParamList = {
  InvoicesList: undefined;
  InvoiceDetail: { invoiceId: number };
};

export type AccountStackParamList = {
  AccountHome: undefined;
  CompanySwitcher: undefined;
};

export type InvoicesStackScreenProps<T extends keyof InvoicesStackParamList> = CompositeScreenProps<
  NativeStackScreenProps<InvoicesStackParamList, T>,
  BottomTabScreenProps<AppTabParamList>
>;

export type AccountStackScreenProps<T extends keyof AccountStackParamList> = CompositeScreenProps<
  NativeStackScreenProps<AccountStackParamList, T>,
  BottomTabScreenProps<AppTabParamList>
>;

declare global {
  namespace ReactNavigation {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface RootParamList extends RootStackParamList {}
  }
}
