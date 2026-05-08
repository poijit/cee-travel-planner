import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { getDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session || !session.user || !(session.user as any).id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const tripData = await req.json();

    const db = await getDatabase();
    const tripId = crypto.randomUUID();

    await db.collection("trips").insertOne({
      UserId: userId,
      TripId: tripId,
      CreatedAt: new Date().toISOString(),
      TripData: tripData,
    });

    return NextResponse.json({ success: true, tripId });
  } catch (error) {
    console.error("Error saving trip to MongoDB:", error);
    return NextResponse.json(
      { error: "Failed to save trip." },
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
    const db = await getDatabase();

    // Find all trips for this user, sorted newest first
    const trips = await db
      .collection("trips")
      .find({ UserId: userId })
      .sort({ CreatedAt: -1 })
      .toArray();

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

    const db = await getDatabase();

    await db.collection("trips").deleteOne({
      UserId: userId,
      TripId: tripId,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting trip:", error);
    return NextResponse.json({ error: "Failed to delete trip." }, { status: 500 });
  }
}
