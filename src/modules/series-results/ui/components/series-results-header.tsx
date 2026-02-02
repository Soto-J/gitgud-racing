"use client";

export default function SeriesResultsHeader() {
  return (
    <div className="text-foreground relative mb-8 rounded-2xl bg-linear-to-r from-blue-600 via-blue-700 to-blue-800 px-8 py-12 shadow-2xl">
      <div className="absolute inset-0 bg-[url('/iRacing-Brandmarks/iRacing-Icon-BW-White.svg')] bg-[length:250px] bg-center bg-no-repeat opacity-10" />

      <div className="relative z-10 text-center">
        <div className="bg-muted/20 mb-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium backdrop-blur-sm">
          <div className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
          iRacing Series Analytics
        </div>

        <h1 className="mb-3 text-4xl font-bold tracking-tight">
          Series Statistics Overview
        </h1>

        <p className="text-lg font-medium text-blue-100">
          Track performance across all racing series with real-time data
        </p>
      </div>
    </div>
  );
}
