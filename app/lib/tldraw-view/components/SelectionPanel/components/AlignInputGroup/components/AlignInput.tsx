import { FC } from "react";
import { cn } from "~/lib/utils";

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
        "group flex h-5 w-full flex-none items-center justify-center border-0 hover:bg-slate-100",
        className,
      ])}
    >
      <div
        className={cn([
          "size-0.5 flex-none rounded-full bg-slate-400",
          active && "h-full w-full rounded-xs bg-slate-200",
        ])}
      />
    </button>
  );
};
