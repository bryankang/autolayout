import {
  createContext,
  FC,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { Editor } from "tldraw";
import { BoxShape } from "../shapes/box";

export type TldrawContextType = {
  editor?: Editor;
  setEditor: (editor: Editor) => void;
  selectedShapes: BoxShape[];
};

const TldrawContext = createContext<TldrawContextType | undefined>(undefined);

export type TldrawProviderProps = {
  children?: ReactNode;
};

export const TldrawProvider: FC<TldrawProviderProps> = ({ children }) => {
  const [editor, setEditor] = useState<Editor>();
  const [selectedShapes, setSelectedShapes] = useState<BoxShape[]>([]);

  useEffect(() => {
    if (!editor) return;
    setSelectedShapes(editor.getSelectedShapes() as BoxShape[]);
  }, [editor]);

  return (
    <TldrawContext.Provider value={{ editor, setEditor, selectedShapes }}>
      {children}
    </TldrawContext.Provider>
  );
};

export const useTldrawContext = () => {
  const ctx = useContext(TldrawContext);
  if (!ctx) {
    throw new Error("useTldrawContext() must be called inside TldrawProvider.");
  }
  return ctx;
};
