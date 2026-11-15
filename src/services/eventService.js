import {
    createEvent,
    addTier,
    publishEvent,
    unpublishEvent,
} from "../domain/inventory.js";

import {
    searchEvents,
    filterEventsByCity,
    filterEventsByDateRange,
    filterEventsByPrice,
    sortEvents,
} from "../domain/eventry.js";

import { DomainError } from "../domain/errors.js";


export function createEventService(repository) {
    return {

        async createEvent(details, userId) {
            if (!userId) {
                throw new DomainError(
                    "User ID is required", 
                    "UNAUTHENTICATED"
                );
            }
            const event = createEvent(repository.store, {
                ...details,
                date: details.date ?? details.startsAt?.slice(0, 10),
            });

            event.organizerId = userId;
            event.startsAt = details.startsAt ?? details.date;
            
            return repository.saveEvent(event);
        },

       async addTier(eventId, details, userId) {
    if (!userId) {
        throw new DomainError(
            "User ID is required",
            "UNAUTHENTICATED"
        );
    }

    const event = await repository.getEventById(eventId);

    if (!event) {
        throw new DomainError(
            "Event not found",
            "NOT_FOUND"
        );
    }

    if (event.organizerId !== userId) {
        throw new DomainError(
            "You cannot edit this event",
            "FORBIDDEN"
        );
    }

    const tier = addTier(
        event,
        details.name,
        details.priceCents ?? details.price,
        details.capacity
    );

    await repository.saveTier(eventId, tier);

    return tier;
},

async publishEvent(eventId, userId) {
    if (!userId) {
        throw new DomainError(
            "User ID is required",
            "UNAUTHENTICATED"
        );
    }

    const event = await repository.getEventById(eventId);

    if (!event) {
        throw new DomainError(
            "Event not found",
            "NOT_FOUND"
        );
    }

    if (event.organizerId !== userId) {
        throw new DomainError(
            "You cannot publish this event",
            "FORBIDDEN"
        );
    }

    const result = publishEvent(repository.store, eventId);

    return repository.saveEvent(result);
},

async unpublishEvent(eventId, userId) {
    if (!userId) {
        throw new DomainError(
            "User ID is required",
            "UNAUTHENTICATED"
        );
    }

    const event = await repository.getEventById(eventId);

    if (!event) {
        throw new DomainError(
            "Event not found",
            "NOT_FOUND"
        );
    }

    if (event.organizerId !== userId) {
        throw new DomainError(
            "You cannot unpublish this event",
            "FORBIDDEN"
        );
    }

    const result = unpublishEvent(repository.store, eventId);

    return repository.saveEvent(result);
},

        async getEvents(filters = {}) {
            let events = await repository.listEvents();

            events = events.filter(
                event => event.status === "PUBLISHED"
            );

            if (filters.q) {
                events = searchEvents(events, filters.q);
            }

            if (filters.city) {
                events = filterEventsByCity(events, filters.city);
            }

            if (filters.from && filters.to) {
                events = filterEventsByDateRange(
                    events,
                    filters.from,
                    filters.to
                );
            } else if (filters.from) {
                events = events.filter(event => event.date >= filters.from);
            } else if (filters.to) {
                events = events.filter(event => event.date <= filters.to);
            }

            if (filters.maxPriceCents !== undefined) {
                events = filterEventsByPrice(
                    events,
                    0,
                    Number(filters.maxPriceCents)
                );
            }

            if (filters.sort) {
                events = sortEvents(events, filters.sort);
            }

            if (filters.onlyAvailable === "true") {
                events = events.filter(event =>
                    Array.from(event.tiers.values())
                        .some(tier => tier.available > 0)
                );
            }

            return events;
        },
    };
}