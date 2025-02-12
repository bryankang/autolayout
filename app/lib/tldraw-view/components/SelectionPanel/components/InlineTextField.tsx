import { FC } from "react";
import { TextField } from "~/lib/radix-themes";

export type InlineTextFieldProps = TextField.RootProps & {
  label: string;
  className?: string;
};

export const InlineTextField: FC<InlineTextFieldProps> = ({
  className,
  label,
  ...rest
}) => {
  return (
    <TextField.Root {...rest} size="1" variant="soft" className="group">
      <TextField.Slot>
        <div className="text-gray-10 pl-0.5 text-[11px]">{label}</div>
      </TextField.Slot>
    </TextField.Root>
  );
};
