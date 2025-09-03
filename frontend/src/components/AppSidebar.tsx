import {
  useParams,
  useSearchParams,
} from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import TreeFile from "@/components/tree-file";
import { useRepoTree } from "@/hooks/useGitRepo";
import { useEffect, useMemo } from "react";
import { FolderTree } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";
import useAITestGeneration from "@/hooks/useAITestGeneration";

const AppSidebar: React.FC = () => {
  const { sessionId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  // Read query params like: new-session?repo=ai_test_case&_branch=main&_owner=raviycoder
  const query = {
    sessionId: searchParams.get("sessionId") ?? "",
    repo: searchParams.get("repo") ?? "",
    branch: searchParams.get("_branch") ?? "",
    owner: searchParams.get("_owner") ?? "",
  };

  console.log("route:", { sessionId });
  console.log("new-session query:", query);

  const { testFilePaths, getTestFilePaths } = useAITestGeneration();

  useEffect(()=>{
    if (sessionId !== "new-session"){
      getTestFilePaths(sessionId as string, `${query.owner}%2F${query.repo}`);
      console.log("Fetching test file paths for session:", testFilePaths);
    }
  });

  const { tree } = useRepoTree(query.owner, query.repo, query.branch || "main");

  // Transform GitHub tree response to TreeFile items shape
  const items = useMemo(() => {
    // Expected structure: tree?.tree?.tree is the array of entries
    const entries: Array<{ path: string; type: string }> =
      (tree?.tree?.tree as Array<{ path: string; type: string }>) || [];

    if (!query.repo || entries.length === 0)
      return undefined as unknown as Record<
        string,
        { name: string; children?: string[] }
      >;

    const out: Record<string, { name: string; children?: string[] }> = {};

    const ensureNode = (id: string, name: string) => {
      if (!out[id]) out[id] = { name };
      return out[id];
    };

    // Root node represents the repository
    ensureNode(query.repo, query.repo).children =
      ensureNode(query.repo, query.repo).children || [];

    for (const entry of entries) {
      const parts = entry.path.split("/").filter(Boolean);
      let parentId = query.repo;
      for (let i = 0; i < parts.length; i++) {
        const seg = parts[i];
        const id = parts.slice(0, i + 1).join("/");
        const node = ensureNode(id, seg);
        if (i < parts.length - 1) {
          node.children = node.children || [];
        }
        const parent = ensureNode(
          parentId,
          i === 0 ? query.repo : parts[i - 1]
        );
        parent.children = parent.children || [];
        if (!parent.children.includes(id)) parent.children.push(id);
        parentId = id;
      }
    }

    return out;
  }, [tree, query.repo]);

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1">
          <FolderTree className="w-5 h-5" />
          <span className="font-semibold">AI Test App</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Repository Files tree */}
        {query.owner && query.repo ? (
          <SidebarGroup className="overflow-hidden">
            <SidebarGroupLabel>Repository Files</SidebarGroupLabel>
            <SidebarGroupContent>
              {items ? (
                <ScrollArea className="max-h-[80vh] overflow-auto">
                    <TreeFile
                      items={items}
                      rootItemId={query.repo}
                      testFiles={testFilePaths as string[]}
                      initialExpandedItems={[query.repo]}
                      setSearchParams={setSearchParams}
                      searchParams={searchParams}
                      className=""
                    />
                </ScrollArea>
              ) : (
                <div className="text-xs text-muted-foreground px-2 py-1">
                  Loading tree…
                </div>
              )}
            </SidebarGroupContent>
          </SidebarGroup>
        ) : null}
      </SidebarContent>

      <SidebarSeparator />

      <SidebarFooter>
        <div className="px-2 text-xs text-muted-foreground">v1.0</div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
