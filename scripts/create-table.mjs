import { DynamoDBClient, CreateTableCommand } from "@aws-sdk/client-dynamodb";
import dotenv from "dotenv";

// Load environment variables from .env.local
dotenv.config({ path: ".env.local" });

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
    sessionToken: process.env.AWS_SESSION_TOKEN || "",
  },
});

const params = {
  TableName: "SavedTrips",
  KeySchema: [
    { AttributeName: "UserId", KeyType: "HASH" },  // Partition key
    { AttributeName: "TripId", KeyType: "RANGE" }  // Sort key
  ],
  AttributeDefinitions: [
    { AttributeName: "UserId", AttributeType: "S" },
    { AttributeName: "TripId", AttributeType: "S" }
  ],
  BillingMode: "PAY_PER_REQUEST", // Free tier friendly, no provisioned capacity
};

async function createTable() {
  try {
    console.log("Attempting to create DynamoDB table 'SavedTrips'...");
    const data = await client.send(new CreateTableCommand(params));
    console.log("Table created successfully!", data.TableDescription?.TableName);
  } catch (err) {
    if (err.name === "ResourceInUseException") {
      console.log("Table 'SavedTrips' already exists. You are good to go!");
    } else {
      console.error("Error creating table:", err);
    }
  }
}

createTable();
