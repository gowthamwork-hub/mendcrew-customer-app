import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { colors } from "../theme/colors";
import type { Service } from "../types/service";
const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
  flash: "flash-outline",
  water: "water-outline",
  snow: "snow-outline",
  settings: "settings-outline",
  thermometer: "thermometer-outline",
  home: "home-outline",
};
export function ServiceCard({
  service,
  onPress,
}: {
  service: Service;
  onPress: () => void;
}) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.card}>
      <View style={styles.icon}>
        <Ionicons
          name={icons[service.icon] ?? "construct-outline"}
          size={29}
          color={colors.primary}
        />
      </View>
      <Text style={styles.title}>{service.name}</Text>
      <Text style={styles.desc}>{service.description}</Text>
    </Pressable>
  );
}
const styles = StyleSheet.create({
  card: {
    width: "48%",
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  icon: {
    width: 54,
    height: 54,
    borderRadius: 16,
    backgroundColor: "#E6F5F1",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 13,
  },
  title: { fontSize: 16, fontWeight: "700", color: colors.ink },
  desc: { fontSize: 12, color: colors.muted, marginTop: 5, lineHeight: 18 },
});
