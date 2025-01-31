import { Editor, TLShape, Vec } from "tldraw";
import { BoxShape } from "../shapes/box";
import { getChildShapes, getSortedChildShapes } from "./common";

// When the currentShape is root, it will already have the calculated values
export const layout = (
  editor: Editor,
  currentShape: BoxShape,
  parentShape?: BoxShape
) => {
  const childShapes = getSortedChildShapes(editor, currentShape, "layout");

  if (!parentShape) {
    childShapes.forEach((s) => {
      editor.bringToFront([s]);
      layout(editor, s, currentShape);
    });
    return;
  }

  const calculatedSiblingShapes = calculateChildLayouts(
    editor,
    currentShape,
    parentShape
  );
  console.log("calculatedSiblingShapes", calculatedSiblingShapes);
  const calculatedCurrentShape = calculatedSiblingShapes.find(
    (s) => s.id === currentShape.id
  )!;

  editor.updateShape(calculatedCurrentShape);
  childShapes.forEach((s) => {
    editor.bringToFront([s]);
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

  const absoluteWidthSiblingShapes = siblingShapes.filter((s) => {
    return !s.props.fullWidth;
  });
  const totalAbsoluteWidth = absoluteWidthSiblingShapes.reduce((acc, s) => {
    return acc + s.props.w;
  }, 0);
  const remainingAbsoluteWidth = parentShape.props.w - totalAbsoluteWidth;
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
      0
    );
    const calculatedY = calculatedSiblingShapes.reduce(
      (acc, s) => acc + s.props.h,
      0
    );
    const calculatedWidth = siblingShape.props.fullWidth
      ? (1 / relativeWidthSiblingShapes.length) * remainingAbsoluteWidth
      : siblingShape.props.w;
    const calculatedHeight = siblingShape.props.fullHeight
      ? parentShape.props.h - 10
      : siblingShape.props.h;

    const { x, y } = editor
      .getShapePageTransform(parentShape)
      .applyToPoint(new Vec(calculatedX, 0));

    calculatedSiblingShapes.push({
      ...siblingShape,
      x,
      y,
      props: {
        ...siblingShape.props,
        w: calculatedWidth,
        h: calculatedHeight,
      },
    });
  }

  return calculatedSiblingShapes;
};
