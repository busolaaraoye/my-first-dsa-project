export {};
const totalBookings = 100000;
const bookingsArray = [];
const bookingsMap = new Map();

for (let i = 0; i < totalBookings; i++) {
    const booking = {
        reference: `REF-${i}`,
        customerName: `Customer ${i}`,
    };
    bookingsArray.push(booking);
    bookingsMap.set(booking.reference, booking);
}

const targetReference = `REF-${totalBookings - 1}`;

console.time("Array.find");
bookingsArray.find((booking) => booking.reference === targetReference);
console.timeEnd("Array.find");

console.time("Map.get");
bookingsMap.get(targetReference);
console.timeEnd("Map.get");