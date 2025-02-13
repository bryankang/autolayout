import { CaretDown, Check } from "@phosphor-icons/react";
import { FC, useEffect, useState } from "react";
import { DropdownMenu, TextField } from "~/lib/radix-themes";
import { cn } from "~/styles/utils";

export type DimensionTextFieldProps = TextField.RootProps & {
  dimension: "width" | "height";
  full?: boolean;
  className?: string;
  onValueChange: (value: number) => void;
  onFullChange: (full: boolean) => void;
};

export const DimensionTextField: FC<DimensionTextFieldProps> = ({
  dimension,
  full,
  value,
  className,
  onValueChange,
  onFullChange,
  ...rest
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [internalValue, setInternalValue] = useState(value);

  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  const handleChange = (e) => {
    // Update internal state without calling onValueChange
    setInternalValue(e.target.value);
  };

  const commitValue = () => {
    if (typeof internalValue === "number") {
      onValueChange(internalValue);
      return;
    }

    const numValue = parseFloat(internalValue ?? "");
    if (!isNaN(numValue) && numValue.toString() === internalValue) {
      if (numValue !== value) {
        onValueChange(numValue);
      }
    } else {
      // Invalid number - reset to prop value
      setInternalValue(value?.toString() ?? "");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      commitValue();
    }
  };

  const handleBlur = () => {
    commitValue();
  };

  return (
    <TextField.Root
      {...rest}
      size="1"
      variant="soft"
      className="group"
      value={internalValue}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
    >
      <TextField.Slot>
        <div className="text-gray-10 pl-0.5 text-[11px]">
          {dimension === "width" ? "w" : "h"}
        </div>
      </TextField.Slot>
      <TextField.Slot className="pr-0.5">
        <DropdownMenu.Root
          open={menuOpen}
          onOpenChange={(open) => {
            if (rest.disabled) return;
            setMenuOpen(open);
          }}
        >
          <DropdownMenu.Trigger className="">
            <div className="text-gray-12 relative p-0.5">
              <CaretDown
                size={10}
                weight="regular"
                className={cn(
                  "text-gray-12 opacity-0 group-hover:opacity-100",
                  menuOpen && "opacity-100",
                  rest.disabled && "group-hover:opacity-0",
                )}
              />
              {full && (
                <div
                  className={cn(
                    "absolute top-[50%] right-0 translate-y-[-50%] text-[10px] group-hover:opacity-0",
                    menuOpen && "opacity-0",
                  )}
                >
                  full
                </div>
              )}
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
            <DropdownMenu.Item
              className="group"
              onClick={() => {
                onFullChange(false);
                setMenuOpen(false);
              }}
            >
              <div className="flex items-center gap-2">
                <Check
                  size={12}
                  className="text-accent-12 group-hover:text-accent-contrast"
                />
                {dimension === "width" ? "Fixed width" : "Fixed height"}
              </div>
            </DropdownMenu.Item>
            <DropdownMenu.Item
              className="group"
              onClick={() => {
                onFullChange(true);
                setMenuOpen(false);
              }}
            >
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
