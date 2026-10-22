import { randomUUID, randomBytes } from "node:crypto";

export function createId() {
    return randomUUID();
}

export function createBookingReference() {
    return `BK-${randomBytes(4).toString("hex").toUpperCase()}`;
}