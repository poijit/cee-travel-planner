import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const options = {};

if (!uri && process.env.NODE_ENV === "production") {
  // We don't throw here to avoid breaking the build process
  console.warn("MONGODB_URI is missing. Database features will fail at runtime.");
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

// In development, use a global variable so the MongoClient is not
// recreated on every hot-reload (Next.js re-executes modules).
if (process.env.NODE_ENV === "development") {
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;

export async function getDatabase() {
  if (!uri) {
    throw new Error("MONGODB_URI is missing from environment variables");
  }
  const client = await clientPromise;
  return client.db("travel-planner");
}
