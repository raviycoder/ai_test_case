import BreadcrumbComp from "@/components/breadcrumb-comp";
import { DeleteAlert } from "@/components/delete-alert";
import TestGenerationPanel from "@/components/test-generation-panel";
import { CodeBlock } from "@/components/ui/code-block";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Skeleton } from "@/components/ui/skeleton";
import useAITestGeneration from "@/hooks/use-ai-test-generation";
import { useFileContent } from "@/hooks/use-git-repo";
import { IconInfoCircle } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";

const FilesDashboard = () => {
  const [searchParams] = useSearchParams();
  const [deletedFiles, setDeletedFiles] = useState<string>("");
  const params = useParams();
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

  const { session, error, testFilePaths, getTestFilePaths, deleteTestFile } =
    useAITestGeneration({
      onError: (error) => {
        console.log("Error:", error);
      },
    });

  useEffect(() => {
    if (params.sessionId && query.repo && query.owner) {
      getTestFilePaths(params.sessionId, `${query.owner}%2F${query.repo}`);
    }
  }, [
    session,
    error,
    testFilePaths,
    query.repo,
    query.owner,
    getTestFilePaths,
    params.sessionId,
  ]);

  const decodedContent = content?.content ? atob(content.content) : "";
  if (!query.repo || !query.owner || !query.path) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <IconInfoCircle className="w-12 h-12 text-gray-400 mb-4" />
        <h2 className="text-2xl font-semibold mb-2">No Repository Selected</h2>
        <p className="text-gray-500">
          Please select a repository, owner, and file to view its content and
          generate tests.
        </p>
      </div>
    );
  }

  if (isLoading)
    return (
      <div className="max-w-full h-full">
        <div className=" ">
          <ResizablePanelGroup
            direction="horizontal"
            className="max-w-md md:min-w-full"
          >
            <ResizablePanel defaultSize={50} minSize={30} className="p-8">
              <Skeleton className="h-[600px] w-full mt-12 bg-gray-200" />
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={50} minSize={30} className="p-8">
              <Skeleton className="h-[600px] w-full mt-12 bg-gray-200" />
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </div>
    );
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
                <BreadcrumbComp filePath={query.path} />
                {deletedFiles !== query.path && testFilePaths.includes(query.path) && (
                  <DeleteAlert
                    title="Delete Test File"
                    description={`Are you sure you want to delete the generated test file for ${query.path}? This action cannot be undone.`}
                    onDelete={() => {
                      deleteTestFile(params.sessionId as string, query.path);
                      setDeletedFiles(query.path);
                    }}
                    triggerText={"Delete Test File"}
                    triggerVariant="destructive"
                  />
                )}
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
                {deletedFiles !== query.path ? (
                  <TestGenerationPanel
                    selectedFiles={[query.path]}
                    repositoryId={`${query.owner}/${query.repo}`}
                    owner={query.owner}
                    repo={query.repo}
                  />
                ) : (
                  <p>This file is deleted</p>
                )}
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      )}
    </div>
  );
};

export default FilesDashboard;
