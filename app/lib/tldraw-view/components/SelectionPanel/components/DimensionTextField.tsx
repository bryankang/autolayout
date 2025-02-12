import { CaretDown, Check } from "@phosphor-icons/react";
import { FC, useState } from "react";
import { DropdownMenu, TextField } from "~/lib/radix-themes";
import { cn } from "~/styles/utils";

export type DimensionTextFieldProps = TextField.RootProps & {
  dimension: "width" | "height";
  className?: string;
};

export const DimensionTextField: FC<DimensionTextFieldProps> = ({
  dimension,
  className,
  ...rest
}) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <TextField.Root {...rest} size="1" variant="soft" className="group">
      <TextField.Slot>
        <div className="text-gray-10 pl-0.5 text-[11px]">
          {dimension === "width" ? "w" : "h"}
        </div>
      </TextField.Slot>
      <TextField.Slot className="pr-0.5">
        <DropdownMenu.Root open={menuOpen} onOpenChange={setMenuOpen}>
          <DropdownMenu.Trigger className="">
            <div className="text-gray-12 relative p-0.5">
              <CaretDown
                size={10}
                weight="regular"
                className={cn(
                  "text-gray-12 opacity-0 group-hover:opacity-100",
                  menuOpen && "opacity-100",
                )}
              />
              <div
                className={cn(
                  "absolute top-[50%] right-0 translate-y-[-50%] text-[11px] group-hover:opacity-0",
                  menuOpen && "opacity-0",
                )}
              >
                Full
              </div>
            </div>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content
            size="1"
            variant="solid"
            align="start"
            alignOffset={-74}
            side="bottom"
            sideOffset={8}
            className="w-[160px]"
          >
            <DropdownMenu.Item shortcut="⌘ E" className="group">
              <div className="flex items-center gap-2">
                <Check
                  size={12}
                  className="text-accent-12 group-hover:text-accent-contrast"
                />
                {dimension === "width" ? "Fixed width" : "Fixed height"}
              </div>
            </DropdownMenu.Item>
            <DropdownMenu.Item shortcut="⌘ D" className="group">
              <div className="flex items-center gap-2">
                <Check
                  size={12}
                  className={cn(
                    "text-accent-12 group-hover:text-accent-1 opacity-0",
                  )}
                />
                {dimension === "width" ? "Full width" : "Full height"}
              </div>
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </TextField.Slot>
    </TextField.Root>
  );
};
