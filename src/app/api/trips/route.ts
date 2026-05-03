import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { db } from "@/lib/aws";
import { PutCommand, QueryCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import crypto from "crypto";

const TABLE_NAME = "SavedTrips";

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session || !session.user || !(session.user as any).id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const tripData = await req.json();

    const tripId = crypto.randomUUID();
    const item = {
      UserId: userId,
      TripId: tripId,
      CreatedAt: new Date().toISOString(),
      TripData: tripData,
    };

    await db.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: item,
      })
    );

    return NextResponse.json({ success: true, tripId });
  } catch (error) {
    console.error("Error saving trip to DynamoDB:", error);
    return NextResponse.json(
      { error: "Failed to save trip. Ensure DynamoDB table 'SavedTrips' exists." },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession();
    if (!session || !session.user || !(session.user as any).id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    const response = await db.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: "UserId = :userId",
        ExpressionAttributeValues: {
          ":userId": userId,
        },
      })
    );

    // Sort by newest first
    const trips = response.Items?.sort((a, b) => 
      new Date(b.CreatedAt).getTime() - new Date(a.CreatedAt).getTime()
    ) || [];

    return NextResponse.json(trips);
  } catch (error) {
    console.error("Error fetching trips:", error);
    return NextResponse.json({ error: "Failed to fetch trips." }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession();
    if (!session || !session.user || !(session.user as any).id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const url = new URL(req.url);
    const tripId = url.searchParams.get("tripId");

    if (!tripId) {
      return NextResponse.json({ error: "TripId is required" }, { status: 400 });
    }

    await db.send(
      new DeleteCommand({
        TableName: TABLE_NAME,
        Key: {
          UserId: userId,
          TripId: tripId,
        },
      })
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting trip:", error);
    return NextResponse.json({ error: "Failed to delete trip." }, { status: 500 });
  }
}
