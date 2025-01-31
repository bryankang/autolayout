import { Editor, IndexKey, TLShape } from "tldraw";

export const getChildShapes = <Shape extends TLShape>(
  editor: Editor,
  shape: Shape,
  binding: string
) => {
  const childBindings = editor.getBindingsFromShape(shape, binding);
  const childShapes = childBindings
    .map<Shape | undefined>((binding) => editor.getShape(binding.toId))
    .filter(Boolean) as Shape[];
  return childShapes;
};

export const getSortedChildShapes = <
  Shape extends TLShape & { props: { index: IndexKey } }
>(
  editor: Editor,
  shape: Shape,
  binding: string
) => {
  const childShapes = getChildShapes(editor, shape, binding);
  return childShapes.sort((a, b) => (a.props.index < b.props.index ? -1 : 1));
};
