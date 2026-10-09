import { Stack } from "expo-router";
import { ActivityIndicator, Button, Text, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { SessionProvider, useSession } from "../auth/SessionProvider";
function Routes() {
  const { user, loading, error, retry } = useSession();
  if (loading)
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  if (error)
    return (
      <View style={{ flex: 1, padding: 24, justifyContent: "center" }}>
        <Text>{error}</Text>
        <Button title="Retry" onPress={retry} />
      </View>
    );
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="services" />
      <Stack.Screen name="sign-in" />
      <Stack.Protected guard={!!user}>
        <Stack.Screen name="book" />
        <Stack.Screen name="my-bookings" />
        <Stack.Screen name="booking/[id]" />
      </Stack.Protected>
    </Stack>
  );
}
export default function Layout() {
  return (
    <SafeAreaProvider>
      <SessionProvider>
        <Routes />
      </SessionProvider>
    </SafeAreaProvider>
  );
}
