import { ArrowDown } from "@phosphor-icons/react/dist/icons/ArrowDown";
import { ArrowRight } from "@phosphor-icons/react/dist/icons/ArrowRight";
import { PaddingIcon } from "@radix-ui/react-icons";
import { ReactNode, useMemo, useState } from "react";
import { Button, IconButton, Kbd, SegmentedControl } from "~/lib/radix-themes";
import { useTldrawContext } from "../../contexts/TldrawContext";
import { BoxShape, INTRINSIC_GAP } from "../../shapes/box";
import { Minimap } from "../Canvas/components/Minimap/Minimap";
import { AlignInputGroup } from "./components/AlignInputGroup/AlignInputGroup";
import { DimensionTextField } from "./components/DimensionTextField";
import { InlineTextField } from "./components/InlineTextField";
import { getParentShape } from "../../utils/common";
import { layout } from "../../utils/layout";
import { ExportDialog } from "./components/ExportDialog/ExportDialog";

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
  const [exportOpen, setExportOpen] = useState(false);

  const renderControls = (main: ReactNode, aside?: ReactNode) => {
    return (
      <div className="flex gap-2">
        <div className="flex h-full grow flex-col gap-2">{main}</div>
        <div className="flex size-[24px] shrink-0 items-center justify-center">
          {aside}
        </div>
      </div>
    );
  };

  console.log("selectedShapeselectedShape", selectedShape);

  return (
    <>
      <div className="border-gray-3 absolute top-0 right-0 bottom-0 left-0 z-50 overflow-y-auto border-l bg-white p-2">
        <div className="flex h-full w-full flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Minimap />

            {renderControls(
              <div className="flex items-stretch gap-2">
                <DimensionTextField
                  dimension="width"
                  value={
                    selectedShape?.props.w
                      ? Math.round(selectedShape.props.w)
                      : ""
                  }
                  onValueChange={(value) => {
                    if (!editor) return;
                    if (
                      selectedShapes.length === 0 ||
                      selectedShapes.length > 1
                    )
                      return;
                    const selectedShape = selectedShapes[0] as BoxShape;
                    editor.updateShape<BoxShape>({
                      ...selectedShape,
                      props: {
                        ...selectedShape.props,
                        w: value,
                      },
                    });
                    const rootShape = editor.getShape(
                      "shape:root" as any,
                    ) as BoxShape;
                    layout(editor, rootShape);
                  }}
                  full={selectedShape?.props.fullWidth}
                  onFullChange={(full) => {
                    if (!editor) return;
                    if (
                      selectedShapes.length === 0 ||
                      selectedShapes.length > 1
                    )
                      return;
                    const selectedShape = selectedShapes[0] as BoxShape;
                    editor.updateShape<BoxShape>({
                      ...selectedShape,
                      props: {
                        ...selectedShape.props,
                        fullWidth: full,
                      },
                    });
                    const rootShape = editor.getShape(
                      "shape:root" as any,
                    ) as BoxShape;
                    layout(editor, rootShape);
                  }}
                  disabled={
                    selectedShapes.length > 1 || selectedShapes.length === 0
                  }
                />
                <DimensionTextField
                  dimension="height"
                  value={
                    selectedShape?.props.h
                      ? Math.round(selectedShape.props.h)
                      : ""
                  }
                  onValueChange={(value) => {
                    if (!editor) return;
                    if (
                      selectedShapes.length === 0 ||
                      selectedShapes.length > 1
                    )
                      return;
                    const selectedShape = selectedShapes[0];
                    editor.updateShape<BoxShape>({
                      ...selectedShape,
                      props: {
                        ...selectedShape.props,
                        h: value,
                      },
                    });
                  }}
                  full={selectedShape?.props.fullHeight}
                  onFullChange={(full) => {
                    if (!editor) return;
                    if (
                      selectedShapes.length === 0 ||
                      selectedShapes.length > 1
                    )
                      return;
                    const selectedShape = selectedShapes[0] as BoxShape;
                    editor.updateShape<BoxShape>({
                      ...selectedShape,
                      props: {
                        ...selectedShape.props,
                        fullHeight: full,
                      },
                    });
                    const rootShape = editor.getShape(
                      "shape:root" as any,
                    ) as BoxShape;
                    layout(editor, rootShape);
                  }}
                  disabled={
                    selectedShapes.length > 1 || selectedShapes.length === 0
                  }
                />
              </div>,
            )}

            {renderControls(
              <div className="flex w-full gap-2">
                <div className="flex grow basis-0 flex-col gap-2">
                  <SegmentedControl.Root
                    disabled={
                      selectedShapes.length > 1 || selectedShapes.length === 0
                    }
                    value={selectedShape?.props.direction}
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
                  <InlineTextField
                    label="g"
                    value={
                      selectedShape?.props.gap
                        ? selectedShape.props.gap - INTRINSIC_GAP
                        : ""
                    }
                    disabled={
                      selectedShapes.length > 1 || selectedShapes.length === 0
                    }
                  />
                </div>
                <div className="grow basis-0">
                  <AlignInputGroup
                    value={align}
                    onValueChange={({ alignX, alignY }) => {
                      if (!editor) return;
                      if (
                        selectedShapes.length === 0 ||
                        selectedShapes.length > 1
                      )
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

          <div className="flex grow flex-col gap-1.5 scroll-auto">
            <span className="text-gray-10 text-xs">Keyboard shortcuts</span>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-gray-12 text-xs">Create child shape</span>
                <Kbd size="1">F</Kbd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-gray-12 text-xs">Duplicate shape</span>
                <Kbd size="1">⌘D</Kbd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-gray-12 text-xs">Delete shape</span>
                <Kbd size="1">Backspace</Kbd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-gray-12 text-xs">Toggle full width</span>
                <Kbd size="1">Shift+W</Kbd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-gray-12 text-xs">Toggle full height</span>
                <Kbd size="1">Shift+H</Kbd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-gray-12 text-xs">Horizontal layout</span>
                <Kbd size="1">H</Kbd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-gray-12 text-xs">Vertical layout</span>
                <Kbd size="1">V</Kbd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-gray-12 text-xs">Align shape</span>
                <span className="flex gap-1">
                  <Kbd size="1">←</Kbd>
                  <Kbd size="1">↑</Kbd>
                  <Kbd size="1">→</Kbd>
                  <Kbd size="1">↓</Kbd>
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-gray-12 text-xs">
                  Select children shapes
                </span>
                <span className="flex gap-1">
                  <Kbd size="1">Enter</Kbd>
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-gray-12 text-xs">
                  Select parent shape
                </span>
                <span className="flex gap-1">
                  <Kbd size="1">Shift+Enter</Kbd>
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Button
              size="1"
              variant="solid"
              onClick={() => setExportOpen(true)}
            >
              Export
            </Button>
          </div>
        </div>
      </div>
      <ExportDialog open={exportOpen} onOpenChange={setExportOpen} />
    </>
  );
};
