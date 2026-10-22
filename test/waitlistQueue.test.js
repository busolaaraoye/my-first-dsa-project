import test from "node:test";
import assert from "node:assert/strict";
import { createWaitlistQueue } from "../src/domain/waitlistQueue.js";

test("customers are served in the order they join", () => {
    const queue = createWaitlistQueue();
    queue.enqueue("Ada");
    queue.enqueue("Bayo");
    queue.enqueue("Chika");

    assert.equal(queue.dequeue(), "Ada");
    assert.equal(queue.dequeue(), "Bayo");
    assert.equal(queue.dequeue(), "Chika");
});

test("an empty queue returns null", () => {
    const queue = createWaitlistQueue();
    
    assert.equal(queue.dequeue(), null);
});
