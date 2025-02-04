import { createShapeId, Editor, TLShapeId, Vec } from "tldraw";
import { BoxShape } from "../shapes/box";
import { getSortedChildShapes } from "./common";

// When the currentShape is root, it will already have the calculated values
export const layout = (
  editor: Editor,
  currentShape: BoxShape,
  parentShape?: BoxShape
) => {
  if (parentShape) editor.bringToFront([currentShape]);
  const childShapes = getSortedChildShapes(editor, currentShape, "layout");

  if (!parentShape) {
    childShapes.forEach((s) => {
      layout(editor, s, currentShape);
    });
    return;
  }

  const calculatedSiblingShapes = calculateChildLayouts(
    editor,
    currentShape,
    parentShape
  );
  const calculatedCurrentShape = calculatedSiblingShapes.find(
    (s) => s.id === currentShape.id
  )!;

  editor.updateShape({
    ...calculatedCurrentShape,
    props: {
      ...calculatedCurrentShape.props,
      dragging: false,
    },
  });
  childShapes.forEach((s) => {
    layout(editor, s, calculatedCurrentShape);
  });
};

export const calculateChildLayouts = (
  editor: Editor,
  currentShape: BoxShape,
  parentShape: BoxShape
) => {
  // Siblings
  // Replace the siblings with the currentShape bc it may have been manually updated
  const siblingShapes = getSortedChildShapes(editor, parentShape, "layout").map(
    (s) => {
      if (s.id === currentShape.id) {
        return currentShape;
      }
      return s;
    }
  );

  const totalGapWidth =
    Math.max(siblingShapes.length - 1, 0) * parentShape.props.gap;

  const parentShapeWidth =
    parentShape.props.w -
    parentShape.props.pl -
    parentShape.props.pr -
    totalGapWidth;
  const parentShapeHeight =
    parentShape.props.h - parentShape.props.pt - parentShape.props.pb;

  const absoluteWidthSiblingShapes = siblingShapes.filter((s) => {
    return !s.props.fullWidth;
  });
  const totalAbsoluteWidth = absoluteWidthSiblingShapes.reduce((acc, s) => {
    return acc + s.props.w;
  }, 0);
  const remainingAbsoluteWidth = parentShapeWidth - totalAbsoluteWidth;
  const relativeWidthSiblingShapes = siblingShapes.filter((s) => {
    return s.props.fullWidth;
  });

  // const absoluteHeightSiblingShapes = sortedSiblingShapes.filter((s) => {
  //   return !s.props.fullHeight;
  // });
  // const totalAbsoluteHeight = absoluteHeightSiblingShapes.reduce((acc, s) => {
  //   return acc + s.props.h;
  // }, 0);
  // const remainingAbsoluteHeight = parentShape.props.h - totalAbsoluteHeight;
  // const relativeHeightSiblingShapes = sortedSiblingShapes.filter((s) => {
  //   return s.props.fullHeight;
  // });
  // const totalRelativeHeight = relativeHeightSiblingShapes.length;

  const calculatedSiblingShapes: BoxShape[] = [];
  for (let i = 0; i < siblingShapes.length; i++) {
    const siblingShape = siblingShapes[i];
    const calculatedX = calculatedSiblingShapes.reduce(
      (acc, s) => acc + s.props.w,
      parentShape.props.pl + i * parentShape.props.gap
    );
    const calculatedY = calculatedSiblingShapes.reduce(
      (acc, s) => acc + s.props.h,
      0
    );
    const calculatedWidth = siblingShape.props.fullWidth
      ? (1 / relativeWidthSiblingShapes.length) * remainingAbsoluteWidth
      : siblingShape.props.w;
    const calculatedHeight = siblingShape.props.fullHeight
      ? parentShapeHeight
      : siblingShape.props.h;

    const { x, y } = editor
      .getShapePageTransform(parentShape)
      .applyToPoint(new Vec(calculatedX, parentShape.props.pt));

    calculatedSiblingShapes.push({
      ...siblingShape,
      x,
      y,
      props: {
        ...siblingShape.props,
        w: Math.max(calculatedWidth, 1),
        h: Math.max(calculatedHeight, 1),
      },
    });
  }

  return calculatedSiblingShapes;
};

export const cloneLayout = (editor: Editor, currentShape: BoxShape) => {
  const rootCloneShapeId = createShapeId("clone.root");
  _cloneLayout(editor, rootCloneShapeId, currentShape);
  const rootCloneShape = editor.getShape(rootCloneShapeId) as BoxShape;
  return rootCloneShape;
};

const _cloneLayout = (
  editor: Editor,
  rootCloneShapeId: TLShapeId,
  currentShape: BoxShape,
  parentCloneShape?: BoxShape
) => {
  const cloneShapeId = !parentCloneShape ? rootCloneShapeId : createShapeId();
  editor.createShape({
    ...currentShape,
    id: cloneShapeId,
  });
  const cloneShape = editor.getShape(cloneShapeId) as BoxShape;
  editor.bringToFront([cloneShape]);

  if (parentCloneShape) {
    editor.createBinding({
      type: "layout",
      fromId: parentCloneShape.id,
      toId: cloneShape.id,
    });
  }
  const childShapes = getSortedChildShapes(editor, currentShape, "layout");
  childShapes.forEach((s) => {
    _cloneLayout(editor, rootCloneShapeId, s, cloneShape);
  });
};

export const deleteLayout = (editor: Editor, currentShape: BoxShape) => {
  const childShapes = getSortedChildShapes(editor, currentShape, "layout");
  editor.deleteShape(currentShape.id);

  childShapes.forEach((s) => {
    deleteLayout(editor, s);
  });
};
