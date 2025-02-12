import { FC } from "react";
import { cn } from "~/styles/utils";

export type PaddingIndicatorProps = {
  active?: boolean;
};

export const PaddingIndicator: FC<PaddingIndicatorProps> = ({ active }) => {
  return (
    <div
      className={cn("bg-gray-5 h-1 w-1 rounded-full", active && "bg-blue-7")}
    />
  );
};
