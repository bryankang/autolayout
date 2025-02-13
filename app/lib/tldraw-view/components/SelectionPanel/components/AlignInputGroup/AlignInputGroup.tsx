import { FC } from "react";
import { AlignInput } from "./components/AlignInput";
import { cn } from "~/styles/utils";

export type AlignInputGroupProps = {
  value?: { alignX: string; alignY: string };
  onValueChange: (align: { alignX: string; alignY: string }) => void;
  className?: string;
};

export const AlignInputGroup: FC<AlignInputGroupProps> = ({
  value,
  onValueChange,
  className,
}) => {
  return (
    <div
      className={cn([
        "bg-gray-2 grid h-[56px] grid-flow-row grid-cols-3 grid-rows-3 items-center justify-items-center gap-1 rounded-xs p-1",
        className,
      ])}
    >
      <AlignInput
        active={value?.alignX === "left" && value?.alignY === "top"}
        onActiveChange={() => onValueChange({ alignX: "left", alignY: "top" })}
        disabled={!value}
      />
      <AlignInput
        active={value?.alignX === "center" && value?.alignY === "top"}
        onActiveChange={() =>
          onValueChange({ alignX: "center", alignY: "top" })
        }
        disabled={!value}
      />
      <AlignInput
        active={value?.alignX === "right" && value?.alignY === "top"}
        onActiveChange={() => onValueChange({ alignX: "right", alignY: "top" })}
        disabled={!value}
      />
      <AlignInput
        active={value?.alignX === "left" && value?.alignY === "center"}
        onActiveChange={() =>
          onValueChange({ alignX: "left", alignY: "center" })
        }
        disabled={!value}
      />
      <AlignInput
        active={value?.alignX === "center" && value?.alignY === "center"}
        onActiveChange={() =>
          onValueChange({ alignX: "center", alignY: "center" })
        }
        disabled={!value}
      />
      <AlignInput
        active={value?.alignX === "right" && value?.alignY === "center"}
        onActiveChange={() =>
          onValueChange({ alignX: "right", alignY: "center" })
        }
        disabled={!value}
      />
      <AlignInput
        active={value?.alignX === "left" && value?.alignY === "bottom"}
        onActiveChange={() =>
          onValueChange({ alignX: "left", alignY: "bottom" })
        }
        disabled={!value}
      />
      <AlignInput
        active={value?.alignX === "center" && value?.alignY === "bottom"}
        onActiveChange={() =>
          onValueChange({ alignX: "center", alignY: "bottom" })
        }
        disabled={!value}
      />
      <AlignInput
        active={value?.alignX === "right" && value?.alignY === "bottom"}
        onActiveChange={() =>
          onValueChange({ alignX: "right", alignY: "bottom" })
        }
        disabled={!value}
      />
    </div>
  );
};
