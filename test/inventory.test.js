import { test } from "node:test";
import assert from "node:assert/strict";

import {
    createStore,
    createEvent,
    addTier,
    publishEvent,
    unpublishEvent, 
    listEventSummaries,
    book,
    findBookingByReference,
    cancelBooking
} from "../src/domain/inventory.js";

test("listEventSummaries returns only published events by default", () => {
    const store = createStore();

    const event1 = createEvent(store, {
        title: "Tech Conference",
        city: "Lagos",
        venue: "Main Hall",
        date: "2026-12-10"
    });

    addTier(event1, "Regular", 5000, 20);

    const event2 = createEvent(store, {
        title: "Music Festival",
        city: "Ibadan",
        venue: "City Hall",
        date: "2026-12-15"
    });

    addTier(event2, "Regular", 3000, 30);

    publishEvent(store, event1.id);

    const result = listEventSummaries(store);

    assert.equal(result.length, 1);
    assert.equal(result[0].title, "Tech Conference");
});

test("listEventSummaries returns all events when publishedOnly is false", () => {
    const store = createStore();

    const event1 = createEvent(store, {
        title: "Tech Conference",
        city: "Lagos",
        venue: "Main Hall",
        date: "2026-12-10"
    });

    addTier(event1, "Regular", 5000, 20);

    const event2 = createEvent(store, {
        title: "Music Festival",
        city: "Ibadan",
        venue: "City Hall",
        date: "2026-12-15"
    });

    addTier(event2, "Regular", 3000, 30);

    publishEvent(store, event1.id);

    const result = listEventSummaries(store, {
        publishedOnly: false
    });

    assert.equal(result.length, 2);
});

test("publishEvent changes an event status to PUBLISHED", () => {
    const store = createStore();

    const event = createEvent(store, {
        title: "Tech Conference",
        city: "Lagos",
        venue: "Main Hall",
        date: "2026-12-10"
    });

    addTier(event, "Regular", 5000, 20);

    publishEvent(store, event.id);

    assert.equal(event.status, "PUBLISHED");
});

 test("publishEvent throws NOT_FOUND when the event does not exist", () => {
    const store = createStore();

    assert.throws(
        () => publishEvent(store, "missing-event-id"),
        { code: "NOT_FOUND" }
    );
});

test("publishEvent throws INVALID_STATE when an event has no ticket tiers", () => {
    const store = createStore();

    const event = createEvent(store, {
        title: "Tech Conference",
        city: "Lagos",
        venue: "Main Hall",
        date: "2026-12-10"
    });

    assert.throws(
        () => publishEvent(store, event.id),
        { code: "INVALID_STATE" }
    );
});

test("listEventSummaries includes event details", () => {
    const store = createStore();

    const event = createEvent(store, {
        title: "Tech Conference",
        city: "Lagos",
        venue: "Main Hall",
        date: "2026-12-10"
    });

    addTier(event, "Regular", 5000, 20);
    publishEvent(store, event.id);

    const result = listEventSummaries(store);

    assert.equal(result[0].title, "Tech Conference");
    assert.equal(result[0].city, "Lagos");
    assert.equal(result[0].venue, "Main Hall");
    assert.equal(result[0].date, "2026-12-10");
    assert.equal(result[0].tiers[0].price, 5000);
    assert.equal(result[0].tiers[0].available, 20);
});

test("createEvent rejects an event without a title", () => {
    const store = createStore();

    assert.throws(
        () => createEvent(store, {
            title: "",
            city: "Lagos",
            venue: "Main Hall",
            date: "2026-12-10"
        }),
        { code: "VALIDATION" }
    );
});

test("createEvent rejects an event without a city", () => {
    const store = createStore();

    assert.throws(
        () => createEvent(store, {
            title: "Tech Conference",
            city: "",
            venue: "Main Hall",
            date: "2026-12-10"
        }),
        { code: "VALIDATION" }
    );
});

test("createEvent rejects an event without a venue", () => {
    const store = createStore();

    assert.throws(
        () => createEvent(store, {
            title: "Tech Conference",
            city: "Lagos",
            venue: "",
            date: "2026-12-10"
        }),
        { code: "VALIDATION" }
    );
});

test("createEvent rejects an event with an invalid date", () => {
    const store = createStore();

    assert.throws(
        () => createEvent(store, {
            title: "Tech Conference",
            city: "Lagos",
            venue: "Main Hall",
            date: "invalid-date"
        }),
        { code: "VALIDATION" }
    );
});

test("unpublishEvent changes an event status to DRAFT", () => {
    const store = createStore();

    const event = createEvent(store, {
        title: "Music Concert",
        city: "Lagos",
        venue: "Eko Hotel",
        date: "2026-12-20",
    });

    addTier(event, "Regular", 5000, 100);

    publishEvent(store, event.id);
    unpublishEvent(store, event.id);

    assert.equal(event.status, "DRAFT");
});

test("unpublished events do not appear in the public event list", () => {
    const store = createStore();

    const event = createEvent(store, {
        title: "Music Concert",
        city: "Lagos",
        venue: "Eko Hotel",
        date: "2026-12-20",
    });

    addTier(event, "Regular", 5000, 100);

    publishEvent(store, event.id);
    unpublishEvent(store, event.id);

    const events = listEventSummaries(store);

    assert.equal(events.length, 0);
});

test("unpublishEvent throws NOT_FOUND when the event does not exist", () => {
    const store = createStore();
    assert.throws(
        () => unpublishEvent(store, "missing-event"),
        { code: "NOT_FOUND" }
    );
});

test("book creates a booking and reduces available tickets", () => {
    const store = createStore();

    const event = createEvent(store, {
        title: "Tech Conference",
        city: "Lagos",
        venue: "Main Hall",
        date: "2026-12-10"
    });

    const tier = addTier(event, "Regular", 5000, 3);
    publishEvent(store, event.id);

    const booking = book(store, event, tier, "Ada", 2);

    assert.equal(booking.quantity, 2);
    assert.equal(booking.status, "PENDING");
    assert.equal(booking.totalPrice, 10000);
    assert.equal(tier.available, 1);
});

test("book throws SOLD_OUT when tickets are insufficient", () => {
    const store = createStore();

    const event = createEvent(store, {
        title: "Tech Conference",
        city: "Lagos",
        venue: "Main Hall",
        date: "2026-12-10"
    });

    const tier = addTier(event, "Regular", 5000, 1);
    publishEvent(store, event.id);

    assert.throws(
        () => book(store, event, tier, "Ada", 2),
        { code: "SOLD_OUT" }
    );

    assert.equal(tier.available, 1);
});

test("book rejects invalid quantities", () => {
    const store = createStore();

    const event = createEvent(store, {
        title: "Tech Conference",
        city: "Lagos",
        venue: "Main Hall",
        date: "2026-12-10"
    });

    const tier = addTier(event, "Regular", 5000, 20);

    for (const quantity of [0, -1, 1.5, 11]) {
        assert.throws(
            () => book(store, event, tier, "Ada", quantity),
            { code: "INVALID_QUANTITY" }
        );
    }

    assert.equal(tier.available, 20);
});

test("findBookingByReference finds a booking by its reference", () => {
    const store = createStore();

    const event = createEvent(store, {
        title: "Tech Conference",
        city: "Lagos",
        venue: "Main Hall",
        date: "2026-12-10"
    });

    const tier = addTier(event, "Regular", 5000, 3);
    publishEvent(store, event.id);
    const booking = book(store, event, tier, "Ada", 2);

    const result = findBookingByReference(store, booking.reference);

    assert.equal(result, booking);
});

test("cancelBooking cancels a booking and restores available tickets", () => {
    const store = createStore();

    const event = createEvent(store, {
        title: "Tech Conference",
        city: "Lagos",
        venue: "Main Hall",
        date: "2026-12-10"
    });

    const tier = addTier(event, "Regular", 5000, 3);
    publishEvent(store, event.id);
    const booking = book(store, event, tier, "Ada", 2);
    
    cancelBooking(store, booking);

    assert.equal(booking.status, "CANCELLED");
    assert.equal(tier.available, 3);
});

test("cancelBooking throws an error when booking is already cancelled", () => {
    const store = createStore();

    const event = createEvent(store, {
        title: "Tech Conference",
        city: "Lagos",
        venue: "Main Hall",
        date: "2026-12-10"
    });

    const tier = addTier(event, "Regular", 5000, 3);
    publishEvent(store, event.id);
    const booking = book(store, event, tier, "Ada", 2);

    cancelBooking(store, booking);

    assert.throws(
        () => cancelBooking(store, booking),
        { code: "ALREADY_CANCELLED" }
    );
});

test("book rejects an unpublished event", () => {
    const store = createStore();

    const event = createEvent(store, {
        title: "Tech Conference",
        city: "Lagos",
        venue: "Main Hall",
        date: "2026-12-10"
    });

    const tier = addTier(event, "Regular", 5000, 3);

    assert.throws(
        () => book(store, event, tier, "Ada", 1),
        { code: "INVALID_STATE" }
    );

    assert.equal(tier.available, 3);
});

test("book rejects an invalid ticket price", () => {
    const store = createStore();

    const event = createEvent(store, {
        title: "Tech Conference",
        city: "Lagos",
        venue: "Main Hall",
        date: "2026-12-10"
    });

    const tier = addTier(event, "Regular", 5000, 3);
    publishEvent(store, event.id);

    tier.price = 5000.5;

    assert.throws(
        () => book(store, event, tier, "Ada", 1),
        { code: "VALIDATION" }
    );

    assert.equal(tier.available, 3);
});