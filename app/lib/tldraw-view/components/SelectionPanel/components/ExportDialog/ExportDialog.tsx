import React from "react";
import { FC, ReactNode, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  Flex,
  Inset,
  Tabs,
  Text,
} from "~/lib/radix-themes";
import { cn } from "~/styles/utils";
import Editor from "react-simple-code-editor";
import Prism from "prismjs/components/prism-core";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import "prismjs/themes/prism.css"; //Example style, you can use another
import { useTldrawContext } from "~/lib/tldraw-view/contexts/TldrawContext";
import { serializeShapes } from "~/lib/tldraw-view/utils/serialize-shapes";
import { BoxShape } from "~/lib/tldraw-view/shapes/box";

export type ExportDialogProps = {
  children?: ReactNode;
  className?: string;
  open?: boolean;
  onOpenChange?: () => void;
};

export const ExportDialog: FC<ExportDialogProps> = ({
  children,
  className,
  open,
  onOpenChange,
}) => {
  const { selectedShapes, editor } = useTldrawContext();

  const [code, setCode] = useState(`<Flex gap="3">
	<Box width="64px" height="64px">
		<DecorativeBox />
	</Box>
	<Box width="64px" height="64px">
		<DecorativeBox />
	</Box>
	<Box width="64px" height="64px">
		<DecorativeBox />
	</Box>
	<Box width="64px" height="64px">
		<DecorativeBox />
	</Box>
	<Box width="64px" height="64px">
		<DecorativeBox />
	</Box>
</Flex>
    `);

  //   const output = `<Flex flexGrow="1" flexBasis="0" direction="column" gap="2">
  //   <Flex flexGrow="1" flexBasis="0" direction="row" align="center" gap="2">
  //     <Flex flexGrow="1" flexBasis="0" direction="row">
  //       {/* Placeholder */}
  //     </Flex>
  //     <Flex flexGrow="1" flexBasis="0" direction="row">
  //       {/* Placeholder */}
  //     </Flex>
  //   </Flex>
  //   <Flex flexGrow="1" flexBasis="0" direction="row" align="center" gap="2">
  //     <Flex flexGrow="1" flexBasis="0" direction="row">
  //       {/* Placeholder */}
  //     </Flex>
  //     <Flex flexGrow="1" flexBasis="0" direction="row">
  //       {/* Placeholder */}
  //     </Flex>
  //   </Flex>
  //   <Flex flexGrow="1" flexBasis="0" direction="row" align="center" gap="2">
  //     <Flex flexGrow="1" flexBasis="0" direction="row">
  //       {/* Placeholder */}
  //     </Flex>
  //     <Flex flexGrow="1" flexBasis="0" direction="row">
  //       {/* Placeholder */}
  //     </Flex>
  //   </Flex>
  // </Flex>`;

  const [output, setOutput] = useState("");

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content maxWidth="960px" className="border-none">
        <Inset>
          <div className={cn(["flex h-[640px] items-stretch", className])}>
            <div className="flex flex-1 flex-col">
              <div className="flex flex-1 flex-col overflow-auto p-3 pb-0">
                <Dialog.Title
                  size="2"
                  mt="1"
                  mb="1"
                  className="text-gray-12 font-semibold"
                >
                  Export snippet
                </Dialog.Title>
                <Dialog.Description size="1" mb="2" className="text-gray-11">
                  Choose how you want the snippet to look like
                </Dialog.Description>

                <Tabs.Root
                  defaultValue="tailwind"
                  className="flex flex-1 flex-col"
                >
                  <Tabs.List size="1">
                    <Tabs.Trigger value="tailwind">
                      Tailwind (default)
                    </Tabs.Trigger>
                    <Tabs.Trigger value="styled-components">
                      Styled Components
                    </Tabs.Trigger>
                    <Tabs.Trigger value="swiftui">SwiftUI</Tabs.Trigger>
                    <Tabs.Trigger value="custom">Custom</Tabs.Trigger>
                  </Tabs.List>

                  <div className="flex flex-1 flex-col pt-3">
                    <Tabs.Content
                      value="tailwind"
                      className="flex flex-1 flex-col"
                    >
                      <Editor
                        value={code}
                        onValueChange={(code) => setCode(code)}
                        highlight={(code) =>
                          Prism.highlight(
                            code,
                            Prism.languages.js,
                            "javascript",
                          )
                        }
                        padding={10}
                        className="border-gray-4 flex-1 rounded-sm border"
                        readOnly
                        style={{
                          fontFamily:
                            '"Office Code Pro", "Fira Mono", monospace',
                          fontSize: 12,
                        }}
                      />
                    </Tabs.Content>

                    <Tabs.Content value="styled-components">
                      <Text size="2">Access and update your documents.</Text>
                    </Tabs.Content>

                    <Tabs.Content value="swiftui">
                      <Text size="2">
                        Edit your profile or update contact information.
                      </Text>
                    </Tabs.Content>

                    <Tabs.Content
                      value="custom"
                      className="flex flex-1 flex-col"
                    >
                      <Editor
                        value={code}
                        onValueChange={(code) => setCode(code)}
                        highlight={(code) =>
                          Prism.highlight(
                            code,
                            Prism.languages.js,
                            "javascript",
                          )
                        }
                        padding={10}
                        className="border-gray-4 flex-1 rounded-sm border"
                        style={{
                          fontFamily:
                            '"Office Code Pro", "Fira Mono", monospace',
                          fontSize: 12,
                        }}
                      />
                    </Tabs.Content>
                  </div>
                </Tabs.Root>
              </div>
              <div className="border-gray-3 flex items-center justify-end gap-2 p-3">
                <Dialog.Close>
                  <Button variant="outline" size="1" color="gray" highContrast>
                    Cancel
                  </Button>
                </Dialog.Close>
                <Button
                  variant="solid"
                  size="1"
                  color="gray"
                  highContrast
                  onClick={async () => {
                    if (!editor) return;
                    const rootShape = editor.getShape("shape:root") as BoxShape;
                    const serializedShapes = serializeShapes(editor, rootShape);
                    console.log("export", serializedShapes);

                    const data = await fetch("/generate-snippet", {
                      method: "POST",
                      body: JSON.stringify({
                        serializedShapes,
                      }),
                      headers: {
                        "Content-Type": "application/json",
                      },
                    });

                    const json = await data.json();

                    const code = json.html!.choices[0]!.message!.content!;
                    console.log("code", code);

                    setOutput(code);

                    console.log("data", data);
                  }}
                >
                  Generate snippet ✨
                </Button>
              </div>
            </div>
            <div className="bg-gray-1 border-gray-3 flex-1 overflow-auto border border-l">
              <Editor
                value={output}
                onValueChange={(code) => setCode(code)}
                highlight={(code) =>
                  Prism.highlight(code, Prism.languages.js, "javascript")
                }
                padding={10}
                className="bg-gray-1 border-gray-2 flex-1 rounded-sm border"
                style={{
                  fontFamily: '"Office Code Pro", "Fira Mono", monospace',
                  fontSize: 12,
                }}
                readOnly
              />
            </div>
          </div>
        </Inset>
      </Dialog.Content>
    </Dialog.Root>
  );
};
