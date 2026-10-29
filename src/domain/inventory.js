import { DomainError } from "./errors.js";
import {createId, createBookingReference } from "./ids.js";
import { createWaitlistQueue } from "./waitlistQueue.js";

export function createStore() {
    return {
        events: new Map (),
        bookings: new Map (),
        bookingsByReference: new Map (),
        waitlists: new Map (),
    };
}

export function createEvent(store,details) {
    const {title, city, venue, date} = details;

    const validDate = 
        typeof date === "string" && 
        /^\d{4}-\d{2}-\d{2}$/.test(date) &&
        !Number.isNaN(Date.parse(date)) &&
        new Date(date).toISOString().slice(0, 10) === date;

        if (
            typeof title !== "string" || !title.trim() ||
            typeof city !== "string" || !city.trim() ||
            typeof venue !== "string" || !venue.trim() ||
            !validDate 
        ) {
            throw new DomainError(
                "A valid title, city, venue and date are required",
                "VALIDATION"
            );
        }

        const event = {
            id: createId(),
            title: title.trim(),
            city: city.trim(),
            venue: venue.trim(),
            date,
            status: "DRAFT",
            tiers: new Map(),
        };
        store.events.set(event.id, event) 
        return event;
}

export function addTier(event, name,price, capacity) {
    if  (!Number.isInteger(price) || price < 0 ||
         !Number.isInteger(capacity) || capacity < 1) {
            throw new DomainError(
                "Price must be a whole number and capacity must be at least 1",
                "VALIDATION"
            );
         }

    const tier = {
        id: createId(),
        name: name,
        price: price,
        capacity: capacity,
        sold: 0, 
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
    if (event.status !== "PUBLISHED") {
        throw new DomainError(
            "Event is not published",
            "INVALID_STATE"
        );
    }
    if (!Number.isInteger(tier.price) || tier.price < 0) {
        throw new DomainError(
            "Ticket price must be a valid whole number",
            "VALIDATION"
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
        status: "PENDING",
    };

    tier.available -= quantity;
    tier.sold += quantity;

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
    tier.sold -= booking.quantity
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

export function publishEvent(store, eventId) {
    const event = store.events.get(eventId);
    if (!event) {
        throw new DomainError("Event not found", "NOT_FOUND");
    }
    if (event.tiers.size === 0) {
        throw new DomainError("Cannot publish an event without ticket tiers", "INVALID_STATE");
    }
    event.status = "PUBLISHED";
    return event;
}

export function unpublishEvent(store, eventId) {
    const event = store.events.get(eventId);

    if (!event) {
        throw new DomainError(
            "Event not found",
            "NOT_FOUND"
        );
    }

    event.status = "DRAFT";

    return event;
}

export function listEventSummaries(store, { publishedOnly = true } = {}) {
    const events = Array.from(store.events.values());

    const visibleEvents = publishedOnly
        ? events.filter(event => event.status === "PUBLISHED")
        : events;

    return visibleEvents.map(event => ({
        id: event.id,
        title: event.title,
        city: event.city,
        venue: event.venue,
        date: event.date,
        tiers: Array.from(event.tiers.values()).map(tier => ({
            id: tier.id,
            name: tier.name,
            price: tier.price,
            available: tier.available,
        })),
    }));
}
