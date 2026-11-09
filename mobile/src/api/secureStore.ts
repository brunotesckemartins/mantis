// mobile/src/api/secureStore.ts
import { Platform } from 'react-native';
import * as ExpoSecureStore from 'expo-secure-store';

const isWeb = Platform.OS === 'web';

export const getItemAsync = async (key: string): Promise<string | null> => {
  if (isWeb) {
    return localStorage.getItem(key);
  }
  return ExpoSecureStore.getItemAsync(key);
};

export const setItemAsync = async (key: string, value: string): Promise<void> => {
  if (isWeb) {
    localStorage.setItem(key, value);
    return;
  }
  await ExpoSecureStore.setItemAsync(key, value);
};

export const deleteItemAsync = async (key: string): Promise<void> => {
  if (isWeb) {
    localStorage.removeItem(key);
    return;
  }
  await ExpoSecureStore.deleteItemAsync(key);
};