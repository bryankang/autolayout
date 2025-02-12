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
    return (
      <div className={cn("bg-gray-2 flex h-[160px] flex-col rounded-sm")} />
    );
  }

  const selectedShape = selectedShapes[0];

  console.log("selectedShape", selectedShape);

  const getPaddings = () => {};

  return (
    <div className={cn("bg-gray-2 flex h-[160px] flex-col rounded-sm")}>
      <div
        className={cn(
          "flex h-6 items-center justify-center overflow-hidden",
          selectedShape.props.pt && "h-6",
        )}
      >
        <PaddingIndicator active={!!selectedShape.props.pt} />
      </div>
      <div className="flex flex-1">
        <div
          className={cn(
            "flex h-full w-6 items-center justify-center overflow-hidden",
            selectedShape.props.pl && "w-6",
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
              "bg-blue-4 inline-flex h-fit w-fit rounded-sm p-3",
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
            "flex h-full w-6 items-center justify-center overflow-hidden",
            selectedShape.props.pr && "w-6",
          )}
        >
          <PaddingIndicator active={!!selectedShape.props.pr} />
        </div>
      </div>
      <div
        className={cn(
          "flex h-6 items-center justify-center overflow-hidden",
          selectedShape.props.pb && "h-6",
        )}
      >
        <PaddingIndicator active={!!selectedShape.props.pb} />
      </div>
    </div>
  );
};
