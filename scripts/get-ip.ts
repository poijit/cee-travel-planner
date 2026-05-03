import { EC2Client, DescribeInstancesCommand } from "@aws-sdk/client-ec2";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const client = new EC2Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    sessionToken: process.env.AWS_SESSION_TOKEN!,
  },
});

async function findIP() {
  try {
    const command = new DescribeInstancesCommand({
      Filters: [{ Name: "instance-state-name", Values: ["running"] }],
    });
    const response = await client.send(command);
    
    let ipFound = false;
    response.Reservations?.forEach((reservation) => {
      reservation.Instances?.forEach((instance) => {
        if (instance.PublicIpAddress) {
          console.log(`FOUND_IP: ${instance.PublicIpAddress}`);
          ipFound = true;
        }
      });
    });

    if (!ipFound) console.log("NO_IP_FOUND");
  } catch (error) {
    console.error("ERROR:", error);
  }
}

findIP();
