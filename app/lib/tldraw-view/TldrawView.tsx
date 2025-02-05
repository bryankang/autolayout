import { FC } from "react";
import "tldraw/tldraw.css";
import { TldrawProvider } from "./contexts/TldrawContext";
import { Canvas } from "./components/Canvas/Canvas";
import { SelectionPanel } from "./components/SelectionPanel/SelectionPanel";

export const TldrawView: FC = () => {
  return (
    <TldrawProvider>
      <div className="relative flex h-dvh w-dvw">
        <div className="h-full grow">
          <Canvas />
        </div>
        <div className="relative h-full w-[280px]">
          <SelectionPanel />
        </div>
      </div>
    </TldrawProvider>
  );
};
