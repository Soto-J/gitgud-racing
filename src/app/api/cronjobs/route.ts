import { IRACING_URL } from "@/constants";
import { db } from "@/db";
import { iracingAuth } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", {
      status: 401,
    });
  }

  return Response.json({ success: true });
}

