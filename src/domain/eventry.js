import {DomainError} from "./errors.js";
function isValidDate(date) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return false;
    }

    const parsedDate = new Date(`${date}T00:00:00Z`);

    return !Number.isNaN(parsedDate.getTime()) &&
        parsedDate.toISOString().slice(0, 10) === date;
}

export function searchEvents(events, searchText) {
    const search = searchText.toLowerCase().trim();

    return events.filter(event =>
        event.title.toLowerCase().includes(search) ||
        event.city.toLowerCase().includes(search) ||
        event.venue.toLowerCase().includes(search)
    );
}

export function filterEventsByCity(events, city) {
    const searchCity = city.toLowerCase().trim();

    return events.filter(event =>
        event.city.toLowerCase() === searchCity
    );
}

export function filterEventsByDateRange(events, startDate, endDate) {
    if (!isValidDate(startDate) || !isValidDate(endDate)) {
        throw new DomainError("Invalid date", "VALIDATION");
    }

    return events.filter(event =>
        event.date.slice(0, 10) >= startDate &&
        event.date.slice(0, 10) <= endDate
    );
}

export function filterEventsByPrice(events, minPrice, maxPrice) {
    if (!Number.isInteger(minPrice) || !Number.isInteger(maxPrice)) {
        throw new DomainError("Invalid price", "VALIDATION");
    }

    return events.filter(event=> {
        const tiers = Array.from(event.tiers.values());
        if (tiers.length === 0) return false;
        
        if (tiers.some(tier => !Number.isInteger(tier.price))) {
            throw new DomainError("Invalid ticket price", "VALIDATION");
        }
       
        const cheapestPrice = Math.min(...tiers.map(tier => tier.price));
        return cheapestPrice >= minPrice && cheapestPrice <= maxPrice;
    });
}

export function mergeSort(items, compare) {
    if (items.length <= 1) {
        return [...items];
    }
    const middle = Math.floor(items.length / 2);
    const left = mergeSort(items.slice(0, middle), compare);
    const right = mergeSort(items.slice(middle), compare);

    return merge(left, right, compare);
}

function merge(left, right, compare) {
    const result = [];
    
    let i = 0;
    let j = 0;
    
    while (i < left.length && j < right.length) {
        if (compare(left[i], right[j]) <= 0) {
            result.push(left[i]);
            i++;
        } else {
            result.push(right[j]);
            j++;
        }
    }

    while (i < left.length) {
        result.push(left[i]);
        i++;
    }
    while (j < right.length) {
        result.push(right[j]);
        j++;
    }

    return result;
}

export function sortEventsByDate(events) {
    return mergeSort(events, (eventA, eventB) => {
       const dateComparison = eventA.date.localeCompare(eventB.date);
       if (dateComparison !== 0) {
           return dateComparison;
       }
       return eventA.title.localeCompare(eventB.title);
    });
}


export function sortEventsByPrice(events) {
    return mergeSort(events, (eventA, eventB) => {
        const priceA = Math.min(
            ...Array.from(eventA.tiers.values(), tier => tier.price)
        );

        const priceB = Math.min(
            ...Array.from(eventB.tiers.values(), tier => tier.price)
        );

        return priceA - priceB;
    });
}

export function sortEventsByAvailability(events) {
    return mergeSort(events, (eventA, eventB) => {
        const availableA = Array.from(eventA.tiers.values())
            .reduce((total, tier) => total + tier.available, 0);

        const availableB = Array.from(eventB.tiers.values())
            .reduce((total, tier) => total + tier.available, 0);

        return availableB - availableA;
    });
}

export function sortEvents(events, sortBy) {
    if (sortBy === "date") {
        return sortEventsByDate(events);
    }

    if (sortBy === "price") {
        return sortEventsByPrice(events);
    }

    if (sortBy === "availability") {
        return sortEventsByAvailability(events);
    }

    throw new DomainError("Unknown sort option", "VALIDATION");
}