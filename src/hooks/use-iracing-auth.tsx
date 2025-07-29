import { authenticateIRacing } from "@/lib/iracing-auth";
import React, { useState } from "react";

interface useIracingAuthProps {
  credentials: {
    email: string;
    password: string;
  };
}
export const useIracingAuth = ({ credentials }: useIracingAuthProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authCookie, setAuthCookie] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>("");

  const login = async () => {
    try {
      const result = await authenticateIRacing(credentials);

      if (!result || !result.success || !result.authCookie) {
        throw new Error("Something went wrong logging in");
      }

      setIsAuthenticated(true);
      setAuthCookie(result.authCookie);
      return result;
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      }
    }
  };
//   const api = {
//     getDriverStats: (customerId: number) =>
//       iracingAPI.getDriverStats(customerId, {
//         authCookie: authCookie || undefined,
//       }),

//     getCareerStats: (customerId: number) =>
//       iracingAPI.getCareerStats(customerId, {
//         authCookie: authCookie || undefined,
//       }),

//     getCurrentSeason: () =>
//       iracingAPI.getCurrentSeason({ authCookie: authCookie || undefined }),

//     getDriverInfo: (customerId: number) =>
//       iracingAPI.getDriverInfo(customerId, {
//         authCookie: authCookie || undefined,
//       }),

//     getSeriesData: () =>
//       iracingAPI.getSeriesData({ authCookie: authCookie || undefined }),
//   };
  return {
    login,
    isAuthenticated,
    authCookie,
    loading,
    error,
  };
};
