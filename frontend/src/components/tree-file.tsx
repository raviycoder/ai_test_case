import { hotkeysCoreFeature, syncDataLoaderFeature } from "@headless-tree/core";
import { useTree } from "@headless-tree/react";
import { FileIcon, FolderIcon, FolderOpenIcon } from "lucide-react";

import { Tree, TreeItem, TreeItemLabel } from "@/components/ui/tree";
import { Badge } from "./ui/badge";

export interface Item {
  name: string;
  children?: string[];
}

export interface TreeFileProps {
  items: Record<string, Item>;
  testFiles: string[];
  rootItemId: string;
  initialExpandedItems?: string[];
  setSearchParams: (params: URLSearchParams | ((prev: URLSearchParams) => URLSearchParams)) => void;
  searchParams?: URLSearchParams;
  indent?: number;
  className?: string;
}

const DEFAULT_INDENT = 20;

export default function TreeFile({
  items,
  testFiles,
  rootItemId,
  initialExpandedItems = [rootItemId],
  indent = DEFAULT_INDENT,
  setSearchParams,
  searchParams,
  className,
}: TreeFileProps) {
  const tree = useTree<Item>({
    initialState: {
      expandedItems: initialExpandedItems,
    },
    indent,
    rootItemId,
    getItemName: (item) => item.getItemData().name,
    isItemFolder: (item) => (item.getItemData()?.children?.length ?? 0) > 0,
    dataLoader: {
      getItem: (itemId) => items[itemId],
      getChildren: (itemId) => {
        const children = items[itemId]?.children ?? [];
        // Sort children alphabetically to fix reverse order issue
        return children.sort((a, b) => {
          const itemA = items[a];
          const itemB = items[b];
          if (!itemA || !itemB) return 0;

          // Folders first, then files
          const aIsFolder = (itemA.children?.length ?? 0) > 0;
          const bIsFolder = (itemB.children?.length ?? 0) > 0;

          if (aIsFolder && !bIsFolder) return -1;
          if (!aIsFolder && bIsFolder) return 1;

          // Within same type, sort alphabetically
          return itemA.name.localeCompare(itemB.name);
        });
      },
    },
    features: [syncDataLoaderFeature, hotkeysCoreFeature],
  });

  const addFilePath = (filepath: string) => {
    setSearchParams((prevParams: URLSearchParams) => {
      const newParams = new URLSearchParams(prevParams);
      newParams.set("_file", filepath);
      return newParams;
    });
  };

  return (
    <div
      className={`flex h-full flex-col gap-2 *:first:grow ${className ?? ""}`}
    >
      <div>
        <Tree
          className="relative before:absolute before:inset-0 before:-ms-1 before:bg-[repeating-linear-gradient(to_right,transparent_0,transparent_calc(var(--tree-indent)-1px),var(--border)_calc(var(--tree-indent)-1px),var(--border)_calc(var(--tree-indent)))]"
          indent={indent}
          tree={tree}
        >
            {tree.getItems().map((item) => {
            return (
              <TreeItem key={item.getId()} item={item}>
              <TreeItemLabel className={`before:bg-background relative before:absolute before:inset-x-0 before:-inset-y-0.5 before:-z-10 ${searchParams?.get("_file") === item.getId() ? "font-semibold bg-muted" : ""}`}>
                <span className="flex items-center gap-2">
                {item.isFolder() ? (
                  item.isExpanded() ? (
                  <FolderOpenIcon className="text-muted-foreground pointer-events-none size-4" />
                  ) : (
                  <FolderIcon className="text-muted-foreground pointer-events-none size-4" />
                  )
                ) : (
                  <FileIcon className="text-muted-foreground pointer-events-none size-4" />
                )}
                {!item.isFolder() ? (
                  <span
                  className="cursor-pointer hover:underline"
                  onClick={() => addFilePath(item.getId())}
                  >
                  {item.getItemName()}
                  </span>
                ) : (
                  item.getItemName()
                )}
                {testFiles.includes(item.getId()) && (
                  <Badge variant="default" className="text-xs bg-amber-500/80 p-1 hover:bg-amber-500/80">test</Badge>
                )}
                </span>
              </TreeItemLabel>
              </TreeItem>
            );
            })}
        </Tree>
      </div>
    </div>
  );
}
