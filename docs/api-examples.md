Eventry REST API Examples

These examples use the local Eventry server running on port 3000.

Start the server from the project root:

node src/server.js

Keep the server running while testing the requests. Open another terminal for the curl commands.

1. Health check

Check whether the server is running.

curl http://localhost:3000/health

Expected response:

{
  "status": "ok"
}

2. Create an event

POST /api/events

curl -X POST http://localhost:3000/api/events -H "Content-Type: application/json" -H "x-user-id: user-123" -d "{\"title\":\"Tech Conference 2026\",\"city\":\"Lagos\",\"venue\":\"Landmark Centre\",\"date\":\"2026-12-15\"}"

3. Add a ticket tier

POST /api/events/:id/tiers

Replace EVENT_ID with the ID returned when you created the event.

curl -X POST http://localhost:3000/api/events/EVENT_ID/tiers -H "Content-Type: application/json" -H "x-user-id: user-123" -d "{\"name\":\"Regular\",\"priceCents\":1500000,\"capacity\":100}"

The price is stored in cents. 1500000 cents represents ₦15,000.

4. Publish an event

POST /api/events/:id/publish

curl -X POST http://localhost:3000/api/events/EVENT_ID/publish -H "x-user-id: user-123"

An event needs at least one ticket tier before it can be published.

5. List and search events

GET /api/events

Get all published events:

curl http://localhost:3000/api/events

Search by title:

curl "http://localhost:3000/api/events?q=Tech"

Filter by city:

curl "http://localhost:3000/api/events?city=Lagos"

Filter by date:

curl "http://localhost:3000/api/events?from=2026-12-01&to=2026-12-31"

Filter by maximum ticket price:

curl "http://localhost:3000/api/events?maxPriceCents=2000000"

Show only events with available tickets:

curl "http://localhost:3000/api/events?onlyAvailable=true"

Sort events by date, price, or availability:

curl "http://localhost:3000/api/events?sort=date"

6. Get one event

GET /api/events/:id

curl http://localhost:3000/api/events/EVENT_ID

Replace EVENT_ID with the actual event ID.

7. Book tickets

POST /api/bookings

curl -X POST http://localhost:3000/api/bookings -H "Content-Type: application/json" -H "x-user-id: user-123" -d "{\"tierId\":\"TIER_ID\",\"quantity\":2}"

Replace TIER_ID with the actual ticket tier ID.

Save the booking reference returned in the response. You will need it for payment and cancellation.

8. Get a booking

GET /api/bookings/:reference

curl http://localhost:3000/api/bookings/BOOKING_REFERENCE -H "x-user-id: user-123"

Replace BOOKING_REFERENCE with the actual booking reference.

9. Pay for a booking

POST /api/bookings/:reference/pay

Use the mock payment token tok_success for a successful payment.

curl -X POST http://localhost:3000/api/bookings/BOOKING_REFERENCE/pay -H "Content-Type: application/json" -H "x-user-id: user-123" -d "{\"paymentToken\":\"tok_success\"}"

To simulate a declined payment, use tok_declined instead.

curl -X POST http://localhost:3000/api/bookings/BOOKING_REFERENCE/pay -H "Content-Type: application/json" -H "x-user-id: user-123" -d "{\"paymentToken\":\"tok_declined\"}"

A declined payment leaves the booking pending, allowing another payment attempt.

10. Cancel an unpaid booking

POST /api/bookings/:reference/cancel

curl -X POST http://localhost:3000/api/bookings/BOOKING_REFERENCE/cancel -H "x-user-id: user-123"

Only pending (unpaid) bookings can be cancelled. Cancelling a booking restores its tickets to the available inventory.

11. Unpublish an event

POST /api/events/:id/unpublish

curl -X POST http://localhost:3000/api/events/EVENT_ID/unpublish -H "x-user-id: user-123"

12. Error response format

API errors use a consistent JSON structure:

{
  "error": {
    "code": "NOT_FOUND",
    "message": "Event not found"
  }
}

Common HTTP status codes:

Status	Meaning
400	Validation error or invalid JSON
401	User is not authenticated
402	Payment declined
403	User is not authorized
404	Resource not found
409	Invalid state or sold-out tickets
500	Internal server error

Notes

* Replace EVENT_ID, TIER_ID, and BOOKING_REFERENCE with actual values returned by the API.
* Use the same x-user-id when accessing or managing resources owned by that user.
* The payment gateway is a mock service. It does not process real payments.
* These examples assume the server is running locally on port 3000.