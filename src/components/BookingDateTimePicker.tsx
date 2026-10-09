import React, { useEffect, useRef, useState } from "react";
import {
  Keyboard,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DateTimePicker, {
  DateTimePickerAndroid,
} from "@react-native-community/datetimepicker";
import Ionicons from "@expo/vector-icons/Ionicons";
import { colors } from "../theme/colors";
import {
  mergeBookingDate,
  type BookingDateTimePickerProps,
  type PickerMode,
} from "../utils/bookingDate";

export function BookingDateTimePicker({
  value,
  onChange,
  disabled = false,
}: BookingDateTimePickerProps) {
  const [mode, setMode] = useState<PickerMode | null>(null);
  const [draft, setDraft] = useState(value);
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);
  const androidDialog = useRef<PickerMode | null>(null);

  useEffect(
    () => () => {
      if (androidDialog.current)
        void DateTimePickerAndroid.dismiss(androidDialog.current);
    },
    [],
  );

  const open = (selection: PickerMode) => {
    if (disabled) return;
    Keyboard.dismiss();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (Platform.OS === "android") {
      androidDialog.current = selection;
      DateTimePickerAndroid.open({
        value,
        mode: selection,
        minimumDate: selection === "date" ? today : undefined,
        onValueChange: (_event, selected) => {
          androidDialog.current = null;
          onChange(mergeBookingDate(value, selected, selection));
        },
        onDismiss: () => {
          androidDialog.current = null;
        },
      });
    } else {
      setDraft(new Date(value));
      setMode(selection);
    }
  };

  const dateLabel = value.toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const timeLabel = value.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
  const isPast = value.getTime() <= now.getTime();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  return (
    <View style={styles.field}>
      <Text style={styles.label}>Preferred date and time</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Choose date, currently ${dateLabel}`}
        disabled={disabled}
        onPress={() => open("date")}
        style={[styles.control, disabled && styles.disabled]}
      >
        <Ionicons name="calendar-outline" size={23} color={colors.primary} />
        <View style={styles.selection}>
          <Text style={styles.caption}>Date</Text>
          <Text style={styles.value}>{dateLabel}</Text>
        </View>
        <Ionicons name="chevron-down" size={18} color={colors.muted} />
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Choose time, currently ${timeLabel}`}
        disabled={disabled}
        onPress={() => open("time")}
        style={[styles.control, disabled && styles.disabled]}
      >
        <Ionicons name="time-outline" size={23} color={colors.primary} />
        <View style={styles.selection}>
          <Text style={styles.caption}>Time</Text>
          <Text style={styles.value}>{timeLabel}</Text>
        </View>
        <Ionicons name="chevron-down" size={18} color={colors.muted} />
      </Pressable>
      <Text style={[styles.hint, isPast && styles.error]}>
        {isPast
          ? "Choose a future date and time."
          : "Times are shown in your local time. Tap to change."}
      </Text>

      {Platform.OS === "ios" && (
        <Modal
          transparent
          animationType="slide"
          visible={mode !== null}
          onRequestClose={() => setMode(null)}
        >
          <View style={styles.overlay}>
            <SafeAreaView edges={["bottom"]} style={styles.sheet}>
              <Text style={styles.sheetTitle}>
                {mode === "date" ? "Choose a date" : "Choose a time"}
              </Text>
              {mode && (
                <DateTimePicker
                  value={draft}
                  mode={mode}
                  display="spinner"
                  themeVariant="light"
                  minimumDate={mode === "date" ? today : undefined}
                  onValueChange={(_event, selected) =>
                    setDraft(mergeBookingDate(draft, selected, mode))
                  }
                />
              )}
              <View style={styles.actions}>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setMode(null)}
                  style={styles.action}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    onChange(draft);
                    setMode(null);
                  }}
                  style={[styles.action, styles.done]}
                >
                  <Text style={styles.doneText}>Done</Text>
                </Pressable>
              </View>
            </SafeAreaView>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { marginBottom: 17 },
  label: { fontWeight: "700", color: colors.ink, marginBottom: 8 },
  control: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  selection: { flex: 1 },
  caption: { fontSize: 12, color: colors.muted, marginBottom: 3 },
  value: { fontSize: 16, color: colors.ink, fontWeight: "600" },
  hint: { fontSize: 13, color: colors.muted, lineHeight: 19 },
  error: { color: "#A33" },
  disabled: { opacity: 0.5 },
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.35)",
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  sheetTitle: { color: colors.ink, fontSize: 20, fontWeight: "700" },
  actions: { flexDirection: "row", gap: 12, marginTop: 12 },
  action: {
    flex: 1,
    alignItems: "center",
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: colors.border,
  },
  done: { backgroundColor: colors.primary, borderColor: colors.primary },
  cancelText: { color: colors.primary, fontWeight: "700" },
  doneText: { color: colors.white, fontWeight: "700" },
});
