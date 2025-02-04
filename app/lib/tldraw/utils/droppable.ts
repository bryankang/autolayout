import { createShapeId, Editor, getIndexBetween, IndexKey, Vec } from "tldraw";
import { BoxShape } from "../shapes/box";
import { getSortedChildShapes } from "./common";
import { DroppableShape } from "../shapes/droppable";

export const createDroppableShapes = (
  editor: Editor,
  parentShape: BoxShape
) => {
  const childBoxShapes = getSortedChildShapes(
    editor,
    parentShape,
    "layout"
  ).filter((s) => s.type === "box");

  if (childBoxShapes.length <= 1) {
    return;
  }

  const items: { index: IndexKey; x: number; y: number }[] = [];
  for (let i = 1; i < childBoxShapes.length; i++) {
    const prevShape = childBoxShapes[i - 1];
    const currShape = childBoxShapes[i];

    if (i === 1) {
      items.push({
        index: getIndexBetween(undefined, prevShape.props.index),
        x: (parentShape.x + prevShape.x) / 2,
        y: prevShape.y,
      });
    }

    items.push({
      index: getIndexBetween(prevShape.props.index, currShape.props.index),
      x: (prevShape.x + prevShape.props.w + currShape.x) / 2,
      y: currShape.y,
    });

    if (i === childBoxShapes.length - 1) {
      items.push({
        index: getIndexBetween(currShape.props.index, undefined),
        x:
          (currShape.x +
            currShape.props.w +
            parentShape.x +
            parentShape.props.w) /
          2,
        y: currShape.y,
      });
    }
  }

  const shapesToUpdate = items.map((item, i) => {
    return {
      id: createShapeId(`droppable:${i}`),
      type: "droppable",
      x: item.x,
      y: item.y,
      props: {
        index: item.index,
        w: 1,
        h: parentShape.props.h - parentShape.props.pt - parentShape.props.pb,
        active: false,
      },
    };
  });

  editor.createShapes(shapesToUpdate);
  editor.bringToFront(shapesToUpdate.map((s) => s.id));
};

export const getClosestDroppableShape = (
  editor: Editor,
  droppableShapes: DroppableShape[],
  shape: BoxShape
) => {
  if (droppableShapes.length === 0) {
    return undefined;
  }

  const anchor = editor
    .getShapePageTransform(shape)
    .applyToPoint(new Vec(shape.props.w / 2, shape.props.h / 2));

  const closestDroppableShape = droppableShapes.reduce((acc, s) => {
    const accDistance = Math.abs(acc.x - anchor.x);
    const currDistance = Math.abs(s.x - anchor.x);

    return accDistance < currDistance ? acc : s;
  });

  return closestDroppableShape;
};

export const deleteDroppableShapes = (editor: Editor) => {
  editor
    .getCurrentPageShapesSorted()
    .filter((s) => s.type === "droppable")
    .forEach((s) => {
      editor.deleteShape(s.id);
    });
};
