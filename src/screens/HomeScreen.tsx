import { useCallback, useEffect, useRef, useState } from "react";
import { router } from "expo-router";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSession } from "../auth/SessionProvider";
import { getServices, errorMessage } from "../services/api";
import { ServiceCard } from "../components/ServiceCard";
import { colors } from "../theme/colors";
import type { Service } from "../types/service";
export default function HomeScreen() {
  const { user, signOut } = useSession();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const request = useRef<AbortController | null>(null);
  const load = useCallback(async () => {
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    try {
      const items = await getServices(controller.signal);
      if (!controller.signal.aborted) {
        setServices(items);
        setError(null);
      }
    } catch (cause) {
      if (!controller.signal.aborted) setError(errorMessage(cause));
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, []);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Fetch the remote service catalogue with abort cleanup.
    void load();
    return () => request.current?.abort();
  }, [load]);
  const refresh = () => {
    setLoading(true);
    setError(null);
    void load();
  };
  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.content}>
        <View style={s.header}>
          <View>
            <Text style={s.brand}>MendCrew</Text>
            <Text style={s.tagline}>Local Service. Lasting Care.</Text>
          </View>
          <Ionicons name="home" size={30} color={colors.primary} />
        </View>
        <View style={s.location}>
          <Ionicons name="location-outline" size={16} color={colors.primary} />
          <Text style={s.locationText}>Nagercoil | Suchindram</Text>
        </View>
        <View style={s.navigation}>
          {user ? (
            <>
              <Pressable onPress={() => router.push("/my-bookings")}>
                <Text style={s.link}>My bookings</Text>
              </Pressable>
              <Pressable
                onPress={() =>
                  void signOut().catch(() =>
                    setError(
                      "Signed out locally. The server session will expire automatically.",
                    ),
                  )
                }
              >
                <Text style={s.link}>Sign out</Text>
              </Pressable>
            </>
          ) : (
            <Pressable onPress={() => router.push("/sign-in")}>
              <Text style={s.link}>Sign in</Text>
            </Pressable>
          )}
        </View>
        <View style={s.hero}>
          <Image
            source={require("../assets/mendcrew-landscape.png")}
            style={s.image}
            resizeMode="cover"
          />
          <View style={s.heroCopy}>
            <Text style={s.heroTitle}>Care for your home.</Text>
            <Text style={s.heroText}>
              Local professionals, a simple request away.
            </Text>
          </View>
        </View>
        <Text style={s.heading}>How can we help?</Text>
        <Text style={s.subheading}>Choose a service to request a visit.</Text>
        {loading ? (
          <ActivityIndicator color={colors.primary} size="large" />
        ) : error ? (
          <View style={s.state}>
            <Text style={s.error}>{error}</Text>
            <Pressable onPress={refresh}>
              <Text style={s.link}>Try again</Text>
            </Pressable>
          </View>
        ) : services.length === 0 ? (
          <View style={s.state}>
            <Text style={s.subheading}>
              No services are available right now.
            </Text>
            <Pressable onPress={refresh}>
              <Text style={s.link}>Refresh services</Text>
            </Pressable>
          </View>
        ) : (
          <View style={s.grid}>
            {services.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                onPress={() =>
                  user
                    ? router.push({
                        pathname: "/book",
                        params: { serviceId: service.id },
                      })
                    : router.push({ pathname: "/sign-in", params: { serviceId: service.id } })
                }
              />
            ))}
          </View>
        )}
        <View style={s.footer}>
          <Ionicons
            name="information-circle-outline"
            size={22}
            color={colors.primary}
          />
          <Text style={s.footerText}>
            Your preferred visit is subject to confirmation. An estimate will be
            agreed before work begins.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 48 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  brand: {
    fontSize: 29,
    fontWeight: "900",
    color: colors.ink,
    letterSpacing: -1,
  },
  tagline: { fontSize: 12, color: colors.ink, marginTop: 4 },
  location: { flexDirection: "row", gap: 6, alignItems: "center" },
  locationText: { fontSize: 13, color: colors.muted },
  navigation: { flexDirection: "row", gap: 24, marginVertical: 14 },
  link: { color: colors.primary, fontWeight: "700", paddingVertical: 8 },
  hero: {
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#F6F0DE",
    marginBottom: 26,
  },
  image: { width: "100%", height: 160 },
  heroCopy: { padding: 18 },
  heroTitle: { color: colors.ink, fontSize: 24, fontWeight: "800" },
  heroText: { color: colors.muted, fontSize: 13, marginTop: 6 },
  heading: { fontSize: 23, fontWeight: "800", color: colors.ink },
  subheading: { color: colors.muted, marginTop: 6, marginBottom: 18 },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  state: { paddingVertical: 20 },
  error: { color: "#A33", lineHeight: 22 },
  footer: {
    marginTop: 18,
    padding: 16,
    backgroundColor: "#ECF4EC",
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  footerText: { color: colors.muted, fontSize: 12, flex: 1, lineHeight: 19 },
});
