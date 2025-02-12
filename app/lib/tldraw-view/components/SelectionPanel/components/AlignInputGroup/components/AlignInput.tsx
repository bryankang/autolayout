import { FC } from "react";
import { cn } from "~/styles/utils";

export type AlignInputProps = {
  active: boolean;
  onActiveChange: (active: boolean) => void;
  disabled?: boolean;
  className?: string;
};

export const AlignInput: FC<AlignInputProps> = ({
  active,
  onActiveChange,
  disabled,
  className,
}) => {
  return (
    <button
      onClick={() => onActiveChange(!active)}
      disabled={disabled}
      className={cn([
        "group hover:bg-gray-3 flex h-full w-full flex-none items-center justify-center border-0",
        className,
      ])}
    >
      <div
        className={cn([
          "bg-gray-4 size-1 flex-none rounded-full",
          active && "bg-accent-8 h-[8px] w-[8px] rounded-xs",
        ])}
      />
    </button>
  );
};
