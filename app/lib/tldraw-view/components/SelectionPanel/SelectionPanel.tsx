import { useMemo } from "react";
import { useTldrawContext } from "../../contexts/TldrawContext";
import { AlignInputGroup } from "./components/AlignInputGroup/AlignInputGroup";
import { BoxShape } from "../../shapes/box";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "~/lib/components/ui/tabs";
import { s } from "node_modules/vite/dist/node/types.d-aGj9QkWt";
import { layout } from "../../utils/layout";

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

  return (
    <div className="absolute top-0 right-0 bottom-0 left-0 z-50 overflow-y-auto border-l border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex h-full w-full flex-col gap-4">
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
        <Tabs
          value={selectedShape?.props.direction}
          className="w-full"
          onValueChange={(direction) => {
            if (!editor) return;
            if (selectedShapes.length === 0 || selectedShapes.length > 1)
              return;
            const selectedShape = selectedShapes[0];
            editor.updateShape<BoxShape>({
              ...selectedShape,
              props: {
                ...selectedShape.props,
                direction,
              },
            });
            const rootShape = editor.getShape("shape:root");
            if (!rootShape) return;
            layout(editor, rootShape);
          }}
        >
          <TabsList>
            <TabsTrigger value="vertical" className="w-full">
              Vertical
            </TabsTrigger>
            <TabsTrigger value="horizontal" className="w-full">
              Horizontal
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
};
