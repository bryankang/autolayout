import {
  createContext,
  FC,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { Editor, TLEventInfo } from "tldraw";
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
  console.log("selectedShapes", selectedShapes);

  useEffect(() => {
    if (!editor) return;
    const unlisten = editor.store.listen(
      (update) => {
        setSelectedShapes(editor.getSelectedShapes() as BoxShape[]);
      },
      { scope: "document", source: "all" },
    );

    setSelectedShapes(editor.getSelectedShapes() as BoxShape[]);

    return () => {
      unlisten();
    };
  }, [editor]);

  useEffect(() => {
    if (!editor) return;
    const handleEvent = (e: TLEventInfo) => {
      if (e.type === "pointer" && e.name === "pointer_down") {
        setSelectedShapes(editor.getSelectedShapes() as BoxShape[]);
      }
    };
    editor.on("event", handleEvent);

    return () => {
      editor.off("event", handleEvent);
    };
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
