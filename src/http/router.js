import { readFile } from "node:fs/promises";
import path from "node:path";

import { DomainError } from "../domain/errors.js";
import { createMemoryRepository } from "../repositories/memory.js";
import { createEventService } from "../services/eventService.js";
import { createBookingService } from "../services/bookingService.js";
import { createMockPaymentGateway } from "../lib/mockPaymentGateway.js";

const PUBLIC_DIR = path.resolve("public");

// Create the shared in-memory storage and services.
const repository = createMemoryRepository();
const paymentGateway = createMockPaymentGateway();

const eventService = createEventService(repository);
const bookingService = createBookingService(
    repository,
    paymentGateway
);


// Send JSON responses.
function sendJson(res, statusCode, data) {
    res.writeHead(statusCode, {
        "Content-Type": "application/json",
    });

    res.end(JSON.stringify(data));
}


// Convert application error codes into HTTP status codes.
function getStatusCode(error) {
    const statusCodes = {
        VALIDATION: 400,
        INVALID_QUANTITY: 400,
        INVALID_JSON: 400,
        BAD_JSON: 400,
        BAD_REQUEST: 400,

        UNAUTHENTICATED: 401,
        PAYMENT_DECLINED: 402,
        FORBIDDEN: 403,
        NOT_FOUND: 404,

        SOLD_OUT: 409,
        INVALID_STATE: 409,
        INVALID_TRANSITION: 409,
        ALREADY_CANCELLED: 409,
    };

    return statusCodes[error.code] ?? 500;
}


// Convert an event into a JSON-friendly object.
function serializeEvent(event) {
    return {
        id: event.id,
        title: event.title,
        city: event.city,
        venue: event.venue,
        date: event.date,
        startsAt: event.startsAt ?? event.date,
        status: event.status,

        tiers: Array.from(event.tiers.values()).map(tier => ({
            id: tier.id,
            name: tier.name,
            priceCents: tier.price,
            capacity: tier.capacity,
            sold: tier.sold,
            seatsLeft: tier.available,
        })),
    };
}


// Convert a booking into a JSON-friendly object.
function serializeBooking(booking) {
    return {
        ...booking,
        amountCents: booking.totalPrice,
    };
}


// Serve files from the public folder.
async function serveStaticFile(req, res) {
    if (req.method !== "GET") {
        return false;
    }

    let pathname;

    try {
        pathname = decodeURIComponent(
            new URL(req.url, "http://localhost").pathname
        );
    } catch {
        sendJson(res, 400, {
            error: {
                code: "BAD_REQUEST",
                message: "Invalid URL",
            },
        });

        return true;
    }

    if (pathname === "/") {
        pathname = "/index.html";
    }

    const filePath = path.resolve(PUBLIC_DIR, `.${pathname}`);
    const relativePath = path.relative(PUBLIC_DIR, filePath);

    if (
        relativePath.startsWith("..") ||
        path.isAbsolute(relativePath)
    ) {
        sendJson(res, 403, {
            error: {
                code: "FORBIDDEN",
                message: "Access denied",
            },
        });

        return true;
    }

    try {
        const content = await readFile(filePath);

        const contentTypes = {
            ".html": "text/html",
            ".css": "text/css",
            ".js": "text/javascript",
            ".json": "application/json",
            ".png": "image/png",
            ".jpg": "image/jpeg",
            ".svg": "image/svg+xml",
        };

        const contentType =
            contentTypes[path.extname(filePath).toLowerCase()] ||
            "application/octet-stream";

        res.writeHead(200, {
            "Content-Type": contentType,
        });

        res.end(content);
        return true;

    } catch (error) {
        if (error.code === "ENOENT" || error.code === "EISDIR") {
            return false;
        }

        throw error;
    }
}


// Match API paths and extract parameters.
export function matchPath(routePath, requestPath) {
    const routeParts = routePath.split("/").filter(Boolean);

    const requestParts = new URL(
        requestPath,
        "http://localhost"
    ).pathname.split("/").filter(Boolean);

    if (routeParts.length !== requestParts.length) {
        return null;
    }

    const params = {};

    for (let i = 0; i < routeParts.length; i++) {
        if (routeParts[i].startsWith(":")) {
            const paramName = routeParts[i].slice(1);
            params[paramName] = requestParts[i];
        } else if (routeParts[i] !== requestParts[i]) {
            return null;
        }
    }

    return params;
}


// All Build 4 API routes.
const routes = [

    // HEALTH
    {
        method: "GET",
        path: "/health",
        handler: (req, res) => {
            sendJson(res, 200, { status: "ok" });
        },
    },


    // CREATE EVENT
    {
        method: "POST",
        path: "/api/events",
        handler: async (req, res) => {
            const event = await eventService.createEvent(
                req.body,
                req.headers["x-user-id"]
            );

            sendJson(res, 201, serializeEvent(event));
        },
    },


    // ADD TICKET TIER
    {
        method: "POST",
        path: "/api/events/:id/tiers",
        handler: async (req, res) => {
            const tier = await eventService.addTier(
                req.params.id,
                req.body,
                req.headers["x-user-id"]
            );

            sendJson(res, 201, {
                id: tier.id,
                name: tier.name,
                priceCents: tier.price,
                capacity: tier.capacity,
                sold: tier.sold,
                seatsLeft: tier.available,
            });
        },
    },


    // PUBLISH EVENT
    {
        method: "POST",
        path: "/api/events/:id/publish",
        handler: async (req, res) => {
            const event = await eventService.publishEvent(
                req.params.id,
                req.headers["x-user-id"]
            );

            sendJson(res, 200, serializeEvent(event));
        },
    },


    // UNPUBLISH EVENT
    {
        method: "POST",
        path: "/api/events/:id/unpublish",
        handler: async (req, res) => {
            const event = await eventService.unpublishEvent(
                req.params.id,
                req.headers["x-user-id"]
            );

            sendJson(res, 200, serializeEvent(event));
        },
    },


    // SEARCH EVENTS
    {
        method: "GET",
        path: "/api/events",
        handler: async (req, res) => {
            const url = new URL(req.url, "http://localhost");

            const filters = {
                q: url.searchParams.get("q") ?? undefined,
                city: url.searchParams.get("city") ?? undefined,
                from: url.searchParams.get("from") ?? undefined,
                to: url.searchParams.get("to") ?? undefined,
                maxPriceCents:
                    url.searchParams.get("maxPriceCents") ?? undefined,
                onlyAvailable:
                    url.searchParams.get("onlyAvailable") ?? undefined,
                sort: url.searchParams.get("sort") ?? undefined,
            };

            const events = await eventService.getEvents(filters);

            sendJson(res, 200, events.map(serializeEvent));
        },
    },


    // GET ONE EVENT
    {
        method: "GET",
        path: "/api/events/:id",
        handler: async (req, res) => {
            const event = await repository.getEventById(
                req.params.id
            );

            if (!event) {
                throw new DomainError(
                    "Event not found",
                    "NOT_FOUND"
                );
            }

            sendJson(res, 200, serializeEvent(event));
        },
    },


    // CREATE BOOKING
    {
        method: "POST",
        path: "/api/bookings",
        handler: async (req, res) => {
            const booking = await bookingService.createBooking(
                req.body.tierId,
                req.body.quantity,
                req.headers["x-user-id"]
            );

            sendJson(res, 201, serializeBooking(booking));
        },
    },


    // GET ONE BOOKING
    {
        method: "GET",
        path: "/api/bookings/:reference",
        handler: async (req, res) => {
            const booking = await bookingService.getBooking(
                req.params.reference,
                req.headers["x-user-id"]
            );

            sendJson(res, 200, serializeBooking(booking));
        },
    },


    // PAY FOR BOOKING
    {
        method: "POST",
        path: "/api/bookings/:reference/pay",
        handler: async (req, res) => {
            const booking = await bookingService.payBooking(
                req.params.reference,
                req.body.paymentToken,
                req.headers["x-user-id"]
            );

            sendJson(res, 200, serializeBooking(booking));
        },
    },


    // CANCEL BOOKING
    {
        method: "POST",
        path: "/api/bookings/:reference/cancel",
        handler: async (req, res) => {
            const booking = await bookingService.cancelBooking(
                req.params.reference,
                req.headers["x-user-id"]
            );

            sendJson(res, 200, serializeBooking(booking));
        },
    },
];


// Main router.
export async function router(req, res) {
    try {
        for (const route of routes) {
            if (route.method !== req.method) {
                continue;
            }

            const params = matchPath(route.path, req.url);

            if (params !== null) {
                req.params = params;
                await route.handler(req, res);
                return;
            }
        }

        const served = await serveStaticFile(req, res);

        if (served) {
            return;
        }

        sendJson(res, 404, {
            error: {
                code: "NOT_FOUND",
                message: `Route ${req.method} ${req.url} not found`,
            },
        });

    } catch (error) {
        console.error(error);

        if (res.headerssent) {
          res.destroy();
          return;
        }

        sendJson(res, getStatusCode(error), {
            error: {
                code: error.code ?? "INTERNAL_ERROR",
                message:
                    getStatusCode(error) === 500
                        ? "An unexpected server error occurred"
                        : error.message,
            },
        });
    }
}