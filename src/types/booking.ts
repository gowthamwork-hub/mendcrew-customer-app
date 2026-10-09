import type { Service } from "./service";

export type BookingReceipt = { id: string; status: string };

export type Booking = BookingReceipt & {
  serviceId: string;
  service: Service;
  customerName: string;
  phone: string;
  address: string;
  description: string;
  preferredDate: string;
  createdAt: string;
  serviceArea: string | null;
  technician: { id: string; user: { name: string } } | null;
  history: { fromStatus: string | null; toStatus: string; createdAt: string }[];
};
