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
    const seriesData = data?.series.find(
      (series) => series.name === payload.value,
    );

    if (!seriesData?.seriesId) {
      return;
    }

    router.push(`/home/${seriesData.seriesId}`);
  };

  return (
    <g transform={`translate(${x},${y})`}>
      <image
        x={-50}
        y={-24}
        href={`/Official_Series_Logos/logos/${payload.value.trim()}.png`}
        className="h-8 w-8 cursor-pointer rounded-lg transition-all duration-200 hover:scale-110 hover:shadow-lg md:h-12 md:w-12"
        onClick={handleImageClick}
      />
    </g>
  );
}
