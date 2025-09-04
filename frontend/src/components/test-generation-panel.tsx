import React, { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { XCircle } from "lucide-react";
import { fetchFileContent } from "../lib/apis/ai-test-api";
import type { GeneratedTest, TestFileDto } from "../lib/apis/ai-test-api";
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import useAITestGeneration from "../hooks/use-ai-test-generation";
import useRealtimeTestGeneration from "@/hooks/use-realtime-test-generation";
import {
  TestGenerationForm,
  TestGenerationProgress,
  TestResultsTabs,
} from "./test-generation";
import { Skeleton } from "./ui/skeleton";

interface TestGenerationPanelProps {
  selectedFiles: string[];
  repositoryId: string;
  owner: string;
  repo: string;
  onComplete?: (tests: GeneratedTest[]) => void;
}

const TestGenerationPanel: React.FC<TestGenerationPanelProps> = ({
  selectedFiles,
  repositoryId,
  owner,
  repo,
  onComplete,
}) => {
  const [framework, setFramework] = useState("jest");
  const [fileContents, setFileContents] = useState<Record<string, string>>({});
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [specificTestFile, setSpecificTestFile] = useState<TestFileDto | null>(
    null
  );
  const params = useParams();
  const routeSessionId = params.sessionId;

  // Background test generation hook
  const {
    isGenerating,
    error: backgroundError,
    progress: backgroundProgress,
    currentStep: backgroundStep,
    currentMessage: backgroundMessage,
    generatedTest: backgroundGeneratedTest,
    startBackgroundGeneration,
    stopGeneration: stopBackgroundGeneration,
    reset: resetBackground,
  } = useRealtimeTestGeneration({
    onProgress: (update) => {
      console.log("🔄 Background progress:", update);
    },
    onComplete: (result) => {
      console.log("✅ Background generation completed:", result);
      if (result.generatedTests) {
        onComplete?.(result.generatedTests);
      }
    },
    onError: (error) => {
      console.error("❌ Background generation error:", error);
    },
  });
  console.log("📄 Background generated tests:", backgroundGeneratedTest);

  // Original synchronous generation hook
  const {
    error,
    testFile,
    generatedTests,
    startGeneration,
    getTestFileByPath,
    getTestFilePaths,
    hydrateSession,
  } = useAITestGeneration({
    onUpdate: (update) => {
      console.log("🔄 Sync progress:", update);
    },
    onComplete: (result) => {
      onComplete?.(result.generatedTests);
    },
    onError: (err) => {
      console.error(err);
    },
  });
  const [searchParams] = useSearchParams();

  // Read query params like: new-session?repo=ai_test_case&_branch=main&_owner=raviycoder
  const query = {
    sessionId: searchParams.get("sessionId") ?? "",
    repo: searchParams.get("repo") ?? "",
    branch: searchParams.get("_branch") ?? "",
    owner: searchParams.get("_owner") ?? "",
    filePath: searchParams.get("_file") ?? "",
  };
  const navigate = useNavigate();
  const location = useLocation();
  const repoBranch = searchParams.get("_branch") || "main";
  const filePath = searchParams.get("_file");
  // const [isLoadingSaved, setIsLoadingSaved] = useState(false);

  // Load file contents when files are selected
  useEffect(() => {
    // If there is a sessionId in the URL, hydrate the hook with it so we reuse existing sessions
    if (routeSessionId && routeSessionId !== "new-session") {
      hydrateSession(routeSessionId);
    }

    console.log("👋👋🤪 Hydrating session:", backgroundProgress);
  }, [routeSessionId, hydrateSession, backgroundProgress]);

  // Load file contents when files are selected
  useEffect(() => {
    const loadFileContents = async () => {
      if (selectedFiles.length === 0) return;

      setIsLoadingFiles(true);
      const contents: Record<string, string> = {};

      try {
        for (const filePath of selectedFiles) {
          try {
            const content = await fetchFileContent(owner, repo, filePath);
            contents[filePath] = content;
          } catch (err) {
            console.warn(`Failed to load content for ${filePath}:`, err);
            contents[filePath] = "// Failed to load file content";
          }
        }
        setFileContents(contents);
      } catch (err) {
        console.error("Error loading file contents:", err);
      } finally {
        setIsLoadingFiles(false);
      }
    };

    loadFileContents();
  }, [selectedFiles, owner, repo]);
  // On reload: fetch previously generated tests from DB by file path(s)
  useEffect(() => {
    const fetchSavedTests = async () => {
      console.log("🔍 Fetching saved tests step 1:", {
        selectedFiles: selectedFiles.length,
        isGenerating,
        generatedTestsLength: generatedTests.length,
        filePath,
        routeSessionId,
        specificTestFile: !!specificTestFile,
        backgroundGeneratedTest: !!backgroundGeneratedTest,
      });

      // Early returns to prevent unnecessary API calls
      if (selectedFiles.length === 0) return;
      if (isGenerating) return;
      if (generatedTests.length > 0) return;
      if (backgroundGeneratedTest !== null) return;
      if (specificTestFile !== null) return; // Already have data

      // Only fetch if we have both filePath and sessionId
      if (filePath && routeSessionId && routeSessionId !== "new-session") {
        try {
          console.log(
            "🔍 Fetching saved tests step 2: calling getTestFileByPath"
          );
          await getTestFileByPath(filePath, routeSessionId);

          if (testFile) {
            console.log(
              "🔍 Fetching saved tests step 3: found test file data",
              testFile
            );

            // Set the fetched test file directly since getTestFileByPath returns TestFileDto
            setSpecificTestFile(testFile);
            console.log(
              "🔍 Fetching saved tests step 4: set specificTestFile state"
            );
          } else {
            console.log(
              "🔍 Fetching saved tests: no test file found, waiting for realtime data"
            );
            // If no existing test file, wait for realtime generation
            // backgroundGeneratedTest will be set by the realtime hook when data arrives
          }
        } catch (error) {
          console.error("🔍 Fetching saved tests error:", error);
          // On error, also wait for realtime data as fallback
        }
      }
    };

    // Only run if we don't already have data
    if (!specificTestFile && !backgroundGeneratedTest) {
      fetchSavedTests();
      getTestFilePaths(
        query.sessionId as string,
        `${query.owner}%2F${query.repo}`
      );
    }
  }, [
    selectedFiles.length,
    isGenerating,
    generatedTests.length,
    filePath,
    routeSessionId,
    getTestFileByPath,
    specificTestFile,
    backgroundGeneratedTest,
    testFile,
    getTestFilePaths,
    query.owner,
    query.repo,
    query.sessionId,
  ]);

  // Handle realtime data fallback when no existing data found
  useEffect(() => {
    if (!specificTestFile && backgroundGeneratedTest) {
      console.log("🔄 Using realtime data as fallback");
      // backgroundGeneratedTest is GeneratedTest, not TestFileDto
      // We should pass it to TestResultsTabs as generatedTests instead of specificTestFile
      // For now, we'll leave specificTestFile as null and let generatedTests handle it
    }
  }, [backgroundGeneratedTest, specificTestFile]);
  const handleStartGeneration = async () => {
    if (selectedFiles.length === 0) return;

    // Get the session ID from route params or generate a new one
    // Note: No session creation/saving here - Inngest backend handles everything
    let activeSessionId = routeSessionId;
    if (!activeSessionId || activeSessionId === "new-session") {
      const newId = globalThis.crypto?.randomUUID
        ? globalThis.crypto.randomUUID()
        : `sess_${Date.now()}`;

      // Update URL with new session ID
      const search = location.search || window.location.search || "";
      navigate(`/file-test-case/${newId}${search}`, { replace: true });
      activeSessionId = newId;
    }

    // Prepare the files data exactly as expected by Inngest backend
    const files = selectedFiles.map((path) => ({
      path,
      content: fileContents[path] || "",
      framework,
    }));

    const options = {
      testTypes: ["unit", "integration"],
      coverage: "comprehensive" as const,
      includeEdgeCases: true,
      mockExternal: true,
    };

    if (isGenerating === false) {
      // Send data to Inngest backend - it handles session creation and data saving
      try {
        await startBackgroundGeneration({
          repositoryId,
          sessionId: activeSessionId,
          files,
          framework,
          repoBranch,
          options,
        });
      } catch (error) {
        console.error("Failed to start background generation:", error);
      }
    } else {
      // Fallback to synchronous generation
      await startGeneration({
        files,
        framework,
        options,
      });
    }
  };

  const reset = () => {
    if (isGenerating) {
      resetBackground();
    }
    // Reset for sync generation if needed
    console.log("Reset called");
  };

  // Show loading skeleton only when:
  // 1. Still loading file contents, OR
  // 2. Waiting for a specific test file from URL params AND no data is available yet
  const isLoadingInitialData =
    isLoadingFiles ||
    (!!filePath &&
      !!routeSessionId &&
      !specificTestFile &&
      !isGenerating &&
      !isGenerating);

  // Check if we have any data to display (tests, errors, or generation in progress)
  const hasDataToDisplay =
    generatedTests.length === 0 ||
    backgroundGeneratedTest !== null ||
    specificTestFile ||
    error ||
    backgroundError ||
    isGenerating ||
    isGenerating;

  // Only show skeleton if we're loading initial data AND don't have any data to display
  // This prevents showing skeleton when user has results, errors, or generation is active
  if (isLoadingInitialData && !hasDataToDisplay) {
    return <Skeleton className="h-[600px] w-full mt-12 bg-gray-200" />;
  }

  return (
    <div className="w-full">
      {/* Header */}
      {generatedTests.length <= 0 &&
        backgroundGeneratedTest === null &&
        !specificTestFile && (
          <>
            {!isGenerating && (
              <TestGenerationForm
                framework={framework}
                onFrameworkChange={setFramework}
                selectedFiles={selectedFiles}
                fileContents={fileContents}
                isLoadingFiles={isLoadingFiles}
                isGenerating={isGenerating}
                isBackgroundGenerating={isGenerating}
                onStartGeneration={handleStartGeneration}
                onStopGeneration={stopBackgroundGeneration}
                onReset={reset}
                hasResults={
                  generatedTests.length > 0 || backgroundGeneratedTest !== null
                }
                hasError={!!(error || backgroundError)}
              />
            )}

            <TestGenerationProgress
              isGenerating={isGenerating}
              progress={backgroundProgress}
              currentStep={backgroundStep}
              currentMessage={backgroundMessage}
              sessionId={routeSessionId || undefined}
              filePath={filePath || undefined}
            />
          </>
        )}
      {(error || backgroundError) && (
        <Alert className="border-red-200 bg-red-50">
          <XCircle className="h-4 w-4 text-red-500" />
          <AlertDescription className="text-red-700">
            {error || backgroundError}
          </AlertDescription>
        </Alert>
      )}

      {/* Generated Tests */}
      {(generatedTests.length > 0 ||
        backgroundGeneratedTest !== null ||
        specificTestFile) && (
        <TestResultsTabs
          generatedTests={
            backgroundGeneratedTest && !specificTestFile
              ? [backgroundGeneratedTest, ...generatedTests]
              : generatedTests
          }
          specificTestFile={specificTestFile}
          testFile={
            testFile
              ? {
                  testCode: testFile.testCode,
                  suggestedTestFileName: testFile.suggestedTestFileName,
                }
              : undefined
          }
        />
      )}
    </div>
  );
};

export default TestGenerationPanel;
