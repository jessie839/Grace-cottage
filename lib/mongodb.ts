"use server";

import { MongoClient } from "mongodb";

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

const uri = process.env.MONGODB_URI;

let client: MongoClient | undefined;
let clientPromise: Promise<MongoClient> | undefined;

export async function getDatabase() {
  if (!uri) {
    throw new Error(
      "Missing MONGODB_URI environment variable. Add it to .env.local",
    );
  }

  if (!clientPromise) {
    client = new MongoClient(uri);
    clientPromise = client.connect();
  }

  const connectedClient = await clientPromise;
  return connectedClient.db(process.env.MONGODB_DB || "grace_cottage");
}
