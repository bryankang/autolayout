import { Editor } from "tldraw";
import { BoxShape } from "../shapes/box";
import { getChildShapes, getSortedChildShapes } from "./common";

export const createDroppableShapes = (
  editor: Editor,
  parentShape: BoxShape
) => {
  const childShapes = getSortedChildShapes(editor, parentShape, "droppable");
};
