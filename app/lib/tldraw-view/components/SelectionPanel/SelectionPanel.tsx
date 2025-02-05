export type SelectionPanelProps = {};

export const SelectionPanel = () => {
  return (
    <div className="absolute top-0 right-0 bottom-0 left-0 z-50 overflow-y-auto border-l border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex h-full w-full flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Selection</h2>
        </div>
        <div className="flex flex-col gap-4"></div>
      </div>
    </div>
  );
};
