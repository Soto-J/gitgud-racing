"use client";

import { useRouter } from "next/navigation";
import { SearchSeriesResults } from "@/modules/series-results/server/procedures/search-series-results/types";

interface ImageTickProps {
  x?: number;
  y?: number;
  payload?: {
    value: string;
    coordinate: number;
    index: number;
    offset: number;
  };
  data?: SearchSeriesResults;
}

export default function ImageTick({ x, y, payload, data }: ImageTickProps) {
  const router = useRouter();

  if (!payload?.value) {
    return null;
  }

  const handleImageClick = () => {
    return;
    //TODO
    // const seriesData = data?.series.find(
    //   (series) => series.name === payload.value,
    // );

    // if (!seriesData?.seriesId) {
    //   return;
    // }

    // router.push(`/home/${seriesData.seriesId}`);
  };

  return (
    <g transform={`translate(${x},${y})`}>
      <image
        x={-50}
        y={-24}
        width={42}
        height={42}
        href={`/Official_Series_Logos/logos/${payload.value.trim()}.png`}
        className="cursor-pointer transition-all duration-200 hover:scale-110"
        role="button"
        tabIndex={0}
        aria-label={`Open series ${payload.value}`}
        onClick={handleImageClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleImageClick();
          }
        }}
      />
    </g>
  );
}
