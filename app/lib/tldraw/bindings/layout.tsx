import { BindingUtil, IndexKey, TLBaseBinding } from "tldraw";

export type LayoutBinding = TLBaseBinding<
  "layout",
  {
    index: IndexKey;
  }
>;

export class LayoutBindingUtil extends BindingUtil<LayoutBinding> {
  static override type = "layout" as const;

  override getDefaultProps() {
    return {
      index: "a1" as IndexKey,
    };
  }
}
