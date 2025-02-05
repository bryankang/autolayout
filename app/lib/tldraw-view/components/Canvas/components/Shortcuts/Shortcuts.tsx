import { useEffect } from "react";
import { createShapeId, getIndexBetween, IndexKey, useEditor } from "tldraw";
import hotkeys from "hotkeys-js";
import { BoxShape } from "~/lib/tldraw-view/shapes/box";
import {
  getParentShape,
  getSortedChildShapes,
} from "~/lib/tldraw-view/utils/common";
import { layout } from "~/lib/tldraw-view/utils/layout";

function getRandomColor() {
  var letters = "0123456789ABCDEF";
  var color = "#";
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

export const Shortcuts = () => {
  const editor = useEditor();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Delete || Backspace") {
        e.preventDefault();
        const selectedShapeIds = editor
          .getSelectedShapeIds()
          .filter((id) => id !== "shape:root");
        const selectedShapes = selectedShapeIds.map(
          (id) => editor.getShape(id) as BoxShape,
        );
        const oldestShape = selectedShapes.reduce(
          (acc, s) => {
            if (!acc) return s;
            if (s.props.depth < acc.props.depth) {
              return s;
            }
            return acc;
          },
          undefined as BoxShape | undefined,
        );
        const parentOfOldestShape =
          oldestShape && getParentShape(editor, oldestShape, "layout");
        editor.deleteShapes(selectedShapeIds);
        const rootShape = editor.getShape("shape:root" as any) as BoxShape;
        layout(editor, rootShape);
        editor.select(parentOfOldestShape ?? rootShape);
      } else if (e.key === "f") {
        const selectedShape = editor.getSelectedShapes()?.[0] as BoxShape;
        if (!selectedShape) return;

        let index: IndexKey;
        const childShapes = getSortedChildShapes(
          editor,
          selectedShape,
          "layout",
        );
        if (childShapes.length === 0) {
          index = "a1" as IndexKey;
        } else {
          const lastChildShape = childShapes[childShapes.length - 1];
          index = getIndexBetween(lastChildShape.props.index, undefined);
        }

        const shapeId = createShapeId();
        editor.createShape<BoxShape>({
          type: "box",
          id: shapeId,
          x: 0,
          y: 0,
          props: {
            index,
            depth: selectedShape.props.depth + 1,
            color: getRandomColor(),
            w: 100,
            h: 100,
            fullWidth: true,
            fullHeight: true,
            gap: 0,
            pl: 0,
            pr: 0,
            pt: 0,
            pb: 0,
          },
        });
        editor.createBinding({
          type: "layout",
          fromId: selectedShape.id,
          toId: shapeId,
        });

        layout(editor, selectedShape);

        editor.select(selectedShape);
      } else if (e.metaKey && e.key === "d") {
        e.preventDefault();
        const selectedShape = editor.getSelectedShapes()?.[0] as BoxShape;
        if (!selectedShape || selectedShape.id === "shape:root") return;
        const parentShape = getParentShape(
          editor,
          selectedShape,
          "layout",
        ) as BoxShape;
        const siblingShapes = getSortedChildShapes(
          editor,
          parentShape,
          "layout",
        );
        const selectedShapeOrderIndex = siblingShapes.findIndex(
          (s) => s.id === selectedShape.id,
        );
        const newShapeId = createShapeId();
        editor.createShape<BoxShape>({
          ...selectedShape,
          id: newShapeId,
          props: {
            ...selectedShape.props,
            index: getIndexBetween(
              selectedShape.props.index,
              siblingShapes[selectedShapeOrderIndex + 1]?.props.index,
            ),
          },
        });
        editor.createBinding({
          type: "layout",
          fromId: parentShape.id,
          toId: newShapeId,
        });
        layout(editor, parentShape);
        const newShape = editor.getShape(newShapeId) as BoxShape;
        editor.select(newShape);
      } else if (false) {
        // arrow keys to swap shapes
      }
    };

    hotkeys("enter", (e) => {
      "enter";
      const selectedShapes = editor.getSelectedShapes() as BoxShape[];
      if (selectedShapes.length === 0 || selectedShapes.length > 1) return;
      const childShapes = getSortedChildShapes(
        editor,
        selectedShapes[0],
        "layout",
      );
      if (childShapes.length === 0) return;
      editor.select(...childShapes);
    });

    // Needed a library for this key combo
    hotkeys("shift+enter", (e) => {
      console.log('"shift+enter"');
      const selectedShapes = editor.getSelectedShapes() as BoxShape[];
      if (selectedShapes.length === 0) return;
      if (selectedShapes.find((s) => s.id === "shape:root")) return;
      if (
        !selectedShapes.every(
          (s) => s.props.depth === selectedShapes[0].props.depth,
        )
      )
        return;

      const parentShape = getParentShape(
        editor,
        selectedShapes[0],
        "layout",
      ) as BoxShape;
      editor.select(parentShape);
    });

    hotkeys("left,up,right,down", (e) => {
      console.log("arrow", e);
      if (e.key === "LeftArrow") {
      }

      const selectedShapes = editor.getSelectedShapes() as BoxShape[];
      if (selectedShapes.length === 0 || selectedShapes.length > 1) return;
      const selectedShape = selectedShapes[0];
      const parentShape = getParentShape(
        editor,
        selectedShape,
        "layout",
      ) as BoxShape;
      if (!parentShape) return;
      const siblingShapes = getSortedChildShapes(editor, parentShape, "layout");
      const selectedShapeOrderIndex = siblingShapes.findIndex(
        (s) => s.id === selectedShape.id,
      );
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        if (selectedShapeOrderIndex === 0) return;
        const before1 = siblingShapes[selectedShapeOrderIndex - 1];
        const before2 = siblingShapes[selectedShapeOrderIndex - 2];
        if (!before1 && !before2) return;
        editor.updateShape({
          ...selectedShape,
          props: {
            ...selectedShape.props,
            index: getIndexBetween(
              siblingShapes[selectedShapeOrderIndex - 1]?.props.index,
              siblingShapes[selectedShapeOrderIndex - 2]?.props.index,
            ),
          },
        });
        layout(editor, parentShape);
      } else if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        console.log("arrowRight");
        // TODO: fix
        if (selectedShapeOrderIndex === siblingShapes.length - 1) return;
        const after1 = siblingShapes[selectedShapeOrderIndex + 1];
        const after2 = siblingShapes[selectedShapeOrderIndex + 2];
        if (!after1 && !after2) return;
        editor.updateShape({
          ...selectedShape,
          props: {
            ...selectedShape.props,
            index: getIndexBetween(
              siblingShapes[selectedShapeOrderIndex + 1]?.props.index,
              siblingShapes[selectedShapeOrderIndex + 2]?.props.index,
            ),
          },
        });
        layout(editor, parentShape);
      }
    });

    window.addEventListener("keydown", handleKeyDown);
    // window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      hotkeys.unbind("enter");
      hotkeys.unbind("shift+enter");
      hotkeys.unbind("left,up,right,down");

      // window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  return <div></div>;
};
