import { useEffect, useState } from "react";
import { Redirect, router, useLocalSearchParams } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { api, errorMessage, type Session } from "../services/api";
import { useSession } from "../auth/SessionProvider";
import { formStyles as s } from "../theme/forms";
export default function SignIn() {
  const { accept, user } = useSession();
  const { serviceId } = useLocalSearchParams<{ serviceId?: string }>();
  const [config, setConfig] = useState<{
    mode: string;
    otpConfigured: boolean;
  } | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const load = async () => {
    try {
      setConfig((await api.get("/auth/config")).data);
      setError("");
    } catch (e) {
      setError(errorMessage(e));
    }
  };
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Discover the backend authentication mode on mount.
    void load();
  }, []);
  const submit = async () => {
    if (busy) return;
    if (name.trim().length < 2 || !/^[6-9]\d{9}$/.test(phone)) {
      setError("Enter your name and a valid 10-digit Indian mobile number.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      if (config?.mode === "development") {
        await accept(
          (await api.post<Session>("/auth/development", { name, phone })).data,
        );
      } else if (!sent) {
        await api.post("/auth/otp/request", { phone });
        setSent(true);
      } else {
        await accept(
          (await api.post<Session>("/auth/otp/verify", { name, phone, code }))
            .data,
        );
      }
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };
  if (user)
    return <Redirect href={serviceId ? { pathname: "/book", params: { serviceId } } : "/services"} />;
  return (
    <SafeAreaView style={s.safe}>
      <ScrollView
        contentContainerStyle={s.content}
        keyboardShouldPersistTaps="handled"
      >
        <Pressable onPress={() => router.replace("/services")}>
          <Text style={s.link}>← Services</Text>
        </Pressable>
        <Text style={s.title}>Welcome to MendCrew</Text>
        <Text style={s.note}>
          Sign in to request a service and track your bookings.
        </Text>
        {config?.mode === "development" && (
          <Text style={s.error}>
            Local development login. Phone ownership is not verified. Pilot
            accounts require OTP verification.
          </Text>
        )}
        {config?.mode === "otp" && !config.otpConfigured && (
          <Text style={s.error}>
            Phone verification is not available yet. Please contact MendCrew.
          </Text>
        )}
        <Text style={s.label}>Your name</Text>
        <TextInput
          style={s.input}
          value={name}
          onChangeText={setName}
          maxLength={100}
          placeholder="Full name"
          editable={!busy}
        />
        <Text style={s.label}>Mobile number (+91)</Text>
        <TextInput
          style={s.input}
          value={phone}
          onChangeText={(text) => {
            setPhone(text.replace(/\D/g, "").slice(0, 10));
            setSent(false);
          }}
          keyboardType="phone-pad"
          maxLength={10}
          placeholder="10-digit mobile"
          editable={!busy}
        />
        {sent && (
          <>
            <Text style={s.label}>Verification code</Text>
            <TextInput
              style={s.input}
              value={code}
              onChangeText={setCode}
              keyboardType="number-pad"
              maxLength={8}
              autoComplete="sms-otp"
            />
          </>
        )}
        {error ? <Text style={s.error}>{error}</Text> : null}
        {config ? (
          <Pressable
            style={s.button}
            disabled={busy || (config.mode === "otp" && !config.otpConfigured)}
            onPress={() => void submit()}
          >
            {busy ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={s.buttonText}>
                {config.mode === "development"
                  ? "Continue (development)"
                  : sent
                    ? "Verify and continue"
                    : "Send verification code"}
              </Text>
            )}
          </Pressable>
        ) : (
          <Pressable style={s.button} onPress={() => void load()}>
            <Text style={s.buttonText}>Retry connection</Text>
          </Pressable>
        )}
        {sent && (
          <Pressable
            onPress={() => {
              setSent(false);
              setCode("");
            }}
          >
            <Text style={s.link}>Request a new code</Text>
          </Pressable>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
