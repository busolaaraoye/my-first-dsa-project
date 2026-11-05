AI Usage Log — Build One

1. Purpose of AI Assistance

AI assistance was used during Build One to explain JavaScript concepts, help identify coding errors, and support the development and understanding of the event ticketing system.

2. Areas Where AI Was Used

* Error handling: Understanding the DomainError class and error codes such as SOLD_OUT.
* ID generation: Understanding the use of Node.js’s built-in crypto module to generate unique IDs and booking references.
* Waitlist queue: Understanding FIFO behaviour and the enqueue, dequeue, peek, and size methods.
* Ticket inventory: Reviewing booking, cancellation, and ticket availability logic.
* Booking lookup: Implementing and understanding booking-reference lookup with a JavaScript Map.
* Benchmarking: Comparing Array.find() and Map.get() to understand their performance and time complexity.
* Automated testing: Creating tests for waitlist order and empty-queue behaviour.
* Debugging: Identifying a filename mismatch that prevented the benchmark script from running.

3. Learning Outcomes

Through the AI-assisted learning process, I practised JavaScript functions, objects, classes, Maps, queues, error handling, automated tests, and Big O notation.

I also learned the importance of checking return values before accessing object properties and verifying that failed bookings do not change ticket availability.

4. Review and Responsibility

AI suggestions were reviewed during development, and explanations were used to improve my understanding of the code. I remain responsible for reviewing the implementation, verifying its behaviour, and ensuring that the final project meets the requirements.

5. Remaining Verification

Before submitting Build One, I will verify the booking and cancellation logic, waitlist behaviour, booking-reference lookup, demo output, automated tests, and GitHub submission requirements.

Build 2 — Event Search, Filtering and Sorting

AI tool used: ChatGPT

Purpose: To understand and implement event searching, filtering, and sorting.

Assistance received:

* Implementing event search by title, city, and venue.
* Filtering events by city, date range, and ticket price.
* Sorting events by date, price, and ticket availability.
* Debugging errors and correcting the functions.
* Writing and running tests using Node.js’s built-in test runner.

Testing: All 9 tests passed after debugging.

My learning: I am still learning how the functions work and need to practise writing them independently.

Build 3 — Architecture, State Machine and Server

AI tool used: ChatGPT

Purpose: To understand and implement the layered architecture, booking lifecycle state machine, HTTP server and static file serving.

Assistance received

* Creating the layered architecture, data model and booking lifecycle diagrams using Mermaid.
* Implementing and understanding the booking state machine and its allowed transitions.
* Creating the HTTP router with support for route parameters.
* Setting up the server using Node.js’s built-in node:http module.
* Implementing JSON request parsing and error handling.
* Serving static files from the public folder.
* Protecting the public folder against access to files outside it.
* Writing automated tests for HTTP requests, JSON errors and static file serving.
* Debugging errors and correcting code without replacing working parts of the project.

Problems identified and corrections

* Corrected a router structure issue that caused an illegal return statement.
* Corrected the readfile import to readFile, because JavaScript is case-sensitive.
* Corrected the serveStaticfile function call to serveStaticFile to match the function name.
* Corrected the server setup so requests pass through handleRequest before reaching the router.
* Added general error handling to prevent stack traces from being sent to clients.
* Updated the architecture diagram to identify the repositories/data layer clearly.

Testing and verification

Automated tests were run using Node.js’s built-in test runner.

Latest result: 50 tests passed, 0 failed.

Additional checks included:

* Starting the server using npm start.
* Confirming that GET /health returns {"status":"ok"}.
* Confirming that the homepage is served from the public folder.
* Confirming that invalid JSON returns HTTP 400.
* Confirming that requests attempting to access files outside the public folder are blocked.
* Testing valid and invalid booking state transitions.

Learning outcomes

I practised layered architecture, Mermaid diagrams, state machines, HTTP requests and responses, asynchronous JavaScript, error handling, static file serving and automated testing.

I also learned how to identify and correct errors while preserving existing working code.

Review and responsibility

AI suggestions were reviewed, tested and corrected during development. I remain responsible for understanding the implementation and ensuring that the final project meets the course requirements.