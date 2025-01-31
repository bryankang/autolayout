import type { MetaFunction } from "@vercel/remix";
import { TldrawView } from "~/lib/tldraw/tldraw";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  return (
    <div style={{ position: "fixed", inset: 0 }}>
      <TldrawView />
    </div>
  );
}
