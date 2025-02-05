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

  const totalGapSize =
    Math.max(siblingShapes.length - 1, 0) * parentShape.props.gap;

  let parentShapeWidth =
    parentShape.props.w - parentShape.props.pl - parentShape.props.pr;
  let parentShapeHeight =
    parentShape.props.h - parentShape.props.pt - parentShape.props.pb;
  if (parentShape.props.direction === "horizontal") {
    parentShapeWidth -= totalGapSize;
  } else {
    parentShapeHeight -= totalGapSize;
  }

  const absoluteWidthSiblingShapes = siblingShapes.filter((s) => {
    return !s.props.fullWidth;
  });
  const totalAbsoluteWidth = absoluteWidthSiblingShapes.reduce((acc, s) => {
    return acc + s.props.w;
  }, 0);
  const remainingAbsoluteWidth =
    parentShape.props.direction === "horizontal"
      ? parentShapeWidth - totalAbsoluteWidth
      : parentShapeWidth;
  const relativeWidthSiblingShapes = siblingShapes.filter((s) => {
    return s.props.fullWidth;
  });

  const absoluteHeightSiblingShapes = siblingShapes.filter((s) => {
    return !s.props.fullHeight;
  });
  const totalAbsoluteHeight = absoluteHeightSiblingShapes.reduce((acc, s) => {
    return acc + s.props.h;
  }, 0);
  const remainingAbsoluteHeight =
    parentShape.props.direction === "vertical"
      ? parentShapeHeight - totalAbsoluteHeight
      : parentShapeHeight;
  const relativeHeightSiblingShapes = siblingShapes.filter((s) => {
    return s.props.fullHeight;
  });

  const calculatedSiblingShapes: BoxShape[] = [];
  for (let i = 0; i < siblingShapes.length; i++) {
    const siblingShape = siblingShapes[i];

    const calculatedX = calculatedSiblingShapes.reduce(
      (acc, s) => acc + s.props.w,
      parentShape.props.pl + i * parentShape.props.gap
    );
    const calculatedY = calculatedSiblingShapes.reduce(
      (acc, s) => acc + s.props.h,
      parentShape.props.pt + i * parentShape.props.gap
    );
    const calculatedHorizontalWidth = siblingShape.props.fullWidth
      ? (1 / relativeWidthSiblingShapes.length) * remainingAbsoluteWidth
      : siblingShape.props.w;
    const calculatedVerticalWidth = siblingShape.props.fullWidth
      ? remainingAbsoluteWidth
      : siblingShape.props.w;
    const calculatedHorizontalHeight = siblingShape.props.fullHeight
      ? remainingAbsoluteHeight
      : siblingShape.props.h;
    const calculatedVerticalHeight = siblingShape.props.fullHeight
      ? (1 / relativeHeightSiblingShapes.length) * remainingAbsoluteHeight
      : siblingShape.props.h;

    const horizontalPoint = new Vec(calculatedX, parentShape.props.pt);
    const verticalPoint = new Vec(parentShape.props.pl, calculatedY);

    const { x, y } = editor
      .getShapePageTransform(parentShape)
      .applyToPoint(
        parentShape.props.direction === "horizontal"
          ? horizontalPoint
          : verticalPoint
      );

    calculatedSiblingShapes.push({
      ...siblingShape,
      x,
      y,
      props: {
        ...siblingShape.props,
        w: Math.max(
          parentShape.props.direction === "horizontal"
            ? calculatedHorizontalWidth
            : calculatedVerticalWidth,
          1
        ),
        h: Math.max(
          parentShape.props.direction === "horizontal"
            ? calculatedHorizontalHeight
            : calculatedVerticalHeight,
          1
        ),
      },
    });
  }

  if (parentShape.props.alignX === "right") {
    if (parentShape.props.direction === "horizontal") {
      const totalSiblingWidth = calculatedSiblingShapes.reduce((acc, s, i) => {
        if (i === 0) return acc + s.props.w;
        return acc + s.props.w + parentShape.props.gap;
      }, 0);

      const dx =
        parentShape.props.w -
        parentShape.props.pl -
        parentShape.props.pr -
        totalSiblingWidth;
      for (let i = 0; i < calculatedSiblingShapes.length; i++) {
        const siblingShape = calculatedSiblingShapes[i];
        siblingShape.x += dx;
      }
    } else {
      const dx =
        parentShape.props.w - parentShape.props.pl - parentShape.props.pr;
      for (let i = 0; i < calculatedSiblingShapes.length; i++) {
        const siblingShape = calculatedSiblingShapes[i];
        siblingShape.x += dx - siblingShape.props.w;
      }
    }
  }
  if (parentShape.props.alignX === "center") {
    if (parentShape.props.direction === "horizontal") {
      const totalSiblingWidth = calculatedSiblingShapes.reduce((acc, s, i) => {
        if (i === 0) return acc + s.props.w;
        return acc + s.props.w + parentShape.props.gap;
      }, 0);
      const dx =
        (parentShape.props.w -
          parentShape.props.pl -
          parentShape.props.pr -
          totalSiblingWidth) /
        2;
      for (let i = 0; i < calculatedSiblingShapes.length; i++) {
        const siblingShape = calculatedSiblingShapes[i];
        siblingShape.x += dx;
      }
    } else {
      const dx =
        parentShape.props.w - parentShape.props.pl - parentShape.props.pr;
      for (let i = 0; i < calculatedSiblingShapes.length; i++) {
        const siblingShape = calculatedSiblingShapes[i];
        siblingShape.x += (dx - siblingShape.props.w) / 2;
      }
    }
  }
  if (parentShape.props.alignY === "bottom") {
    if (parentShape.props.direction === "vertical") {
      const totalSiblingHeight = calculatedSiblingShapes.reduce((acc, s, i) => {
        if (i === 0) return acc + s.props.h;
        return acc + s.props.h + parentShape.props.gap;
      }, 0);
      const dy =
        parentShape.props.h -
        parentShape.props.pt -
        parentShape.props.pb -
        totalSiblingHeight;
      for (let i = 0; i < calculatedSiblingShapes.length; i++) {
        const siblingShape = calculatedSiblingShapes[i];
        siblingShape.y += dy;
      }
    } else {
      const dy =
        parentShape.props.h - parentShape.props.pt - parentShape.props.pb;
      for (let i = 0; i < calculatedSiblingShapes.length; i++) {
        const siblingShape = calculatedSiblingShapes[i];
        siblingShape.y += dy - siblingShape.props.h;
      }
    }
  }
  if (parentShape.props.alignY === "center") {
    if (parentShape.props.direction === "vertical") {
      const totalSiblingHeight = calculatedSiblingShapes.reduce((acc, s, i) => {
        if (i === 0) return acc + s.props.h;
        return acc + s.props.h + parentShape.props.gap;
      }, 0);
      const dy =
        (parentShape.props.h -
          parentShape.props.pt -
          parentShape.props.pb -
          totalSiblingHeight) /
        2;
      for (let i = 0; i < calculatedSiblingShapes.length; i++) {
        const siblingShape = calculatedSiblingShapes[i];
        siblingShape.y += dy;
      }
    } else {
      const dy =
        parentShape.props.h - parentShape.props.pt - parentShape.props.pb;
      for (let i = 0; i < calculatedSiblingShapes.length; i++) {
        const siblingShape = calculatedSiblingShapes[i];
        siblingShape.y += (dy - siblingShape.props.h) / 2;
      }
    }
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
