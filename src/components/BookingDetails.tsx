import React, { useCallback, useEffect, useRef, useState } from "react";
import { isAxiosError } from "axios";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  cancelBooking,
  getBooking,
  getPolicy,
  errorMessage,
  type Policy,
} from "../services/api";
import type { Booking, BookingReceipt } from "../types/booking";
import { colors } from "../theme/colors";

export function BookingDetails({ receipt }: { receipt: BookingReceipt }) {
  return <BookingDetailsContent key={receipt.id} receipt={receipt} />;
}

function BookingDetailsContent({ receipt }: { receipt: BookingReceipt }) {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkedAt, setCheckedAt] = useState<Date | null>(null);
  const [policy, setPolicy] = useState<Policy | null>(null);
  const [policyError, setPolicyError] = useState("");
  const [now, setNow] = useState(() => Date.now());
  const [cancelling, setCancelling] = useState(false);
  const request = useRef<AbortController | null>(null);

  const refresh = useCallback(async () => {
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    try {
      const policyRequest = getPolicy(controller.signal).then(result => {
        if (!controller.signal.aborted) { setPolicy(result); setPolicyError(""); }
      }).catch(cause => {
        if (!controller.signal.aborted) setPolicyError(errorMessage(cause));
      });
      const result = await getBooking(receipt.id, controller.signal);
      if (controller.signal.aborted) return;
      setBooking(result);
      setError(null);
      setCheckedAt(new Date());
      await policyRequest;
    } catch (cause) {
      if (controller.signal.aborted) return;
      setError(
        isAxiosError(cause) && cause.response?.status === 404
          ? "This booking could not be found. Keep your reference and contact MendCrew."
          : "Could not refresh your booking. Check your connection and try again.",
      );
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, [receipt.id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Fetch the remote booking on mount with abort cleanup.
    void refresh();
    return () => request.current?.abort();
  }, [refresh]);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const status = booking?.status ?? receipt.status;
  const canCancel =
    booking &&
    policy &&
    ["PENDING", "CONFIRMED", "ASSIGNED"].includes(booking.status) &&
    new Date(booking.preferredDate).getTime() >
      now + policy.cancellationLeadMinutes * 60000;
  const cancel = async () => {
    if (cancelling || loading) return;
    setCancelling(true);
    setError(null);
    try {
      setBooking(await cancelBooking(receipt.id));
      setCheckedAt(new Date());
      setNow(Date.now());
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setCancelling(false);
    }
  };
  const detail = (label: string, value: string) => (
    <View style={styles.detail}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );

  return (
    <View>
      <View style={styles.card}>
        <Text style={styles.label}>Booking reference</Text>
        <Text selectable style={styles.reference}>
          {receipt.id}
        </Text>
        <View style={styles.badge}>
          <Text style={styles.status}>{status.replace(/_/g, " ")}</Text>
        </View>
        {status === "PENDING" && (
          <Text style={styles.note}>
            Awaiting technician confirmation. Your preferred time is a request
            and will be confirmed separately.
          </Text>
        )}
        {booking && (
          <>
            {detail("Service", booking.service.name)}
            {detail("Customer", booking.customerName)}
            {detail("Mobile number", booking.phone)}
            {detail("Service address", booking.address)}
            {booking.serviceArea ? detail("Area", booking.serviceArea) : null}
            {booking.technician
              ? detail("Assigned technician", booking.technician.user.name)
              : null}
            {detail(
              "Preferred date and time",
              new Date(booking.preferredDate).toLocaleString(),
            )}
            {booking.description ? detail("Issue", booking.description) : null}
          </>
        )}
        {checkedAt && (
          <Text style={styles.note}>
            Last checked: {checkedAt.toLocaleTimeString()}
            {error ? " (showing last saved details)" : ""}
          </Text>
        )}
        {booking?.history.map((event, index) => (
          <Text key={index} style={styles.note}>
            {event.toStatus.replace(/_/g, " ")} ·{" "}
            {new Date(event.createdAt).toLocaleString()}
          </Text>
        ))}
        {policy?.supportContact && (
          <Text selectable style={styles.note}>
            Support: {policy.supportContact}
          </Text>
        )}
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
      {policyError && <Text style={styles.error}>Booking rules could not be loaded. Refresh to retry.</Text>}
      <Pressable
        accessibilityRole="button"
        style={styles.button}
        onPress={() => {
          setLoading(true);
          setError(null);
          void refresh();
        }}
        disabled={loading || cancelling}
      >
        {loading ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <Text style={styles.buttonText}>Refresh status</Text>
        )}
      </Pressable>
      {canCancel && (
        <Pressable
          style={styles.button}
          disabled={cancelling || loading}
          onPress={() => void cancel()}
        >
          <Text style={styles.buttonText}>
            {cancelling ? "Cancelling…" : "Cancel booking"}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    padding: 20,
  },
  label: { color: colors.muted, fontSize: 13, marginBottom: 5 },
  reference: { color: colors.ink, fontWeight: "700", fontSize: 15 },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "#E6F5F1",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 16,
  },
  status: { color: colors.primary, fontWeight: "800" },
  note: { color: colors.muted, marginTop: 12, lineHeight: 21 },
  detail: { marginTop: 18 },
  value: { color: colors.ink, fontSize: 16, lineHeight: 23 },
  error: { color: "#A33", marginTop: 16, lineHeight: 21 },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    padding: 17,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: { color: colors.white, fontWeight: "800", fontSize: 16 },
});
