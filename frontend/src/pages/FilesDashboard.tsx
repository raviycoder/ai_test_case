import TestGenerationPanel from "@/components/TestGenerationPanel";
import { CodeBlock } from "@/components/ui/code-block";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import useAITestGeneration from "@/hooks/useAITestGeneration";
import { useFileContent } from "@/hooks/useGitRepo";
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

const FilesDashboard = () => {
  const [searchParams] = useSearchParams();
  const query = {
    repo: searchParams.get("repo") ?? "",
    branch: searchParams.get("_branch") ?? "",
    owner: searchParams.get("_owner") ?? "",
    path: searchParams.get("_file") ?? "",
  };

  const { content, isLoading } = useFileContent(
    query.owner,
    query.repo,
    query.path
  );

  const { session, error } = useAITestGeneration({
    onError: (error) => {
      console.log("Error:", error);
    },
  });

  useEffect(() => {
    console.log("data", session, error);
  }, [session, error]);


  const decodedContent = content?.content ? atob(content.content) : "";
  return (
    <div className="max-w-full h-full">
      <code>{error}</code>
      {!isLoading && content && (
        <div className=" ">
          <ResizablePanelGroup
            direction="horizontal"
            className="max-w-md md:min-w-full"
          >
            <ResizablePanel defaultSize={50} minSize={30}>
              <div className="flex items-center justify-between p-4 border-b">
                <h1 className="text-lg font-semibold">Files Dashboard</h1>
              </div>
              <div className=" h-full px-6 py-2">
                <CodeBlock
                  language={content?.name?.split(".").pop()}
                  filename={content?.name}
                  code={decodedContent}
                />
              </div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={50} minSize={30}>
              <div className="flex h-full items-start justify-center p-6">
                {" "}
                <TestGenerationPanel
                  selectedFiles={[query.path]}
                  repositoryId={`${query.owner}/${query.repo}`}
                  owner={query.owner}
                  repo={query.repo}
                />
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      )}
    </div>
  );
};

export default FilesDashboard;
