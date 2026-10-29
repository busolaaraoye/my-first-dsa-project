import { test } from "node:test";
import assert from "node:assert/strict";

import {
    searchEvents,
    filterEventsByCity,
    filterEventsByDateRange,
    filterEventsByPrice,
    sortEventsByDate,
    sortEventsByPrice,
    sortEventsByAvailability,
    sortEvents,
} from "../src/domain/eventry.js";

const events = [
    {
        title: "Tech Conference",
        city: "Lagos",
        venue: "Eko Hotel",
        date: "2026-11-10",
        tiers: new Map([
            ["Regular", { name: "Regurlar", price: 5000, available: 100 }],
            ["VIP", { name: "VIP", price: 15000, available: 20 }],
        ]),
    },
    {
        title: "Music Festival",
        city: "Abuja",
        venue: "City Arena",
        date: "2026-12-15",
        tiers: new Map([
            ["Regular", { name: "Regular", price: 3000, available:200 }],
        ]),
    },
    {
        title: "Food Festival",
        city: "Lagos",
        venue: "Tafawa Square",
        date: "2026-11-25",
        tiers: new Map([
            ["Regular", { name: "Regular", price: 2000, available: 50 }],
        ]),
    },
];

test("searchEvents finds an event by title", () => {
    const result = searchEvents(events, "Tech Conference");

    assert.equal(result.length, 1);
    assert.equal(result[0].title, "Tech Conference");
});

test("filterEventsByCity returns events in the selected city", () => {
    const result = filterEventsByCity(events, "Lagos");
    
    assert.equal(result.length, 2);
    assert.equal(result[0].city, "Lagos");
    assert.equal(result[1].city, "Lagos");
});

test("filterEventsByDateRange returns events within the selected dates", () => {
    const result = filterEventsByDateRange(
        events,
        "2026-11-01",
        "2026-11-30"
    );
    assert.equal(result.length, 2);

    for (const event of result) {
        assert.ok(event.date >= "2026-11-01");
        assert.ok(event.date <= "2026-11-30");
    }
});

test("filterEventsByDateRange includes an event at 5 PM on the selected end date", () => {
    const eveningEvent = {
        title: "Lagos Tech Meetup",
        date: "2026-12-05T17:00:00",
    };

    const result = filterEventsByDateRange(
        [eveningEvent],
        "2026-12-01",
        "2026-12-05"
    );

    assert.equal(result.length, 1);
    assert.equal(result[0].title, "Lagos Tech Meetup");
});

test("filterEventsByDateRange rejects an invalid date", () => {
    assert.throws(
        () => filterEventsByDateRange(events, "not-a-date", "2026-11-30"),
        error => error.code === "VALIDATION"
    );
});

test("filterEventsByPrice returns events within the selected prices range", () => {
    const result = filterEventsByPrice(events, 2000, 4000);

    assert.equal(result.length, 2);

    for (const event of result) {
        const hasMatchingPrice = Array.from(event.tiers.values()).some(
            tier => tier.price >= 2000 && tier.price <= 4000
        );
        assert.ok(hasMatchingPrice);
    }
});
test("filterEventsByPrice uses the cheapest ticket tier", () => {
    const events = [
        {
            title: "Lagos Concert",
            tiers: new Map([
                ["1", { price: 5000 }],
                ["2", { price: 10000 }]
            ])
        }
    ];

    const result = filterEventsByPrice(events, 4000, 6000);

    assert.equal(result.length, 1);
});
test("filterEventsByPrice rejects invalid ticket prices", () => {
    const events = [
        {
            tiers: new Map([
                ["1", { price: 5000.5 }]
            ])
        }
    ];

    assert.throws(
        () => filterEventsByPrice(events, 1000, 10000),
        { code: "VALIDATION" }
    );
});

test("sortEventsByDate arranges events from earliest to latest", () => {
    const result = sortEventsByDate(events);

    assert.deepEqual(
        result.map(event => event.title),
        ["Tech Conference", "Food Festival", "Music Festival"]
    );
});

test("sortEventsByPrice arranges events from cheapest to most expensive", () => {
    const result = sortEventsByPrice(events);

    assert.deepEqual(
        result.map(event => event.title),
        ["Food Festival", "Music Festival", "Tech Conference"]
    );
});

test("sortEventsByAvailability arranges events from most seats to fewest", () => {
    const result = sortEventsByAvailability(events);

    assert.deepEqual(
        result.map(event => event.title),
        ["Music Festival", "Tech Conference", "Food Festival"]
    );
});

test("searchEvents does not change the original event list", () => {
    const events = [
        { title: "Lagos Tech Meetup", city: "Lagos", venue: "Hall A" },
        { title: "Abuja Jazz Night", city: "Abuja", venue: "Hall B" },
    ];

    const originalEvents = [...events];

    searchEvents(events, "JAZZ");

    assert.deepEqual(events, originalEvents);
});

test("filterEventsByCity does not change the original event list", () => {
    const events = [
        { title: "Lagos Tech Meetup", city: "Lagos", venue: "Hall A" },
        { title: "Abuja Jazz Night", city: "Abuja", venue: "Hall B" },
    ];

    const originalEvents = [...events];

    filterEventsByCity(events, "lagos");

    assert.deepEqual(events, originalEvents);
});

test("sortEventsByDate does not change the original event list", () => {
    const events = [
        { title: "Abuja Jazz Night", date: "2026-12-20" },
        { title: "Lagos Tech Meetup", date: "2026-12-10" },
    ];

    const originalEvents = [...events];

    sortEventsByDate(events);

    assert.deepEqual(events, originalEvents);
});

test("sortEventsByDate sorts events on the same day by title", () => {
    const events = [
        { title: "Zulu Concert", date: "2026-12-05" },
        { title: "Abuja Jazz Night", date: "2026-12-05" },
        { title: "Lagos Tech Meetup", date: "2026-12-04" },
    ];

    const sortedEvents = sortEventsByDate(events);

    assert.deepEqual(
        sortedEvents.map(event => event.title),
        ["Lagos Tech Meetup", "Abuja Jazz Night", "Zulu Concert"]
    );
});

test("sortEvents rejects an unknown sort option", () => {
    assert.throws(
        () => sortEvents([], "unknown"),
        { code: "VALIDATION" }
    );
});