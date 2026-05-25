"use server";

import { MongoClient } from "mongodb";

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

const uri = process.env.MONGODB_URI;

let clientPromise: Promise<MongoClient> | undefined;

export async function getDatabase() {
  if (!uri) {
    throw new Error(
      "Missing MONGODB_URI environment variable. Add it to .env.local",
    );
  }

  if (!clientPromise) {
    if (process.env.NODE_ENV === "development") {
      // In development mode, use a global variable so that the value
      // is preserved across module reloads caused by HMR (Hot Module Replacement).
      if (!globalThis._mongoClientPromise) {
        const client = new MongoClient(uri);
        globalThis._mongoClientPromise = client.connect();
      }
      clientPromise = globalThis._mongoClientPromise;
    } else {
      // In production mode, it's best to not use a global variable.
      const client = new MongoClient(uri);
      clientPromise = client.connect();
    }
  }

  const connectedClient = await clientPromise;
  return connectedClient.db(process.env.MONGODB_DB || "grace_cottage");
}
