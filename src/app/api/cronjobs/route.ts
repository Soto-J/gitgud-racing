// import type { NextRequest } from "next/server";
// import env from "@/env";

// import { cacheCurrentWeekResults } from "./cache-series-results";

// export async function GET(request: NextRequest) {
//   const authHeader = request.headers.get("authorization");

//   if (authHeader !== `Bearer ${env.CRON_SECRET}`) {
//     return new Response("Unauthorized", {
//       status: 401,
//     });
//   }

//   console.log(
//     "[Cronjob] Started at:",
//     new Intl.DateTimeFormat("en-US", {
//       dateStyle: "long",
//     }).format(new Date()),
//   );

//   const result = await cacheCurrentWeekResults();

//   if (!result.success) {
//     console.error(
//       `[Cronjob] error: Failed to cache weekly results. ${result.error}`,
//     );
//     return Response.json({ success: false }, { status: 500 });
//   }

//   console.log("[Cronjob] completed successfully");
//   return Response.json({ success: true });
// }
