import { Editor, TLResizeInfo } from "tldraw";
import { BoxShape } from "../shapes/box";
import { getParentShape, getSortedChildShapes } from "./common";

type ResizeOptions = {
  alignX: "left" | "center" | "right";
  alignY: "top" | "center" | "bottom";
};

export const resizeShape = (
  editor: Editor,
  shape: BoxShape,
  info: TLResizeInfo<BoxShape>,
  options: ResizeOptions
) => {
  const parentShape = getParentShape(editor, shape, "layout");
  if (!parentShape) return;
  const allSiblingShapes = getSortedChildShapes(editor, parentShape, "layout");
  const allSiblingShapesBelow = allSiblingShapes.filter(
    (s) => s.props.index < shape.props.index
  );
  const allSiblingShapesAbove = allSiblingShapes.filter(
    (s) => s.props.index > shape.props.index
  );
  const hasFullWidthSiblingBelow = allSiblingShapesBelow.some(
    (s) => s.props.fullWidth
  );
  const hasFullWidthSiblingAbove = allSiblingShapesAbove.some(
    (s) => s.props.fullWidth
  );
  const firstSiblingShape = allSiblingShapes[0];
  const lastSiblingShape = allSiblingShapes[allSiblingShapes.length - 1];
  const siblingShapes = allSiblingShapes.filter((s) => s.id !== shape.id);
  const hasFullWidthSibling = siblingShapes.some((s) => s.props.fullWidth);
  const hasFullHeightSibling = siblingShapes.some((s) => s.props.fullHeight);

  if (options.alignX === "left") {
    if (hasFullWidthSiblingAbove) {
      // if (
      //   info.handle === "left" ||
      //   info.handle === "top_left" ||
      //   info.handle === "bottom_left"
      // ) {
      const addWidth = info.scaleX > 1;
      const widthDelta = Math.abs(info.newPoint.x - info.initialShape.x);
      shape.x = info.initialShape.x;
      if (addWidth) {
        shape.props.w += widthDelta;
      } else {
        shape.props.w -= widthDelta;
      }
      // }
    }
  } else if (
    (options.alignX === "right" || hasFullWidthSibling) &&
    lastSiblingShape.id === shape.id
  ) {
    if (
      info.handle === "right" ||
      info.handle === "top_right" ||
      info.handle === "bottom_right"
    ) {
      const addWidth = info.scaleX > 1;
      const widthDelta = Math.abs(
        info.initialBounds.width * info.scaleX - info.initialBounds.width
      );
      if (addWidth) {
        shape.x -= widthDelta;
      } else {
        shape.x += widthDelta;
      }
    }
  } else {
  }

  if (options.alignY === "top") {
  } else if (options.alignY === "bottom") {
  } else {
  }

  shape.props.w = Math.max(shape.props.w, 1);
  shape.props.h = Math.max(shape.props.h, 1);
};
