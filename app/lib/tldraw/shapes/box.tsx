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

export type BoxShapeProps = {
  color: string;
  index: IndexKey;
  w: number;
  h: number;
  fullWidth: boolean;
  fullHeight: boolean;
  placeholder: boolean;
  originalX: number;
  originalY: number;
};

export type BoxShape = TLBaseShape<"element", BoxShapeProps>;

export class BoxShapeUtil extends BaseBoxShapeUtil<BoxShape> {
  static override type = "box" as const;
  static override props: RecordProps<BoxShape> = {
    color: T.string,
    index: T.any,
    w: T.number,
    h: T.number,
    fullWidth: T.boolean,
    fullHeight: T.boolean,
    placeholder: T.boolean,
    originalX: T.number,
    originalY: T.number,
  };

  static naturalPadding = 8;

  // Dimensions in numeric values after calculating % values
  // intrinsicWidth = 0;
  // intrinsicHeight = 0;

  override getDefaultProps() {
    return {
      color: "lightpink",
      index: "a1" as IndexKey,
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

  // override onClick(shape: BoxShape) {
  // if (shape.id === "shape:root") {
  //   return;
  // }
  // const childShapes = this.getAllChildShapes(shape);
  // setTimeout(() => {
  //   this.editor.setSelectedShapes([shape, ...childShapes]);
  // }, 0);
  // }

  private bringAllToFront(shape: BoxShape) {
    this.editor.bringToFront([shape]);
    const childBindings = this.editor.getBindingsFromShape(shape, "layout");
    const childShapes = childBindings.map((b) => this.editor.getShape(b.toId));
    childShapes.forEach((s) => this.bringAllToFront(s as BoxShape));
  }

  // private translateAll(shape: BoxShape) {
  //   const childBindings = this.editor.getBindingsFromShape(shape, "layout");
  //   const childShapes = childBindings.map((b) => this.editor.getShape(b.toId));
  //   childShapes.forEach((s) => this.editor.translateShape(s as BoxShape));
  // }

  override onTranslateStart(shape: BoxShape) {
    if (shape.id === "shape:root") {
      return shape;
    }

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

  override onTranslate(shape: BoxShape, current: BoxShape) {
    if (shape.id === "shape:root") {
      return shape;
    }

    const childShapes = this.getAllChildShapes(shape);
    setTimeout(() => {
      this.editor.setSelectedShapes([shape, ...childShapes]);
    }, 0);

    console.log("translating", shape, current);

    this.translateAllChildShapes(shape, current);

    // const parentBinding = this.editor.getBindingsToShape(shape, "layout")?.[0];
    // if (!parentBinding) {
    //   return shape;
    // }

    // const parentShape = this.editor.getShape(parentBinding.fromId) as BoxShape;
    // const siblingBindings = this.editor.getBindingsFromShape(
    //   parentShape,
    //   "layout"
    // );
    // const siblingShapes = siblingBindings
    //   .map((b) => this.editor.getShape(b.toId) as BoxShape)
    //   .sort((a, b) => (a?.props.index < b!.props.index ? -1 : 1));
    // const siblingShapesWithoutCurrent = siblingShapes.filter(
    //   (s) => s.id !== shape.id
    // );
    // const siblingShapeIdsWithoutCurrent = siblingShapesWithoutCurrent.map(
    //   (s) => s.id
    // );

    // const anchor = this.editor.getShapePageTransform(shape).applyToPoint({
    //   x: shape.props.w / 2,
    //   y: shape.props.h / 2,
    // });

    // const intersectingSibling = this.editor.getShapeAtPoint(anchor, {
    //   filter: (s) => siblingShapeIdsWithoutCurrent.includes(s.id),
    // }) as BoxShape | undefined;

    // if (!intersectingSibling) {
    //   return;
    // }

    // let newIndex: IndexKey;
    // if (intersectingSibling.props.index > shape.props.index) {
    //   const nextSiblingIndex = siblingShapesWithoutCurrent.findIndex(
    //     (s) => s.id === intersectingSibling.id
    //   );
    //   console.log("nextSiblingIndex", nextSiblingIndex);
    //   newIndex = getIndexBetween(
    //     intersectingSibling.props.index,
    //     siblingShapesWithoutCurrent[nextSiblingIndex + 1]?.props.index
    //   );
    // } else {
    //   console.log("yo");
    //   const prevSiblingIndex = siblingShapesWithoutCurrent.findIndex(
    //     (s) => s.id === intersectingSibling.id
    //   );
    //   newIndex = getIndexBetween(
    //     siblingShapesWithoutCurrent[prevSiblingIndex - 1]?.props.index,
    //     shape.props.index
    //   );
    // }

    // console.log("oldIndex", shape.props.index);
    // console.log("newIndex", newIndex);

    // this.editor.updateShapes([
    //   {
    //     ...shape,
    //     props: {
    //       ...shape.props,
    //       index: newIndex,
    //     },
    //   },
    //   // ...siblingShapesWithoutCurrent.map((s) => ({
    //   //   ...s,
    //   //   props: {
    //   //     ...s.props,
    //   //     placeholder: intersectingSibling.id === s.id ? false : true,
    //   //   },
    //   // })),
    // ]);

    // layout(this.editor, parentShape);
  }

  override onTranslateEnd(shape: BoxShape) {
    if (shape.id === "shape:root") {
      return shape;
    }

    const parentBinding = this.editor.getBindingsToShape(shape, "layout")?.[0];
    if (!parentBinding) {
      return shape;
    }

    const parentShape = this.editor.getShape(parentBinding.fromId) as BoxShape;

    layout(this.editor, parentShape);
  }

  // override hideRotateHandle() {
  // 	return true
  // }
  // override isAspectRatioLocked() {
  // 	return true
  // }

  override getGeometry(shape: BoxShape) {
    return new Rectangle2d({
      // width: shape.props.calculatedWidth,
      // height: shape.props.calculatedHeight,
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
