import {
    createStore,
    createEvent,
    addTier, 
    book,
    cancelBooking,
}  from "../src/domain/inventory.js";

import {
    createWaitlistQueue
}  from "../src/domain/waitlistQueue.js";

// 1. Create our store
const store = createStore();

//2. Create an event 
const event = createEvent(store, {
    title: "Lagos Tech Annual Conference",
    city: "Lagos",
    venue: "Eko Hotel",
    date: "2026-12-10"
});

//3. Add a ticket tier 
const tier = addTier(event, "VIP", 1500000, 10);

//4. Book 3 tickets
const booking = book(store, event, tier, "Ada", 3);

//5. Display our results 
console.log("Booking:", booking);
console.log("Available tickets:", tier.available);

//6. Try to book more tickets than are available
try {
    const booking2 = book(store, event, tier, "Bayo", 8);
} catch (error) {
    console.log("Booking error:", error.code);
}

console.log("Available tickets after failed booking:", tier.available);

//7. Cancel Ada's booking 
cancelBooking(store, booking);
const queue = store.waitlists.get(`${event.id}:${tier.id}`);
if (queue && queue.peek()) {
    console.log("Next customer on the waitlist:", queue.peek().customerName)
} else {
    console.log("No customers waiting.");
}    

console.log("Booking status after cancellation:", booking.status)
console.log("Available tickets after cancellation:", tier.available)

//8. Try to cancel Adas's booking again 
try {
    cancelBooking(store, booking);
} catch (error) {
    console.log("second cancellation error:", error.code);
}

console.log("Available tickets after second cancellation:", tier.available);

// 9. Test the waitlist queue 
const testQueue = createWaitlistQueue();

// Add three customers 
testQueue.enqueue("Ada");
testQueue.enqueue("Bayo");
testQueue.enqueue("Chika");

// Check the queue 
console.log("First customer:", testQueue.peek());
console.log("Number waiting:", testQueue.size());

//Serve the first customer
console.log("Customer served:", testQueue.dequeue());

//Check the queue again 
console.log("Next customer:", testQueue.peek());
console.log("Number waiting now:", testQueue.size());