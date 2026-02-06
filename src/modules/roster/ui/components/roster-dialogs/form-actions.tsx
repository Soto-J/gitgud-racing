import { Loader2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";

interface FormActionsProps {
  isPending: boolean;
  onCloseDialog: () => void;
  submitLabel?: string;
  pendingLabel?: string;
}

export default function FormActions({
  isPending,
  onCloseDialog,
  submitLabel = "Update Member",
  pendingLabel = "Updating...",
}: FormActionsProps) {
  return (
    <div className="border-border flex items-center justify-end gap-3 border-t p-6">
      <Button
        type="button"
        variant="outline"
        disabled={isPending}
        onClick={onCloseDialog}
      >
        Cancel
      </Button>

      <Button
        type="submit"
        variant="secondary"
        disabled={isPending}
        className="font-semibold bg-primary/70"
      >
        {isPending ? (
          <>
            <Loader2Icon className="h-4 w-4 animate-spin" />
            {pendingLabel}
          </>
        ) : (
          submitLabel
        )}
      </Button>
    </div>
  );
}
