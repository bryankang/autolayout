import {
  BaseBoxShapeUtil,
  Geometry2d,
  HTMLContainer,
  IndexKey,
  JsonObject,
  pointInPolygon,
  RecordProps,
  Rectangle2d,
  resizeBox,
  ShapeUtil,
  T,
  TLBaseShape,
  TLResizeInfo,
  TLShapeId,
  getIndexAbove,
  getIndexBetween,
  Vec,
} from "tldraw";
import { layout } from "../utils/layout";
import {
  createDroppableShapes,
  deleteDroppableShapes,
  getClosestDroppableShape,
} from "../utils/droppable";
import { getParentShape } from "../utils/common";
import { DroppableShape } from "./droppable";

export type BoxShapeProps = {
  index: IndexKey;
  color: string;
  w: number;
  h: number;
  fullWidth: boolean;
  fullHeight: boolean;
  placeholder: boolean;
  originalX: number;
  originalY: number;
};

export type BoxShape = TLBaseShape<"box", BoxShapeProps>;

export class BoxShapeUtil extends BaseBoxShapeUtil<BoxShape> {
  static override type = "box" as const;
  static override props: RecordProps<BoxShape> = {
    index: T.any,
    color: T.string,
    w: T.number,
    h: T.number,
    fullWidth: T.boolean,
    fullHeight: T.boolean,
    placeholder: T.boolean,
    originalX: T.number,
    originalY: T.number,
  };

  static naturalPadding = 8;

  override getDefaultProps() {
    return {
      index: "a0" as IndexKey,
      color: "lightpink",
      w: 0,
      h: 0,
      fullWidth: true,
      fullHeight: true,
      placeholder: false,
      originalX: 0,
      originalY: 0,
    };
  }

  override hideRotateHandle() {
    return true;
  }

  // override canResize() {
  //   return true;
  // }

  override onResize(shape: BoxShape, info: TLResizeInfo<any>) {
    const result = resizeBox(shape, info);
    if (shape.id === "shape:root") {
      this.resizeSymmetrically(result, info);
    }

    if (info.scaleX !== 1) result.props.fullWidth = false;
    if (info.scaleY !== 1) result.props.fullHeight = false;

    const parentBinding = this.editor.getBindingsToShape(result, "layout")?.[0];
    const parentShape = parentBinding
      ? this.editor.getShape(parentBinding.fromId)
      : undefined;

    this.editor.updateShape(result);
    if (parentShape) {
      // if not root, layout the siblings
      layout(this.editor, parentShape as any);
    } else {
      // If root, we don't need to take into account siblings
      layout(this.editor, result);
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

  override onTranslateStart(shape: BoxShape) {
    if (shape.id === "shape:root") {
      return shape;
    }

    const parentShape = getParentShape(this.editor, shape, "layout");
    createDroppableShapes(this.editor, parentShape!);

    const childShapes = this.getAllChildShapes(shape);
    const updatedChildShapes = childShapes.map((s) => ({
      ...s,
      props: {
        ...s.props,
        originalX: s.x,
        originalY: s.y,
      },
    }));
    this.editor.updateShapes(updatedChildShapes);

    this.bringAllToFront(shape);
  }

  private translateAllChildShapes(
    initialShape: BoxShape,
    currentShape: BoxShape
  ) {
    const dx = currentShape.x - initialShape.x;
    const dy = currentShape.y - initialShape.y;
    const allChildShapes = this.getAllChildShapes(initialShape);
    const updatedChildShapes = allChildShapes.map((s) => {
      return {
        ...s,
        x: s.props.originalX + dx,
        y: s.props.originalY + dy,
      };
    });
    this.editor.updateShapes(updatedChildShapes);
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
        }}
      />
    );
  }

  override indicator(shape: BoxShape) {
    return <rect width={shape.props.w} height={shape.props.h} />;
  }
}
