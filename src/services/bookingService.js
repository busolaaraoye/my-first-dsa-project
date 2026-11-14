import {
    book,
    cancelBooking as cancelInventoryBooking,
} from "../domain/inventory.js";

import {
    BOOKING_STATES,
    transitionBooking,
} from "../domain/bookingStateMachine.js";

import { DomainError } from "../domain/errors.js";


export function createBookingService(repository, paymentGateway) {

    async function findEventAndTier(tierId) {
        const events = await repository.listEvents();

        for (const event of events) {
            const tier = event.tiers.get(tierId);

            if (tier) {
                return { event, tier };
            }
        }

        throw new DomainError("Ticket tier not found", "NOT_FOUND");
    }


    function checkOwnership(booking, userId) {
        if (!userId) {
            throw new DomainError(
                "User ID is required",
                "UNAUTHENTICATED"
            );
        }

        if (booking.userId !== userId) {
            throw new DomainError(
                "You cannot access this booking",
                "FORBIDDEN"
            );
        }
    }


    return {

        async createBooking(tierId, quantity, userId) {

            if (!userId) {
                throw new DomainError(
                    "User ID is required",
                    "UNAUTHENTICATED"
                );
            }

            const { event, tier } = await findEventAndTier(tierId);

            const booking = book(
                repository.store,
                event,
                tier,
                userId,
                quantity
            );

            booking.userId = userId;
            booking.status = BOOKING_STATES.PENDING;

            await repository.saveBooking(booking);

            return booking;
        },


        async getBooking(reference, userId) {

            const booking =
                await repository.getBookingByReference(reference);

            if (!booking) {
                throw new DomainError(
                    "Booking not found",
                    "NOT_FOUND"
                );
            }

            checkOwnership(booking, userId);

            return booking;
        },

        async cancelBooking(reference, userId) {
    const booking =
        await repository.getBookingByReference(reference);

    if (!booking) {
        throw new DomainError(
            "Booking not found",
            "NOT_FOUND"
        );
    }
    checkOwnership(booking, userId);
    if (booking.status !== BOOKING_STATES.PENDING) {
        throw new DomainError(
            "Only unpaid bookings can be cancelled",
            "INVALID_STATE"
        );
    }
    const updatedBooking = transitionBooking(
        booking,
        BOOKING_STATES.CANCELLED
    );
    cancelInventoryBooking(
        repository.store,
        {
            ...booking,
            status: "PENDING",
        }
    );
    await repository.updateBooking(
        reference,
        updatedBooking
    );
    return updatedBooking;
},
        async payBooking(reference, paymentToken, userId) {
            const booking =
                await repository.getBookingByReference(reference);

            if (!booking) {
                throw new DomainError("Booking not found", "NOT_FOUND");
            }

            checkOwnership(booking, userId);

            if (booking.status !== BOOKING_STATES.PENDING) {
                throw new DomainError(
                    "Only pending bookings can be paid",
                    "INVALID_TRANSITION"
                );
            }

            const payment = await paymentGateway.charge(paymentToken);

            if (!payment.success) {
                throw new DomainError(
                    payment.message,
                    "PAYMENT_DECLINED"
                );
            }

            const updatedBooking = transitionBooking(
                booking,
                BOOKING_STATES.PAID
            );

            updatedBooking.paymentReference = payment.reference;

            await repository.updateBooking(reference, updatedBooking);

            return updatedBooking;
        },
    };
}