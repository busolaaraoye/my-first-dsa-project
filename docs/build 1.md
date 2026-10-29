Build 1: Domain Core

Event and Ticket Inventory

* The system must allow events to be created and managed.
* Each event must have ticket tiers with prices and available capacity.
* Ticket prices must be stored in whole cents.

Booking Tickets

* A booking must not exceed the available ticket capacity.
* If there are not enough seats, the booking must fail with a SOLD_OUT error.
* A successful booking must reduce the available ticket capacity.

Booking References

* Each booking must have a unique reference.
* A booking must be findable using its reference.

Cancellation

* Cancelling a booking must release the booked seats.
* A booking must not be cancelled more than once.

Waitlist

* Users must be able to join an event’s waitlist.
* Waitlist entries must follow the first-in, first-out (FIFO) order.

Demonstration and Benchmark

* The demo must demonstrate successful booking and a rejected booking when capacity is insufficient.
* The demo must demonstrate waitlist activity and cancellation.
* The benchmark must compare array-based lookup with Map-based lookup.