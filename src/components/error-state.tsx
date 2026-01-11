import { AlertCircleIcon } from "lucide-react";

interface ErrorStateProps {
  title: string;
  description: string;
}

export default function ErrorState({ title, description }: ErrorStateProps) {
  return (
    <div className="flex min-h-svh flex-1 items-center justify-center px-8 py-4">
      <div className="bg-background flex flex-col items-center justify-center gap-y-6 rounded-lg p-10 text-red-500 shadow-sm">
        <AlertCircleIcon className="size-8" />

        <div className="flex flex-col gap-y-2 text-center">
          <h6 className="text-lg font-medium capitalize">{title}</h6>
          <p className="text-sm">{description}</p>
        </div>
      </div>
    </div>
  );
}
