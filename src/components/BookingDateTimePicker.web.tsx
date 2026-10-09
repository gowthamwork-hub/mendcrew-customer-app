import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors } from "../theme/colors";
import {
  localDateTimeValue,
  type BookingDateTimePickerProps,
} from "../utils/bookingDate";

export function BookingDateTimePicker({
  value,
  onChange,
  disabled = false,
}: BookingDateTimePickerProps) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(timer);
  }, []);
  const isPast = value.getTime() <= now;
  return (
    <View style={styles.field}>
      <Text style={styles.label}>Preferred date and time</Text>
      <input
        type="datetime-local"
        aria-label="Preferred date and time"
        required
        disabled={disabled}
        value={localDateTimeValue(value)}
        min={localDateTimeValue(new Date(now + 60000))}
        onChange={(event) => {
          const selected = new Date(event.currentTarget.value);
          if (!Number.isNaN(selected.getTime())) onChange(selected);
          else event.currentTarget.value = localDateTimeValue(value);
        }}
        style={{
          boxSizing: "border-box",
          width: "100%",
          padding: 14,
          fontSize: 16,
          border: "1px solid #D6E1DD",
          borderRadius: 12,
          color: colors.ink,
          backgroundColor: colors.white,
          fontFamily: "inherit",
        }}
      />
      <Text style={[styles.hint, isPast && styles.error]}>
        {isPast
          ? "Choose a future date and time."
          : "Times are shown in your local time."}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  field: { marginBottom: 17 },
  label: { fontWeight: "700", color: colors.ink, marginBottom: 8 },
  hint: { fontSize: 13, color: colors.muted, marginTop: 8 },
  error: { color: "#A33" },
});
