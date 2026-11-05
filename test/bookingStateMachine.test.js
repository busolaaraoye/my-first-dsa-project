import test from "node:test";
import assert from "node:assert/strict";

import {
  BOOKING_STATES,
  canTransition,
  assertTransition,
  transitionBooking
} from "../src/domain/bookingStateMachine.js";

test("allows valid booking transitions", () => {
  assert.equal(canTransition("pending", "paid"), true);
});

test("rejects invalid booking transitions", () => {
  assert.equal(canTransition("refunded", "paid"), false);
});

test("throws an error for invalid transitions", () => {
  assert.throws(() => {
    assertTransition("refunded", "paid");
  });
});

test("updates booking status correctly", () => {
  const booking = {
    id: "B001",
    status: "pending"
  };

  const updatedBooking = transitionBooking(booking, "paid");

  assert.equal(updatedBooking.status, "paid");
  assert.equal(updatedBooking.id, "B001");
  assert.equal(booking.status, "pending"); // Ensure original booking is unchanged
});

// All permitted booking movements
const allowedMoves = [
["pending", "paid"],
["pending", "cancelled"],
["paid", "checked_in"],
["paid", "refunded"],
["paid", "cancelled"]
];

// Test all permitted movements
test("allows every valid booking transition", () => {
for (const [from, to] of allowedMoves) {
assert.equal(canTransition(from, to), true);
}
});

// Test all forbidden movements
test("rejects every invalid booking transition", () => {
const states = Object.values(BOOKING_STATES);

for (const from of states) {
for (const to of states) {
const isAllowed = allowedMoves.some(
([allowedFrom, allowedTo]) =>
allowedFrom === from && allowedTo === to
);

  if (!isAllowed) {
    assert.equal(canTransition(from, to), false);
    assert.throws(
      () => assertTransition(from, to),
      (error) =>
        error.name === "DomainError" &&
        error.code === "INVALID_TRANSITION"
    );
  }
}
}
});
