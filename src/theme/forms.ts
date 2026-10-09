import { StyleSheet } from "react-native";
import { colors } from "./colors";
export const formStyles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: 22, paddingBottom: 60 },
  title: { fontSize: 27, fontWeight: "800", color: colors.ink, marginTop: 20 },
  note: { color: colors.muted, marginVertical: 18, lineHeight: 22 },
  label: {
    color: colors.ink,
    fontWeight: "700",
    marginTop: 16,
    marginBottom: 8,
  },
  input: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 14,
    fontSize: 16,
  },
  button: {
    backgroundColor: colors.primary,
    padding: 17,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: { color: "white", fontWeight: "800" },
  link: { color: colors.primary, fontWeight: "700", paddingVertical: 14 },
  error: { color: "#A33", marginVertical: 12, lineHeight: 22 },
  card: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 18,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
