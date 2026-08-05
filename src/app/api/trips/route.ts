import { NextResponse } from "next/server";
import { listTrips } from "@/server/services/tripService";

export async function GET() {
  const trips = await listTrips();
  return NextResponse.json(trips);
}
