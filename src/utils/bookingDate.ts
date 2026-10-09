export type PickerMode = "date" | "time";

export type BookingDateTimePickerProps = {
  value: Date;
  onChange: (value: Date) => void;
  disabled?: boolean;
};

export function nextBookingHour(now = new Date()): Date {
  const next = new Date(now);
  next.setHours(next.getHours() + 1, 0, 0, 0);
  return next;
}

// Calendar selections must preserve the time; clock selections preserve the day.
export function mergeBookingDate(
  current: Date,
  selected: Date,
  mode: PickerMode,
): Date {
  const result = new Date(current);
  if (mode === "date") {
    result.setFullYear(
      selected.getFullYear(),
      selected.getMonth(),
      selected.getDate(),
    );
  } else {
    result.setHours(selected.getHours(), selected.getMinutes());
  }
  result.setSeconds(0, 0);
  return result;
}

export function localDateTimeValue(value: Date): string {
  const pad = (part: number) => String(part).padStart(2, "0");
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}T${pad(value.getHours())}:${pad(value.getMinutes())}`;
}
