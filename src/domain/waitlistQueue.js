export function createWaitlistQueue() {
    let first = null;
    let last = null;
    let count = 0;

    return {
        enqueue(customer) {
            const node = {
                customer,
                next: null,
            };

            if (last === null) {
                first = node;
                last = node;
            }   else {
                last.next = node;
                last = node;
            }

            count++;
        },

        dequeue() {
            if (first === null) {
                return null;
            }

            const customer = first.customer;
            first = first.next;

            if (first === null) {
                last = null;
            }

            count--;
            return customer;
        },

        peek() {
            return first === null ? null : first.customer;
        },

        size() {
            return count;
        },
    };
}