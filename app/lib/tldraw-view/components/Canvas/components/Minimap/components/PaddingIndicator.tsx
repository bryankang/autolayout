import { FC } from "react";
import { cn } from "~/styles/utils";

export type PaddingIndicatorProps = {
  active?: boolean;
};

export const PaddingIndicator: FC<PaddingIndicatorProps> = ({ active }) => {
  return (
    <div
      className={cn(
        "h-1 w-1 rounded-full bg-gray-200",
        active && "bg-blue-300",
      )}
    />
  );
};
