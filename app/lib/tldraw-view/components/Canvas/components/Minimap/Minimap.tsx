import { cva } from "class-variance-authority";
import { FC, ReactNode } from "react";
import { useTldrawContext } from "~/lib/tldraw-view/contexts/TldrawContext";
import { cn } from "~/styles/utils";
import { PaddingIndicator } from "./components/PaddingIndicator";
import { FlexShapes } from "./components/FlexShapes";

export type MinimapProps = {};

export const Minimap: FC<MinimapProps> = () => {
  const { selectedShapes } = useTldrawContext();

  if (!selectedShapes.length || selectedShapes.length > 1) {
    return null;
  }

  const selectedShape = selectedShapes[0];

  console.log("selectedShape", selectedShape);

  const getPaddings = () => {};

  return (
    <div
      className={cn(
        "absolute top-6 right-6 flex h-[120px] w-[120px] flex-col rounded-md bg-gray-100",
        // !selectedShape.props.pt && "pt-2",
        // !selectedShape.props.pb && "pb-2",
        // !selectedShape.props.pl && "pl-2",
        // !selectedShape.props.pr && "pr-2",
      )}
    >
      <div
        className={cn(
          "flex h-5 items-center justify-center overflow-hidden",
          selectedShape.props.pt && "h-5",
        )}
      >
        <PaddingIndicator active={!!selectedShape.props.pt} />
      </div>
      <div className="flex flex-1">
        <div
          className={cn(
            "flex h-full w-5 items-center justify-center overflow-hidden",
            selectedShape.props.pl && "w-5",
          )}
        >
          <PaddingIndicator active={!!selectedShape.props.pl} />
        </div>
        <div
          className={cn(
            "flex flex-1",
            selectedShape.props.alignX === "left" && "items-start",
            selectedShape.props.alignX === "center" && "items-center",
            selectedShape.props.alignX === "right" && "items-end",
            selectedShape.props.alignY === "top" && "justify-start",
            selectedShape.props.alignY === "center" && "justify-center",
            selectedShape.props.alignY === "bottom" && "justify-end",
          )}
        >
          <div
            className={cn(
              "inline-flex h-fit w-fit rounded-sm bg-gray-200 p-2",
              selectedShape.props.fullWidth && "w-full",
              selectedShape.props.fullHeight && "h-full",
            )}
          >
            <FlexShapes
              direction={selectedShape.props.direction}
              alignX={selectedShape.props.alignX}
              alignY={selectedShape.props.alignY}
              gap={selectedShape.props.gap}
            />
          </div>
        </div>
        <div
          className={cn(
            "flex h-full w-5 items-center justify-center overflow-hidden",
            selectedShape.props.pr && "w-5",
          )}
        >
          <PaddingIndicator active={!!selectedShape.props.pr} />
        </div>
      </div>
      <div
        className={cn(
          "flex h-5 items-center justify-center overflow-hidden",
          selectedShape.props.pb && "h-5",
        )}
      >
        <PaddingIndicator active={!!selectedShape.props.pb} />
      </div>
    </div>
  );
};

const container = cva(
  "absolute top-6 right-6 h-[120px] w-[120px] rounded-md bg-gray-100",
  {
    variants: {
      pt: {
        true: "pt-2",
      },
      pb: {
        true: "pb-2",
      },
      pl: {
        true: "pl-2",
      },
      pr: {
        true: "pr-2",
      },
    },
    defaultVariants: {
      pt: false,
      pb: false,
      pl: false,
      pr: false,
    },
  },
);
