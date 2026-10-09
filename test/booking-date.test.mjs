import { test } from "node:test";
import assert from "node:assert/strict";
import process from "node:process";
import {
  localDateTimeValue,
  mergeBookingDate,
  nextBookingHour,
} from "../src/utils/bookingDate.ts";
process.env.TZ = "Asia/Kolkata";
void test("India local appointment converts to UTC without shifting the chosen clock", () => {
  const chosen = new Date(2027, 0, 15, 10, 30);
  assert.equal(localDateTimeValue(chosen), "2027-01-15T10:30");
  assert.equal(chosen.toISOString(), "2027-01-15T05:00:00.000Z");
});
void test("calendar selection preserves time at month-end", () => {
  const current = new Date(2027, 0, 31, 10, 30, 54);
  const changed = mergeBookingDate(current, new Date(2027, 1, 2, 0, 0), "date");
  assert.equal(localDateTimeValue(changed), "2027-02-02T10:30");
  assert.equal(current.getDate(), 31);
  assert.equal(changed.getSeconds(), 0);
});
void test("clock selection preserves day and next hour crosses midnight", () => {
  const current = new Date(2027, 0, 31, 10, 30);
  assert.equal(
    localDateTimeValue(
      mergeBookingDate(current, new Date(2028, 11, 2, 16, 45), "time"),
    ),
    "2027-01-31T16:45",
  );
  assert.equal(
    localDateTimeValue(nextBookingHour(new Date(2027, 0, 31, 23, 50))),
    "2027-02-01T00:00",
  );
});
