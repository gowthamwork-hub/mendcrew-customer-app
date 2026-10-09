import { useCallback, useEffect, useRef, useState } from "react";
import { router } from "expo-router";
import { ActivityIndicator, FlatList, Pressable, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getBookings, errorMessage } from "../services/api";
import type { Booking } from "../types/booking";
import { formStyles as s } from "../theme/forms";
export default function MyBookings() {
  const [items, setItems] = useState<Booking[]>([]);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const request = useRef<AbortController | null>(null);
  const requestedPage = useRef(1);
  const load = useCallback(async (number: number) => {
    requestedPage.current = number;
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    try {
      const data = await getBookings(number, controller.signal);
      if (!controller.signal.aborted) {
        setError("");
        setItems((previous) =>
          number === 1
            ? data.items
            : [
                ...previous,
                ...data.items.filter(
                  (item) => !previous.some((p) => p.id === item.id),
                ),
              ],
        );
        setPage(number);
        setTotal(data.total);
      }
    } catch (e) {
      if (!controller.signal.aborted) setError(errorMessage(e));
    } finally {
      if (!controller.signal.aborted) setBusy(false);
    }
  }, []);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Fetch paginated remote data on mount with abort cleanup.
    void load(1);
    return () => request.current?.abort();
  }, [load]);
  const requestPage = (number: number) => {
    if (busy) return;
    setBusy(true);
    setError("");
    void load(number);
  };
  return (
    <SafeAreaView style={s.safe}>
      <FlatList
        contentContainerStyle={s.content}
        data={items}
        keyExtractor={(item) => item.id}
        refreshing={busy && page <= 1}
        onRefresh={() => requestPage(1)}
        ListHeaderComponent={
          <>
            <Pressable onPress={() => router.replace("/services")}>
              <Text style={s.link}>← Services</Text>
            </Pressable>
            <Text style={s.title}>My bookings</Text>
            <Text style={s.note}>Pull down to check for updates.</Text>
            {error ? (
              <Pressable onPress={() => requestPage(requestedPage.current)}>
                <Text style={s.error}>{error} Tap to retry.</Text>
              </Pressable>
            ) : null}
          </>
        }
        ListEmptyComponent={
          busy ? (
            <ActivityIndicator />
          ) : (
            <Text style={s.note}>
              {error
                ? ""
                : "You have no bookings yet. Choose a service to make a request."}
            </Text>
          )
        }
        renderItem={({ item }) => (
          <Pressable
            style={s.card}
            onPress={() =>
              router.push({
                pathname: "/booking/[id]",
                params: { id: item.id },
              })
            }
          >
            <Text style={s.label}>{item.service.name}</Text>
            <Text>{item.status.replace(/_/g, " ")}</Text>
            <Text style={s.note}>
              {new Date(item.preferredDate).toLocaleString()} {"\n"}
              {item.address}
            </Text>
            <Text selectable>Reference: {item.id.slice(0, 8)}</Text>
          </Pressable>
        )}
        ListFooterComponent={
          items.length < total ? (
            <Pressable
              style={s.button}
              disabled={busy}
              onPress={() => requestPage(page + 1)}
            >
              {busy ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={s.buttonText}>Load more bookings</Text>
              )}
            </Pressable>
          ) : null
        }
      />
    </SafeAreaView>
  );
}
