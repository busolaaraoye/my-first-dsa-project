Build 2: Event Search, Sorting, and Testing

S02: Create an Event

* An event must have a title, city, venue, and valid date.
* A newly created event must receive a unique ID.
* A newly created event must have a draft status and must not be publicly visible.
* Creating an event without a title, city, or venue must return a VALIDATION error.
* Creating an event with an invalid date must return a VALIDATION error.

S03: Add Ticket Tiers

* A ticket tier must have a name, price in whole cents, and capacity of at least one.
* Adding a tier to a non-existent event must return a NOT_FOUND error.

S04: Publish and Unpublish Events

* An event can only be published if it has at least one ticket tier.
* Publishing an event must change its status to PUBLISHED.
* An event that is not published must not appear in the public event list.
* Unpublishing an event must prevent it from appearing in the public event list.

S05: Search, Filter, and Sort Events

* Search must be case-insensitive.
* Events can be filtered by city, date range, and maximum ticket price.
* The end date of a date-only range must include the entire day.
* Events can be sorted by date, price, and ticket availability.
* Equal values must preserve their original order when sorting.
* Searching, filtering, and sorting must not change the original event list.
* Invalid dates, prices, or sort options must return validation errors.

S06: Booking Tickets

* Booking two tickets from an event with three available seats must leave one seat available.
* Booking more tickets than are available must return a SOLD_OUT error.
* The booking quantity must be a whole number from 1 to 10.