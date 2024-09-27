"use client";

import { useEffect } from "react";
import { openDB } from "idb";

export async function initIndexedDB() {
  const db = await openDB('MyDatabase', 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('images')) {
        db.createObjectStore('images', { keyPath: 'id', autoIncrement: true });
      }
    },
  });
  return db;
}

export default function IdbProvider() {
  useEffect(() => {
    initIndexedDB()
      .then(() => console.log("IndexedDB initialized"))
      .catch((error) => console.error("IndexedDB initialization failed", error));
  }, []);

  return null;
}
