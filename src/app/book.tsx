import { useEffect, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { ActivityIndicator, Button, Text, View } from "react-native";
import BookingScreen from "../screens/BookingScreen";
import { getServices, errorMessage } from "../services/api";
import type { Service } from "../types/service";
export default function Book() {
  const { serviceId } = useLocalSearchParams<{
    serviceId?: string | string[];
  }>();
  const requestedId = typeof serviceId === "string" ? serviceId : undefined;
  const [result, setResult] = useState<{
    serviceId: string;
    service: Service | null;
    error: string;
  } | null>(null);
  const current = result?.serviceId === requestedId ? result : null;
  const service = current?.service;
  const error = requestedId
    ? (current?.error ?? "")
    : "Choose a service to continue.";
  useEffect(() => {
    if (!requestedId) return;
    const controller = new AbortController();
    void getServices(controller.signal)
      .then((items) => {
        if (!controller.signal.aborted) {
          const found = items.find((item) => item.id === requestedId);
          setResult({
            serviceId: requestedId,
            service: found ?? null,
            error: found ? "" : "This service is unavailable.",
          });
        }
      })
      .catch((e) => {
        if (!controller.signal.aborted)
          setResult({
            serviceId: requestedId,
            service: null,
            error: errorMessage(e),
          });
      });
    return () => controller.abort();
  }, [requestedId]);
  if (service)
    return (
      <BookingScreen
        key={service.id}
        service={service}
        onBack={() => router.replace("/services")}
      />
    );
  return (
    <View style={{ flex: 1, padding: 24, justifyContent: "center" }}>
      {error ? (
        <>
          <Text>{error}</Text>
          <Button
            title="Back to services"
            onPress={() => router.replace("/services")}
          />
        </>
      ) : (
        <ActivityIndicator />
      )}
    </View>
  );
}
