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

export type DroppableShape = TLBaseShape<"element", DroppableShapeProps>;

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
      index: "a1" as IndexKey,
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
          backgroundColor: "yellow",
          width: shape.props.w,
          height: shape.props.h,
        }}
      />
    );
  }

  override indicator(shape: DroppableShape) {
    return <rect width={shape.props.w} height={shape.props.h} />;
  }
}
