import React, { useEffect, useRef, useState } from "react";
import { isAxiosError } from "axios";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  createBooking,
  getPolicy,
  errorMessage,
  type Policy,
} from "../services/api";
import { useSession } from "../auth/SessionProvider";
import { BookingDetails } from "../components/BookingDetails";
import { BookingDateTimePicker } from "../components/BookingDateTimePicker";
import { nextBookingHour } from "../utils/bookingDate";
import type { BookingReceipt } from "../types/booking";
import type { Service } from "../types/service";
import { colors } from "../theme/colors";
export default function BookingScreen({
  service,
  onBack,
}: {
  service: Service;
  onBack: () => void;
}) {
  const { user } = useSession();
  const [name, setName] = useState(user?.name ?? "");
  const phone = user?.phone ?? "";
  const [area, setArea] = useState("Nagercoil");
  const [policy, setPolicy] = useState<Policy | null>(null);
  const [policyError, setPolicyError] = useState("");
  const fetchPolicy = async () => {
    try {
      setPolicy(await getPolicy());
      setPolicyError("");
    } catch (e) {
      setPolicyError(errorMessage(e));
    }
  };
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Load configurable booking policy from the backend.
    void fetchPolicy();
  }, []);
  const submission = useRef<{ body: string; key: string } | null>(null);
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState<Date>(() => nextBookingHour());
  const [busy, setBusy] = useState(false);
  const [submissionError, setSubmissionError] = useState("");
  const [booked, setBooked] = useState<BookingReceipt | null>(null);
  const submitting = useRef(false);
  const submit = async () => {
    if (submitting.current) return;
    setSubmissionError("");
    if (
      name.trim().length < 2 ||
      !/^[6-9]\d{9}$/.test(phone.trim()) ||
      address.trim().length < 10 ||
      !policy
    ) {
      setSubmissionError(
        "Enter your name, valid Indian mobile number and a complete address (at least 10 characters). Load booking rules before submitting.",
      );
      return;
    }
    if (Number.isNaN(date.getTime()) || date.getTime() <= Date.now()) {
      setSubmissionError(
        "Choose a future date and time for your booking.",
      );
      return;
    }
    submitting.current = true;
    setBusy(true);
    try {
      const input = {
        serviceId: service.id,
        customerName: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
        description: description.trim(),
        preferredDate: date.toISOString(),
        serviceArea: area,
      };
      const body = JSON.stringify(input);
      if (submission.current?.body !== body)
        submission.current = {
          body,
          key: `booking_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        };
      const result = await createBooking(input, submission.current.key);
      setBooked(result);
    } catch (cause) {
      submitting.current = false;
      let message = errorMessage(cause);
      if (isAxiosError(cause)) {
        if (cause.code === "ECONNABORTED" || !cause.response) {
          message =
            "We could not confirm your booking. Check My Bookings, or retry with the same details to avoid a duplicate request.";
        } else if (cause.response.status === 400) {
          const detail: unknown = cause.response.data?.message;
          if (typeof detail === "string") message = detail;
          else if (
            Array.isArray(detail) &&
            detail.every((item) => typeof item === "string")
          )
            message = detail.join("\n");
        }
      }
      setSubmissionError(message);
    } finally {
      setBusy(false);
    }
  };
  if (booked)
    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView key={booked.id} contentContainerStyle={styles.content}>
          <Pressable onPress={onBack}>
            <Text style={styles.back}>← Back to services</Text>
          </Pressable>
          <Text style={styles.title}>Booking requested</Text>
          <Text style={styles.note}>
            Your request is saved in My Bookings. Availability will be confirmed
            separately.
          </Text>
          <BookingDetails receipt={booked} />
        </ScrollView>
      </SafeAreaView>
    );
  const field = (
    label: string,
    value: string,
    setter: (s: string) => void,
    placeholder: string,
    multiline = false,
  ) => (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          multiline && { height: 90, textAlignVertical: "top" },
        ]}
        value={value}
        onChangeText={setter}
        placeholder={placeholder}
        multiline={multiline}
        editable={!busy}
        maxLength={label === "Your name" ? 100 : label === "Service address" ? 1000 : 2000}
      />
    </View>
  );
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.content}
      >
        <Pressable onPress={onBack} disabled={busy}>
          <Text style={styles.back}>← Back to services</Text>
        </Pressable>
        <Text style={styles.title}>Book {service.name}</Text>
        <Text style={styles.note}>
          A technician will confirm availability after your request.
        </Text>
        {field("Your name", name, setName, "Full name")}
        <Text style={styles.label}>Signed-in mobile: +91 {phone}</Text>
        <Text style={[styles.label, { marginTop: 18 }]}>Service area</Text>
        <View style={{ flexDirection: "row", gap: 12, marginBottom: 18 }}>
          {["Nagercoil", "Suchindram"].map((value) => (
            <Pressable
              key={value}
              disabled={busy}
              onPress={() => setArea(value)}
              style={[
                styles.input,
                { backgroundColor: area === value ? "#E6F5F1" : "white" },
              ]}
            >
              <Text>{value}</Text>
            </Pressable>
          ))}
        </View>
        {policy ? (
          <Text style={styles.note}>
            {policy.estimateMessage}
            {policy.workingHourStart !== null
              ? `\nWorking hours: ${policy.workingHourStart}:00–${policy.workingHourEnd}:00 (India).`
              : ""}
            {`\nMinimum notice: ${policy.bookingLeadMinutes} minutes. Online cancellation closes ${policy.cancellationLeadMinutes} minutes before the requested time.`}
            {policy.supportContact ? `\nSupport: ${policy.supportContact}` : ""}
          </Text>
        ) : (
          <Pressable onPress={() => void fetchPolicy()}>
            <Text style={styles.back}>
              {policyError || "Loading booking rules…"}{" "}
              {policyError ? "Tap to retry" : ""}
            </Text>
          </Pressable>
        )}
        {field(
          "Service address",
          address,
          setAddress,
          "Street, area, landmark",
          true,
        )}
        {field(
          "Describe the issue",
          description,
          setDescription,
          "What needs attention?",
          true,
        )}
        <BookingDateTimePicker
          value={date}
          onChange={setDate}
          disabled={busy || !policy}
        />
        {submissionError ? <Text accessibilityRole="alert" style={styles.error}>{submissionError}</Text> : null}
        <Pressable
          style={styles.button}
          onPress={() => void submit()}
          disabled={busy || !policy}
        >
          {busy ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>Request booking</Text>
          )}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: 22, paddingBottom: 60 },
  back: { color: colors.primary, fontWeight: "700", marginBottom: 24 },
  title: { fontSize: 27, fontWeight: "800", color: colors.ink },
  note: { color: colors.muted, marginTop: 8, marginBottom: 24 },
  error: { color: "#A33", marginTop: 16, lineHeight: 22 },
  field: { marginBottom: 17 },
  label: { fontWeight: "700", color: colors.ink, marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "white",
    borderRadius: 16,
    padding: 14,
    fontSize: 15,
  },
  button: {
    backgroundColor: colors.primary,
    padding: 17,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 12,
  },
  buttonText: { color: "white", fontWeight: "800", fontSize: 16 },
});
