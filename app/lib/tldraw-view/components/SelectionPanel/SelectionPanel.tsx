import { ArrowDown, ArrowRight } from "@phosphor-icons/react";
import { PaddingIcon } from "@radix-ui/react-icons";
import { ReactNode, useMemo } from "react";
import { IconButton, SegmentedControl } from "~/lib/radix-themes";
import { useTldrawContext } from "../../contexts/TldrawContext";
import { BoxShape } from "../../shapes/box";
import { Minimap } from "../Canvas/components/Minimap/Minimap";
import { AlignInputGroup } from "./components/AlignInputGroup/AlignInputGroup";
import { DimensionTextField } from "./components/DimensionTextField";
import { InlineTextField } from "./components/InlineTextField";

export type SelectionPanelProps = {};

export const SelectionPanel = () => {
  const { selectedShapes, editor } = useTldrawContext();
  const selectedShape = selectedShapes[0];
  const align = useMemo(() => {
    if (selectedShapes.length === 0 || selectedShapes.length > 1) {
      return undefined;
    }
    return {
      alignX: selectedShapes[0].props.alignX,
      alignY: selectedShapes[0].props.alignY,
    };
  }, [selectedShapes]);

  const renderControls = (main: ReactNode, aside?: ReactNode) => {
    return (
      <div className="flex h-full gap-2">
        <div className="flex h-full grow flex-col gap-2">{main}</div>
        <div className="flex size-[24px] shrink-0 items-center justify-center">
          {aside}
        </div>
      </div>
    );
  };

  return (
    <div className="border-gray-3 absolute top-0 right-0 bottom-0 left-0 z-50 overflow-y-auto border-l bg-white p-2">
      <div className="flex w-full flex-col gap-2">
        <Minimap />

        {renderControls(
          <div className="flex items-stretch gap-2">
            <DimensionTextField dimension="width" />
            <DimensionTextField dimension="height" />
          </div>,
        )}

        {renderControls(
          <div className="flex w-full gap-2">
            <div className="flex grow basis-0 flex-col gap-2">
              <SegmentedControl.Root
                defaultValue="horizontal"
                size="1"
                className="w-full"
              >
                <SegmentedControl.Item value="horizontal">
                  <ArrowRight />
                </SegmentedControl.Item>
                <SegmentedControl.Item value="vertical">
                  <ArrowDown />
                </SegmentedControl.Item>
              </SegmentedControl.Root>
              <InlineTextField label="g" />
            </div>
            <div className="grow basis-0">
              <AlignInputGroup
                value={align}
                onValueChange={({ alignX, alignY }) => {
                  if (!editor) return;
                  if (selectedShapes.length === 0 || selectedShapes.length > 1)
                    return;
                  const selectedShape = selectedShapes[0];
                  editor.updateShape<BoxShape>({
                    ...selectedShape,
                    props: {
                      ...selectedShape.props,
                      alignX,
                      alignY,
                    },
                  });
                }}
              />
            </div>
          </div>,
        )}
        {renderControls(
          <div className="flex items-stretch gap-2">
            <InlineTextField label="px" />
            <InlineTextField label="py" />
          </div>,
          <IconButton size="1" variant="soft">
            <PaddingIcon width={14} height={14} />
          </IconButton>,
        )}
      </div>
    </div>
  );
};
