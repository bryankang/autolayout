import {
  BaseBoxShapeUtil,
  HTMLContainer,
  IndexKey,
  RecordProps,
  Rectangle2d,
  resizeBox,
  T,
  TLBaseShape,
  TLResizeInfo,
} from "tldraw";
import { getParentShape } from "../utils/common";
import {
  createDroppableShapes,
  deleteDroppableShapes,
  getClosestDroppableShape,
} from "../utils/droppable";
import {
  calculateChildLayouts,
  cloneLayout,
  deleteLayout,
  layout,
} from "../utils/layout";
import { DroppableShape } from "./droppable";

export type BoxShapeProps = {
  index: IndexKey;
  w: number;
  h: number;
  fullWidth: boolean;
  fullHeight: boolean;
  originalY: number; // used for translating children
  originalX: number; // used for translating children
  direction: string; // horizontal or vertical
  gap: number;
  pl: number;
  pr: number;
  pt: number;
  pb: number;
  color: string;
  dragging: boolean;
};

export type BoxShape = TLBaseShape<"box", BoxShapeProps>;

export class BoxShapeUtil extends BaseBoxShapeUtil<BoxShape> {
  static override type = "box" as const;
  static override props: RecordProps<BoxShape> = {
    index: T.any,
    w: T.number,
    h: T.number,
    fullWidth: T.boolean,
    fullHeight: T.boolean,
    originalX: T.number,
    originalY: T.number,
    direction: T.string,
    gap: T.number,
    pl: T.number,
    pr: T.number,
    pt: T.number,
    pb: T.number,
    color: T.string,
    dragging: T.boolean,
  };

  static naturalPadding = 8;

  override getDefaultProps() {
    return {
      index: "a0" as IndexKey,
      w: 0,
      h: 0,
      fullWidth: true,
      fullHeight: true,
      originalX: 0,
      originalY: 0,
      direction: "horizontal" as const,
      gap: 0,
      pl: 0,
      pr: 0,
      pt: 0,
      pb: 0,
      color: "lightpink",
      dragging: false,
    };
  }

  override hideRotateHandle() {
    return true;
  }

  // override canResize() {
  //   return true;
  // }

  override onResize(shape: BoxShape, info: TLResizeInfo<any>) {
    const parentShape = getParentShape(this.editor, shape, "layout");
    // console.log("onResize", shape, info);
    const scaleMinX = 1 / info.initialShape.props.w;
    const scaleMinY = 1 / info.initialShape.props.h;
    if (info.scaleX < scaleMinX) info.scaleX = scaleMinX;
    if (info.scaleY < scaleMinY) info.scaleY = scaleMinY;
    // resizeBox strips the props, so we need to add them back in
    const resizeResult = resizeBox(shape, info);
    const result = {
      ...shape,
      ...resizeResult,
      props: {
        ...shape.props,
        ...resizeResult.props,
        w: Math.max(resizeResult.props.w, 1),
        h: Math.max(resizeResult.props.h, 1),
        fullWidth: info.scaleX !== 1 ? false : shape.props.fullWidth,
        fullHeight: info.scaleY !== 1 ? false : shape.props.fullHeight,
      },
    };
    if (!parentShape) {
      this.resizeSymmetrically(result, info);
      layout(this.editor, result);
    } else {
      // Need to take into its own size depending on siblings
      const allCalculatedSiblingShapes = calculateChildLayouts(
        this.editor,
        result,
        parentShape
      );
      const calculatedCurrentShape = allCalculatedSiblingShapes.find(
        (s) => s.id === result.id
      )!;
      result.x = calculatedCurrentShape.x;
      result.y = calculatedCurrentShape.y;
      layout(this.editor, parentShape as any);
    }

    return result;
  }

  private resizeSymmetrically(result: any, info: TLResizeInfo<any>) {
    if (
      info.handle === "left" ||
      info.handle === "top_left" ||
      info.handle === "bottom_left"
    ) {
      const addWidth = info.scaleX > 1;
      const widthDelta = Math.abs(info.newPoint.x - info.initialShape.x);
      if (addWidth) {
        result.props.w += widthDelta;
      } else {
        result.props.w -= widthDelta;
      }
    }
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
        result.props.w += widthDelta;
        result.x -= widthDelta;
      } else {
        result.props.w -= widthDelta;
        result.x += widthDelta;
      }
    }
    if (
      info.handle === "top" ||
      info.handle === "top_left" ||
      info.handle === "top_right"
    ) {
      const addHeight = info.scaleY > 1;
      const heightDelta = Math.abs(info.newPoint.y - info.initialShape.y);
      if (addHeight) {
        result.props.h += heightDelta;
      } else {
        result.props.h -= heightDelta;
      }
    }
    if (
      info.handle === "bottom" ||
      info.handle === "bottom_left" ||
      info.handle === "bottom_right"
    ) {
      const addHeight = info.scaleY > 1;
      const heightDelta = Math.abs(
        info.initialBounds.height * info.scaleY - info.initialBounds.height
      );
      if (addHeight) {
        result.props.h += heightDelta;
        result.y -= heightDelta;
      } else {
        result.props.h -= heightDelta;
        result.y += heightDelta;
      }
    }

    return result;
  }

  private getAllChildShapes(shape: BoxShape) {
    const acc: BoxShape[] = [];
    this._getAllChildShapes(shape, acc);
    return acc;
  }

  private _getAllChildShapes(shape: BoxShape, acc: BoxShape[]) {
    const childBindings = this.editor.getBindingsFromShape(shape, "layout");
    const childShapes = childBindings.map((b) => this.editor.getShape(b.toId));
    childShapes.forEach((s) => {
      acc.push(s as BoxShape);
      this._getAllChildShapes(s as BoxShape, acc);
    });
  }

  private bringAllToFront(shape: BoxShape) {
    this.editor.bringToFront([shape]);
    const childBindings = this.editor.getBindingsFromShape(shape, "layout");
    const childShapes = childBindings.map((b) => this.editor.getShape(b.toId));
    childShapes.forEach((s) => this.bringAllToFront(s as BoxShape));
  }

  private rootCloneShape: BoxShape | undefined;

  override onTranslateStart(shape: BoxShape) {
    if (shape.id === "shape:root") {
      return shape;
    }

    const parentShape = getParentShape(this.editor, shape, "layout");
    createDroppableShapes(this.editor, parentShape!);

    const cloneScale = 0.9;
    const cloneWidth = shape.props.w * cloneScale;
    const cloneHeight = shape.props.h * cloneScale;
    const cloneX = shape.x + (shape.props.w - cloneWidth) / 2;
    const cloneY = shape.y + (shape.props.h - cloneHeight) / 2;

    this.rootCloneShape = cloneLayout(this.editor, {
      ...shape,
      x: cloneX,
      y: cloneY,
      props: {
        ...shape.props,
        w: cloneWidth,
        h: cloneHeight,
        originalX: cloneX,
        originalY: cloneY,
      },
    });
    layout(this.editor, this.rootCloneShape);

    // Hide all moving shapes and set their originalX and originalY
    // so that we can calculate the translation later
    const childShapes = this.getAllChildShapes(shape);
    const updatedChildShapes = childShapes.map((s) => ({
      ...s,
      props: {
        ...s.props,
        originalX: s.x,
        originalY: s.y,
        dragging: true,
      },
    }));
    const updatedShape = {
      ...shape,
      props: {
        ...shape.props,
        dragging: true,
      },
    };

    // Update all cloned shapes
    const clonedChildShapes = this.getAllChildShapes(this.rootCloneShape);
    const updatedRootChildShapes = clonedChildShapes.map((s) => ({
      ...s,
      props: {
        ...s.props,
        originalX: s.x,
        originalY: s.y,
      },
    }));

    this.editor.updateShapes([
      updatedShape,
      ...updatedChildShapes,
      ...updatedRootChildShapes,
    ]);
    this.bringAllToFront(shape);
    this.bringAllToFront(this.rootCloneShape);
  }

  private translateAllChildShapes(
    initialShape: BoxShape,
    currentShape: BoxShape
  ) {
    const dx = currentShape.x - initialShape.x;
    const dy = currentShape.y - initialShape.y;
    const allChildShapes = this.getAllChildShapes(initialShape);
    const clonedChildShapes = this.getAllChildShapes(this.rootCloneShape!);
    const updatedChildShapes = [...allChildShapes, ...clonedChildShapes].map(
      (s) => {
        return {
          ...s,
          x: s.props.originalX + dx,
          y: s.props.originalY + dy,
        };
      }
    );

    const updatedRootCloneShape = {
      ...this.rootCloneShape!,
      x: this.rootCloneShape!.props.originalX + dx,
      y: this.rootCloneShape!.props.originalY + dy,
    };

    this.editor.updateShapes([...updatedChildShapes, updatedRootCloneShape]);
  }

  override onTranslate(initialShape: BoxShape, currentShape: BoxShape) {
    if (initialShape.id === "shape:root") {
      return initialShape;
    }

    const unidirectionalCurrentShape = {
      ...currentShape,
      y: initialShape.y,
    };

    const droppableShapes = this.editor
      .getCurrentPageShapesSorted()
      .filter((s) => s.type === "droppable") as DroppableShape[];
    const closestDroppableShape = getClosestDroppableShape(
      this.editor,
      droppableShapes,
      unidirectionalCurrentShape
    );

    if (closestDroppableShape) {
      const droppablesToUpdate = droppableShapes.map((s) => {
        return {
          ...s,
          props: {
            ...s.props,
            active: s.id === closestDroppableShape.id,
          },
        };
      });
      this.editor.updateShapes(droppablesToUpdate);
    }

    this.translateAllChildShapes(initialShape, unidirectionalCurrentShape);
    return unidirectionalCurrentShape;
  }

  override onTranslateEnd(initialShape: BoxShape, currentShape: BoxShape) {
    if (initialShape.id === "shape:root") {
      return initialShape;
    }

    if (this.rootCloneShape) {
      deleteLayout(this.editor, this.rootCloneShape);
    }

    const unidirectionalCurrentShape = {
      ...currentShape,
      y: initialShape.y,
    };

    const droppableShapes = this.editor
      .getCurrentPageShapesSorted()
      .filter((s) => s.type === "droppable") as DroppableShape[];
    const closestDroppableShape = getClosestDroppableShape(
      this.editor,
      droppableShapes,
      unidirectionalCurrentShape
    );

    if (closestDroppableShape) {
      this.editor.updateShape({
        ...currentShape,
        props: {
          ...currentShape.props,
          index: closestDroppableShape.props.index,
        },
      });
    }

    deleteDroppableShapes(this.editor);
    const parentShape = getParentShape(this.editor, currentShape, "layout");
    layout(this.editor, parentShape as BoxShape);
  }

  override getGeometry(shape: BoxShape) {
    return new Rectangle2d({
      width: shape.props.w,
      height: shape.props.h,
      isFilled: true,
    });
  }

  override component(shape: BoxShape) {
    return (
      <HTMLContainer
        style={{
          backgroundColor: shape.props.color,
          width: shape.props.w,
          height: shape.props.h,
          opacity: shape.props.dragging ? 0 : 1,
        }}
      />
    );
  }

  override indicator(shape: BoxShape) {
    return <rect width={shape.props.w} height={shape.props.h} />;
  }
}
