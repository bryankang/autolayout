import { BindingUtil, TLBaseBinding } from "tldraw";

export type LayoutBinding = TLBaseBinding<"layout", {}>;

export class LayoutBindingUtil extends BindingUtil<LayoutBinding> {
  static override type = "layout" as const;

  override getDefaultProps() {
    return {};
  }
}
