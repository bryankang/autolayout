import { cva, VariantProps } from "class-variance-authority";
import { FC, ReactNode } from "react";
import { twMerge } from "tailwind-merge";
import { cn } from "~/styles/utils";
import { PaddingIndicator } from "./PaddingIndicator";

export type FlexShapesProps = {
  direction: string;
  alignX: string;
  alignY: string;
  gap: number;
};

export const FlexShapes: FC<FlexShapesProps> = ({
  direction,
  alignX,
  alignY,
  gap,
}) => {
  return (
    <div
      className={cn(
        container({ direction, alignX, alignY, hasGap: gap > 0 } as any),
      )}
    >
      <div
        className={cn(
          "bg-blue-9 rounded-xs",
          direction === "horizontal" ? "h-6 w-[10px]" : "h-[10px] w-6",
        )}
      />
      <div
        className={cn(
          "bg-blue-9 rounded-xs",
          direction === "horizontal" ? "h-8 w-[10px]" : "h-[10px] w-8",
        )}
      />
      <div
        className={cn(
          "bg-blue-9 rounded-xs",
          direction === "horizontal" ? "h-4 w-[10px]" : "h-[10px] w-4",
        )}
      />
    </div>
  );
};

const containerVariants = cva("flex flex-1", {
  variants: {
    direction: {
      horizontal: "flex-row",
      vertical: "flex-col",
    },
    alignX: {
      left: "items-start",
      center: "items-center",
      right: "items-end",
    },
    alignY: {
      top: "justify-start",
      center: "justify-center",
      bottom: "justify-end",
    },
    hasGap: {
      true: "gap-[6px]",
      false: "gap-[2px]",
    },
  },
  defaultVariants: {},
});

interface ContainerProps extends VariantProps<typeof containerVariants> {
  children: ReactNode;
}

const container = (variants: ContainerProps) =>
  twMerge(containerVariants(variants));
