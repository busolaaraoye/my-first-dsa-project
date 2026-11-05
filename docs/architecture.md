Eventry Architecture Documentation

1. Layered Architecture

The system is organised into four layers. Each layer has a specific responsibility.

flowchart TD
    A[Routes Layer] --> B[Services Layer]
    B --> C[Rules / Domain Layer]
    B --> D[Repositories / Data Layer]

* Routes Layer: Receives HTTP requests and sends responses. It must not contain business rules or access data directly.
* Services Layer: Coordinates application operations by calling the rules and repositories layers.
* Rules / Domain Layer: Contains business rules, validations and booking logic. It must not depend on routes or services.
* Repositories / Data Layer: Handles storing and retrieving information. It must not control business decisions.


2. Data Model

This diagram shows the main information managed by Eventry and how the records relate.

erDiagram
    USER ||--o{ BOOKING : makes
    EVENT ||--|{ TICKET_TIER : has
    EVENT ||--o{ BOOKING : receives
    TICKET_TIER ||--o{ BOOKING : belongs_to
    USER {
        string id
        string name
        string email
    }
    EVENT {
        string id
        string title
        string city
        string venue
        string date
    }
    TICKET_TIER {
        string id
        string eventId
        string name
        number price
        number capacity
    }
    BOOKING {
        string id
        string userId
        string eventId
        string ticketTierId
        number quantity
        string status
    }

3. Booking Lifecycle State Machine

This diagram shows the allowed changes in a booking’s status.

stateDiagram-v2
    [*] --> pending
    pending --> paid
    pending --> cancelled
    paid --> checked_in
    paid --> refunded
    paid --> cancelled
    cancelled --> [*]
    refunded --> [*]
    checked_in --> [*]

A booking can move only through the transitions shown above. Cancelled, refunded and checked-in bookings are final states and cannot transition to another state.