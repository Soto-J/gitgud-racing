import type { NextRequest } from "next/server";
import * as helper from "@/modules/iracing/server/helper";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", {
      status: 401,
    });
  }
  console.log("Cron job started at:", new Date().toISOString());

  const authCode = await helper.getOrRefreshAuthCode();
  const cached = await helper.cacheSeries({ authCode });

  if (!cached?.success) {
    console.error("Cron job error:", cached?.error);
    return Response.json({ success: false }, { status: 500 });
  }

  console.log("Cron job completed successfully");
  return Response.json({ success: true });
}
