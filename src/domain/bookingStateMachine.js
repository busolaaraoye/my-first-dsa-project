import { DomainError } from "./errors.js";

export const BOOKING_STATES = {
    PENDING: "pending",
    PAID: "paid",
    CANCELLED: "cancelled",
    REFUNDED: "refunded",
    CHECKED_IN: "checked_in"
};

const ALLOWED_TRANSITIONS = {
  [BOOKING_STATES.PENDING]: [
    BOOKING_STATES.PAID,
    BOOKING_STATES.CANCELLED,
  ],

  [BOOKING_STATES.PAID]: [
    BOOKING_STATES.CHECKED_IN,
    BOOKING_STATES.REFUNDED,
    BOOKING_STATES.CANCELLED,
  ],

  [BOOKING_STATES.CANCELLED]: [],
  [BOOKING_STATES.REFUNDED]: [],
  [BOOKING_STATES.CHECKED_IN]: [],
};

export function canTransition(from, to) {
    return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false;
}

export function assertTransition(from, to) {
  if (!canTransition(from, to)) {
    throw new DomainError(
      `Cannot move booking from ${from} to ${to}`,
      "INVALID_TRANSITION"
    );
  }
}

export function transitionBooking(booking, to) {
  assertTransition(booking.status, to);

  return {
    ...booking,
    status: to
  };
}