import { DomainError } from "./errors.js";
import {createId, createBookingReference } from "./ids.js";
import { createWaitlistQueue } from "./waitlistQueue.js";

export function createStore() {
    return {
        events: new Map (),
        bookings: new Map (),
        bookingsByReference: new Map (),
    };
}

export function createEvent (store, name) {
    const event = {
        id: createId(),
        name: name,
        tiers: new Map(),
    };

    store.events.set(event.id, event);

    return event;
}

export function addTier(event, name,price, capacity) {
    const tier = {
        id: createId(),
        name: name,
        price: price,
        capacity: capacity,
        available: capacity,
    };

    event.tiers.set(tier.id, tier);

    return tier; 
}

export function book(store, event, tier, customerName, quantity) {
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
        throw new DomainError(
            "Quantity must be a whole number from 1 to 10",
            "INVALID_QUANTITY"
        );
    }

    if (tier.available < quantity) {
        throw new DomainError(
            "Not enough tickets available",
            "SOLD_OUT"
        );
    }

    const booking = {
        id: createId(),
        reference: createBookingReference(),
        eventId: event.id,
        tierId: tier.id,
        customerName: customerName,
        quantity: quantity,
        totalPrice: tier.price * quantity,
        status: "CONFIRMED",
    };

    tier.available -= quantity;

    store.bookings.set(booking.id, booking);
    store.bookingsByReference.set(booking.reference, booking);

    return booking;
}

export function findBookingByReference(store, reference) {
    return store.bookingsByReference.get(reference) ?? null;
}

export function cancelBooking(store, booking) {
    if (booking.status === "CANCELLED") {
        throw new DomainError(
            "Booking has already been cancelled",
            "ALREADY_CANCELLED"
        );
    }

    const event = store.events.get(booking.eventId)
    const tier = event.tiers.get(booking.tierId)

    tier.available += booking.quantity;
    booking.status = "CANCELLED";

    return booking;
}

export function joinWaitlist(store, event, tier, customerName, quantity) {
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
        throw new DomainError(
            "Quantity must be a whole number from 1 to 10",
            "INVALID_QUANTITY"
        );
    }

    if (!store.waitlists) {
        store.waitlists = new Map();
    }

    const key = `${event.id}:${tier.id}`;
    if (!store.waitlists.has(key)) {
        store.waitlists.set(key, createWaitlistQueue());
    }

    const queue = store.waitlists.get(key);
    queue.enqueue({ customerName, quantity });

    return queue.size();
     
}


