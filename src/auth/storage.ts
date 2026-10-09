import * as SecureStore from "expo-secure-store";
const key = "mendcrew.session";
export const readSession = () => SecureStore.getItemAsync(key);
export const saveSession = (value: string) =>
  SecureStore.setItemAsync(key, value);
export const clearSession = () => SecureStore.deleteItemAsync(key);
