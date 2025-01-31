import {
  BaseBoxShapeUtil,
  HTMLContainer,
  IndexKey,
  RecordProps,
  Rectangle2d,
  T,
  TLBaseShape,
} from "tldraw";

export type DroppableShapeProps = {
  index: IndexKey;
  w: number;
  h: number;
  active: boolean;
};

export type DroppableShape = TLBaseShape<"droppable", DroppableShapeProps>;

export class DroppableShapeUtil extends BaseBoxShapeUtil<DroppableShape> {
  static override type = "droppable" as const;
  static override props: RecordProps<DroppableShape> = {
    index: T.any,
    w: T.number,
    h: T.number,
    active: T.boolean,
  };

  override getDefaultProps() {
    return {
      // can't use base shape's index for some reason
      index: "a0" as IndexKey,
      w: 0,
      h: 0,
      active: false,
    };
  }

  override canEdit() {
    return false;
  }

  override getGeometry(shape: DroppableShape) {
    return new Rectangle2d({
      width: shape.props.w,
      height: shape.props.h,
      isFilled: true,
    });
  }

  override component(shape: DroppableShape) {
    return (
      <HTMLContainer
        style={{
          width: shape.props.w,
          height: shape.props.h,
          backgroundColor: "blue",
          opacity: shape.props.active ? 1 : 0,
        }}
      />
    );
  }

  override indicator(shape: DroppableShape) {
    return <rect width={shape.props.w} height={shape.props.h} />;
  }
}
