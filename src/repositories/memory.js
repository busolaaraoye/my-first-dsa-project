import { createStore } from "../domain/inventory.js";

export function createMemoryRepository() {
    const store = createStore();

    return {
        store,

        // EVENTS
        async saveEvent(event) {
            store.events.set(event.id, event);
            return event;
        },

        async getEventById(id) {
            return store.events.get(id) ?? null;
        },

        async listEvents() {
            return Array.from(store.events.values());
        },

        // TIERS
        async saveTier(eventId, tier) {
            const event = store.events.get(eventId);

            if (!event) return null;

            event.tiers.set(tier.id, tier);
            return tier;
        },

        async getTierById(tierId) {
            for (const event of store.events.values()) {
                const tier = event.tiers.get(tierId);
                if (tier) return tier;
            }

            return null;
        },

        // BOOKINGS
        async saveBooking(booking) {
            store.bookings.set(booking.id, booking);
            store.bookingsByReference.set(booking.reference, booking);
            return booking;
        },

        async getBookingByReference(reference) {
            return store.bookingsByReference.get(reference) ?? null;
        },

        async updateBooking(reference, updates) {
            const booking = store.bookingsByReference.get(reference);

            if (!booking) return null;

            Object.assign(booking, updates);
            return booking;
        },
    };
}