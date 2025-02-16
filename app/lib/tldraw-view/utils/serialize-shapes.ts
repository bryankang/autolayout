import { Editor } from "tldraw";
import { BoxShape } from "../shapes/box";
import { getSortedChildShapes } from "./common";

export const serializeShapes = (editor: Editor, rootShape: BoxShape) => {
  const rootElement = document.createElement("div");
  styleElement(rootElement, rootShape);

  const childShapes = getSortedChildShapes(editor, rootShape, "layout");
  for (const shape of childShapes) {
    serializeShapes0(editor, shape, rootElement);
  }

  return rootElement.outerHTML;
};

const serializeShapes0 = (
  editor: Editor,
  shape: BoxShape,
  parentElement: HTMLElement,
) => {
  const element = document.createElement("div");
  styleElement(element, shape);
  parentElement.appendChild(element);

  const childShapes = getSortedChildShapes(editor, shape, "layout");
  for (const childShape of childShapes) {
    serializeShapes0(editor, childShape, element);
  }
};

const styleElement = (element: HTMLElement, shape: BoxShape) => {
  element.style.backgroundColor = shape.props.color;
  element.style.boxSizing = "border-box";
  if (shape.props.direction === "horizontal") {
    if (shape.props.fullWidth) element.style.flex = "1";
    else element.style.width = `${shape.props.w}px`;
    if (shape.props.fullHeight) element.style.height = "100%";
    else element.style.height = `${shape.props.h}px`;
  } else {
    if (shape.props.fullHeight) element.style.flex = "1";
    else element.style.height = `${shape.props.h}px`;
    if (shape.props.fullWidth) element.style.width = "100%";
    else element.style.width = `${shape.props.w}px`;
  }
  element.style.paddingTop = `${shape.props.pt}px`;
  element.style.paddingRight = `${shape.props.pr}px`;
  element.style.paddingBottom = `${shape.props.pb}px`;
  element.style.paddingLeft = `${shape.props.pl}px`;
  element.style.display = "flex";
  if (shape.props.direction === "horizontal") {
    element.style.flexDirection = `row`;
  } else {
    element.style.flexDirection = `column`;
  }
  if (shape.props.direction === "horizontal") {
    element.style.justifyContent = `flex-${shape.props.alignX}`;
    element.style.alignItems = `flex-${shape.props.alignY}`;
  } else {
    element.style.justifyContent = `flex-${shape.props.alignY}`;
    element.style.alignItems = `flex-${shape.props.alignX}`;
  }
  element.style.gap = `${shape.props.gap}px`;
};
