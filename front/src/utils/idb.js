// IndexedDB helper for caching API responses and outbox (background sync)
import { openDB } from 'idb';

export const dbPromise = openDB('zagazig-housing', 1, {
    upgrade(db) {
        db.createObjectStore('responses'); // key: request URL, value: JSON data
        db.createObjectStore('outbox', { autoIncrement: true }); // pending form submissions
    },
});

export async function setResponse(url, data) {
    const db = await dbPromise;
    await db.put('responses', data, url);
}

export async function getResponse(url) {
    const db = await dbPromise;
    return db.get('responses', url);
}

export async function addToOutbox(payload) {
    const db = await dbPromise;
    await db.add('outbox', payload);
}

export async function getOutbox() {
    const db = await dbPromise;
    return db.getAll('outbox');
}

export async function clearOutbox() {
    const db = await dbPromise;
    await db.clear('outbox');
}
