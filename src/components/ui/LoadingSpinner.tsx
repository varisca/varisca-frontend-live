import { Loader2 } from "lucide-react";

export const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center h-full py-10">
    <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
    <p className="text-sm text-muted-foreground">Please wait...</p>
  </div>
);