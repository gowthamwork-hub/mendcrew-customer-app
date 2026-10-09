import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../theme/colors";
export default function Welcome() {
  const { width } = useWindowDimensions();
  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.content} bounces={false}>
        <Text style={s.eyebrow}>Book trusted home services</Text>
        <View style={s.brand}>
          <View style={s.mark}>
            <Ionicons name="home" size={64} color={colors.primary} />
            <Ionicons
              name="hammer"
              size={25}
              color={colors.ink}
              style={s.tool}
            />
          </View>
          <Text style={s.name}>MendCrew</Text>
          <Text style={s.tagline}>Local Service. Lasting Care.</Text>
        </View>
        <Image
          source={require("../assets/mendcrew-landscape.png")}
          style={[s.landscape, { height: Math.min(width, 680) / 1.5 }]}
          accessibilityLabel="Illustrated temple, coconut palms and coast inspired by our local service areas"
          resizeMode="cover"
        />
        <View style={s.bottom}>
          <Text style={s.areas}>Nagercoil | Suchindram</Text>
          <Text style={s.note}>
            A helping hand for the place you call home.
          </Text>
          <Pressable
            accessibilityRole="button"
            style={({ pressed }) => [s.button, pressed && { opacity: 0.85 }]}
            onPress={() => router.push("/services")}
          >
            <Text style={s.buttonText}>Get Started</Text>
            <Ionicons name="arrow-forward" color="white" size={22} />
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 22,
    paddingBottom: 24,
  },
  eyebrow: {
    fontSize: 16,
    color: colors.ink,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  brand: { alignItems: "center", paddingTop: 36, paddingBottom: 28 },
  mark: { height: 70, width: 76, alignItems: "center" },
  tool: { position: "absolute", right: 2, top: 1 },
  name: {
    fontSize: 38,
    fontWeight: "900",
    color: colors.ink,
    letterSpacing: -1.5,
    marginTop: 12,
  },
  tagline: { fontSize: 14, color: colors.ink, marginTop: 6 },
  landscape: { width: "100%", aspectRatio: 1.5, maxWidth: 680 },
  bottom: {
    width: "100%",
    maxWidth: 480,
    paddingHorizontal: 28,
    alignItems: "center",
    marginTop: 20,
  },
  areas: { fontSize: 14, fontWeight: "700", color: colors.ink },
  note: {
    fontSize: 13,
    color: colors.muted,
    textAlign: "center",
    marginTop: 12,
    marginBottom: 24,
  },
  button: {
    backgroundColor: colors.primary,
    width: "100%",
    borderRadius: 32,
    paddingVertical: 18,
    paddingHorizontal: 26,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 24,
  },
  buttonText: { color: "white", fontSize: 18, fontWeight: "700" },
});
