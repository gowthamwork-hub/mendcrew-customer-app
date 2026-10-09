import { create, isAxiosError } from "axios";
import type { Service } from "../types/service";
import type { Booking, BookingReceipt } from "../types/booking";
export const api = create({
  baseURL: process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000",
  timeout: 10000,
});
export function setAuthToken(token: string | null) {
  if (token) api.defaults.headers.common.Authorization = `Bearer ${token}`;
  else delete api.defaults.headers.common.Authorization;
}
export function errorMessage(error: unknown) {
  if (isAxiosError(error)) {
    const message: unknown = error.response?.data?.message;
    if (typeof message === "string") return message;
    if (
      Array.isArray(message) &&
      message.every((item) => typeof item === "string")
    )
      return message.join("\n");
    if (!error.response)
      return "Unable to connect. Check your connection and try again.";
  }
  return "Unable to process your request. Please try again.";
}
export type Customer = {
  id: string;
  name: string;
  phone: string;
  role: "CUSTOMER";
};
export type Session = { token: string; expiresAt: string; user: Customer };
export type Policy = {
  serviceAreas: string[];
  timeZone: string;
  workingHourStart: number | null;
  workingHourEnd: number | null;
  bookingLeadMinutes: number;
  cancellationLeadMinutes: number;
  supportContact: string | null;
  confirmed: boolean;
  estimateMessage: string;
};
export type Page<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
};
export const getPolicy = async (signal?: AbortSignal): Promise<Policy> =>
  (await api.get("/policy", { signal })).data;
export const getServices = async (signal?: AbortSignal): Promise<Service[]> => {
  const { data } = await api.get<Service[]>("/services", { signal });
  if (!Array.isArray(data)) throw new Error("Invalid services response");
  return data;
};
export type BookingInput = {
  serviceId: string;
  customerName: string;
  phone: string;
  address: string;
  description: string;
  preferredDate: string;
  serviceArea: string;
};
export const createBooking = async (
  input: BookingInput,
  key: string,
): Promise<BookingReceipt> =>
  (await api.post("/bookings", input, { headers: { "Idempotency-Key": key } }))
    .data;
export const getBooking = async (
  id: string,
  signal?: AbortSignal,
): Promise<Booking> =>
  (await api.get(`/bookings/${encodeURIComponent(id)}`, { signal })).data;
export const getBookings = async (
  page: number,
  signal?: AbortSignal,
): Promise<Page<Booking>> =>
  (await api.get("/bookings", { params: { page, limit: 20 }, signal })).data;
export const cancelBooking = async (id: string): Promise<Booking> =>
  (await api.patch(`/bookings/${encodeURIComponent(id)}/cancel`)).data;
