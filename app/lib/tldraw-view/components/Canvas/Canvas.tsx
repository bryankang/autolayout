import { FC } from "react";
import {
  createShapeId,
  DefaultBackground,
  DefaultCanvas,
  IndexKey,
  SelectTool,
  defaultTools,
  Tldraw,
  TLStateNodeConstructor,
  TLUiActionsContextType,
  Vec,
  DefaultSizeStyle,
} from "tldraw";
import "tldraw/tldraw.css";
import { LayoutBindingUtil } from "../../bindings/layout";
import { BoxShape, BoxShapeUtil } from "../../shapes/box";
import { DroppableShapeUtil } from "../../shapes/droppable";
import { layout } from "../../utils/layout";
import { SelectionPanel } from "../SelectionPanel/SelectionPanel";
import { useTldrawContext } from "../../contexts/TldrawContext";
import { Shortcuts } from "./components/Shortcuts/Shortcuts";
import { Minimap } from "./components/Minimap/Minimap";

DefaultSizeStyle.setDefaultValue("s");

class CustomSelectTool extends SelectTool {
  static override children(): TLStateNodeConstructor[] {
    return super.children().filter((c) => c.id !== "idle");
    // return [
    // 	Crop,
    // 	Cropping,
    // 	// Idle,
    // 	PointingCanvas,
    // 	PointingShape,
    // 	Translating,
    // 	Brushing,
    // 	ScribbleBrushing,
    // 	PointingCropHandle,
    // 	PointingSelection,
    // 	PointingResizeHandle,
    // 	EditingShape,
    // 	Resizing,
    // 	Rotating,
    // 	PointingRotateHandle,
    // 	PointingArrowLabel,
    // 	PointingHandle,
    // 	DraggingHandle,
    // ]
  }
}

export const Canvas: FC = () => {
  const { setEditor } = useTldrawContext();

  return (
    <div className="relative flex h-dvh w-dvw">
      <div className="h-full grow">
        <Tldraw
          cameraOptions={{}}
          // tools={[CustomSelectTool]}
          // assetUrls={{
          //   fonts: {
          //     draw: "/fonts/Inter.ttf",
          //   },
          // }}
          shapeUtils={[BoxShapeUtil, DroppableShapeUtil]}
          bindingUtils={[LayoutBindingUtil]}
          hideUi
          overrides={{
            actions: (editor, actions, helpers) => {
              // [4]
              const newActions: TLUiActionsContextType = {
                ...actions,
                // delete: {},
              };

              delete newActions.delete;
              delete newActions["select-all"];

              return newActions;
            },
          }}
          onMount={(editor) => {
            setEditor(editor);
            if (editor.getShape("shape:root" as any)) {
              return;
            }

            const center = new Vec(0, 0);
            editor.centerOnPoint(center);
            editor.setCameraOptions({
              constraints: {
                origin: new Vec(0.5, 0.5),
                baseZoom: "default",
                behavior: "fixed",
                initialZoom: "default",
                padding: center,
                bounds: {
                  w: 0,
                  h: 0,
                  x: 0,
                  y: 0,
                },
              },
            });
            const rootId = createShapeId("root");
            const firstId = createShapeId("first");
            const secondId = createShapeId("second");
            const thirdId = createShapeId("third");
            const fourthId = createShapeId("fourth");
            const fifthId = createShapeId("fifth");

            editor.createShape<BoxShape>({
              type: "box",
              id: rootId,
              x: -400 / 2,
              y: -400 / 2,
              props: {
                index: "a0" as IndexKey,
                depth: 0,
                color: "lightgray",
                w: 400,
                h: 400,
                fullWidth: false,
                fullHeight: false,
                // direction: "vertical",
                // alignX: "right",
                alignX: "center",
                alignY: "center",
                // gap: 8,
                // pl: 0,
                // pr: 8,
                // pt: 8,
                // pb: 8,
              },
            });

            editor.createShape<BoxShape>({
              id: firstId,
              type: "box",
              x: 0,
              y: 0,
              props: {
                index: "a2",
                depth: 1,
                // alignX: "center",
                // alignY: "center",
                // gap: 8,
                // pl: 0,
                // pr: 8,
                // pt: 8,
                // pb: 8,
              },
            });

            // editor.createShape({
            //   id: secondId,
            //   type: "box",
            //   x: 0,
            //   y: 0,
            //   props: {
            //     index: "a3",
            //     depth: 1,
            //     color: "lightblue",
            //     gap: 12,
            //   },
            // });

            // editor.createShape({
            //   id: thirdId,
            //   type: "box",
            //   x: 0,
            //   y: 0,
            //   props: {
            //     index: "a4",
            //     depth: 1,
            //     color: "salmon",
            //     w: 10,
            //     fullWidth: false,
            //     // fullHeight: false,
            //   },
            // });

            // editor.createShape({
            //   id: fourthId,
            //   type: "box",
            //   x: 0,
            //   y: 0,
            //   props: {
            //     index: "a5",
            //     depth: 2,
            //     color: "teal",
            //   },
            // });

            // editor.createShape({
            //   id: fifthId,
            //   type: "box",
            //   x: 0,
            //   y: 0,
            //   props: {
            //     index: "a6",
            //     depth: 2,
            //     color: "purple",
            //   },
            // });

            editor.createBinding({
              type: "layout",
              fromId: rootId,
              toId: firstId,
            });

            // editor.createBinding({
            //   type: "layout",
            //   fromId: rootId,
            //   toId: secondId,
            // });

            // editor.createBinding({
            //   type: "layout",
            //   fromId: rootId,
            //   toId: thirdId,
            // });

            // editor.createBinding({
            //   type: "layout",
            //   fromId: secondId,
            //   toId: fourthId,
            // });

            // editor.createBinding({
            //   type: "layout",
            //   fromId: secondId,
            //   toId: fifthId,
            // });

            const rootShape = editor.getShape(rootId) as BoxShape;
            const firstShape = editor.getShape(firstId) as BoxShape;

            layout(editor, rootShape);

            editor.select(rootShape);

            console.log("store", editor.getSnapshot().document.store);
          }}
        >
          <Shortcuts />
          <Minimap />
        </Tldraw>
      </div>
      <div className="relative h-full w-[240px]">
        <SelectionPanel />
      </div>
    </div>
  );
};
