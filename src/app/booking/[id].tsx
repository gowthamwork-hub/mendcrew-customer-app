import { router, useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BookingDetails } from "../../components/BookingDetails";
import { formStyles as s } from "../../theme/forms";
export default function Detail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.content}>
        <Pressable onPress={() => router.replace("/my-bookings")}>
          <Text style={s.link}>← My bookings</Text>
        </Pressable>
        <Text style={s.title}>Booking details</Text>
        <BookingDetails receipt={{ id, status: "Loading" }} />
      </ScrollView>
    </SafeAreaView>
  );
}
