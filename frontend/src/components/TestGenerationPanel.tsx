import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  Play,
  CheckCircle,
  XCircle,
  FileText,
  Code,
  AlertTriangle,
} from "lucide-react";
import { fetchFileContent } from "../lib/ai-test-api";
import type { GenerationUpdate, GeneratedTest, TestFileDto } from "../lib/ai-test-api";
import { CodeBlock } from "./ui/code-block";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import useAITestGeneration from "../hooks/useAITestGeneration";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  const [updates, setUpdates] = useState<GenerationUpdate[]>([]);
  const [fileContents, setFileContents] = useState<Record<string, string>>({});
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [specificTestFile, setSpecificTestFile] = useState<TestFileDto | null>(null);
  const params = useParams();
  const routeSessionId = params.sessionId;
  const {
    isGenerating,
    error,
    testFile,
    generatedTests,
    progress,
    currentStep,
    createSession,
    startGeneration,
    getTestFileByPath,
  hydrateSession,
  } = useAITestGeneration({
    onUpdate: (update) => {
      setUpdates((prev) => [...prev.slice(-10), update]);
    },
    onComplete: (result) => {
      onComplete?.(result.generatedTests);
    },
    onError: (err) => {
      console.error(err);
    },
  });
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(
    location.search || window.location.search
  );
  const repoBranch = searchParams.get("_branch") || "main";
  const filePath = searchParams.get("_file");
  // const [isLoadingSaved, setIsLoadingSaved] = useState(false);

  // Load file contents when files are selected
  useEffect(() => {
    // If there is a sessionId in the URL, hydrate the hook with it so we reuse existing sessions
    if (routeSessionId && routeSessionId !== 'new-session') {
      hydrateSession(routeSessionId);
    }
  }, [routeSessionId, hydrateSession]);

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
        routeSessionId
      });

      if (selectedFiles.length === 0) return;
      if (isGenerating) return;
      if (generatedTests.length > 0) return;
      
  if (filePath && routeSessionId) {
        try {
       await getTestFileByPath(filePath, routeSessionId);
       const testFileData = testFile as TestFileDto | null;

       console.log("🔍 Fetching saved tests step 3: found test file data", testFileData);

          if (testFileData) {
            // Transform the TestFileDto to the structure you specified
            const formattedTestFile = {
              sessionId: testFileData.data.sessionId,
              id: testFileData.data.id,
              originalFilePath: testFileData.data.originalFilePath,
              testFilePath: testFileData.data.testFilePath,
              suggestedTestFileName: testFileData.data.suggestedTestFileName,
              testCode: testFileData.data.testCode,
              summary: testFileData.data.summary,
              validation: testFileData.data.validation,
              metadata: testFileData.data.metadata,
              status: testFileData.data.status,
              validationSummary: testFileData.data.validationSummary,
              coverageScore: testFileData.data.coverageScore,
            };
            
            console.log("🔍 Fetching saved tests step 4: formatted test file", testFile);
            setSpecificTestFile(formattedTestFile);
            console.log("🔍 Fetching saved tests step 5: set specificTestFile state");
          } else {
            console.log("🔍 Fetching saved tests step 4: no test file data found");
          }
        } catch (error) {
          console.error("🔍 Fetching saved tests error:", error);
        }
      }
    };
    fetchSavedTests();
  }, [
    selectedFiles,
    isGenerating,
    generatedTests.length,
    getTestFileByPath,
    routeSessionId,
    filePath,
    testFile,
  ]);
  const handleStartGeneration = async () => {
    if (selectedFiles.length === 0) return;
    // Ensure a session exists; if route is 'new-session', create one and update URL
    let activeSessionId = routeSessionId;
  if (!activeSessionId || activeSessionId === "new-session") {
      const newId = globalThis.crypto?.randomUUID
        ? globalThis.crypto.randomUUID()
        : `sess_${Date.now()}`;
      await createSession(repositoryId, newId, repoBranch, framework);
      const search = location.search || window.location.search || "";
      navigate(`/file-test-case/${newId}${search}`, { replace: true });
      activeSessionId = newId;
    }

    const files = selectedFiles.map((path) => ({
      path,
      content: fileContents[path] || "",
      framework,
    }));
  await startGeneration({
      files,
      framework,
      options: {
        testTypes: ["unit", "integration"],
        coverage: "comprehensive",
        includeEdgeCases: true,
        mockExternal: true,
      },
    });
  };

  const reset = () => {
    setUpdates([]);
  };

  return (
    <div className="w-full">
      {/* Header */}
      {generatedTests.length <= 0 && !specificTestFile && (
        <div className="flex w-full h-[80vh] justify-center items-center">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5" />
                AI Test Generation
              </CardTitle>
              <CardDescription>
                Generate comprehensive tests for your selected files using AI
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Framework Selection */}
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium">
                  Testing Framework:
                </label>
                {/* <select
                value={framework}
                onChange={(e) => setFramework(e.target.value)}
                className="px-3 py-1 border rounded-md text-sm"
                disabled={isGenerating}
              >
                <option value="jest">Jest</option>
                <option value="vitest">Vitest</option>
                <option value="mocha">Mocha</option>
                <option value="testing-library">Testing Library</option>
              </select> */}
                <Select value={framework} onValueChange={setFramework}>
                  <SelectTrigger className="w-[180px]" disabled={isGenerating}>
                    <SelectValue placeholder="Test Framework" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="jest">Jest</SelectItem>
                    <SelectItem value="vitest">Vitest</SelectItem>
                    <SelectItem value="mocha">Mocha</SelectItem>
                    <SelectItem value="testing-library">
                      Testing Library
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Selected Files */}
              <div>
                <label className="text-sm font-medium">
                  Selected Files ({selectedFiles.length}):
                </label>
                <div className="mt-1 space-y-1">
                  {selectedFiles.map((file) => (
                    <div
                      key={file}
                      className="text-sm text-gray-600 flex items-center gap-2"
                    >
                      <span>{file}</span>
                      {isLoadingFiles ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : fileContents[file] ? (
                        <CheckCircle className="h-3 w-3 text-green-500" />
                      ) : (
                        <XCircle className="h-3 w-3 text-red-500" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  onClick={handleStartGeneration}
                  disabled={
                    isGenerating || isLoadingFiles || selectedFiles.length === 0
                  }
                  className="flex items-center gap-2"
                >
                  {isGenerating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                  {isGenerating ? "Generating..." : "Generate Tests"}
                </Button>

                {(generatedTests.length > 0 || error) && (
                  <Button variant="outline" onClick={reset}>
                    Reset
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <XCircle className="h-4 w-4 text-red-500" />
          <AlertDescription className="text-red-700">{error}</AlertDescription>
        </Alert>
      )}

      {/* Generated Tests */}
      {(generatedTests.length > 0 || specificTestFile) && (
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="code" className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              Test Code
            </TabsTrigger>
            <TabsTrigger value="validation" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Validation
            </TabsTrigger>
            <TabsTrigger value="issues" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Issues
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            {specificTestFile ? (
              // Show specific test file from DB
              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {specificTestFile.validation.isValid ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className="font-medium text-sm">{specificTestFile.originalFilePath}</span>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      specificTestFile.validation.isValid
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {specificTestFile.validation.isValid ? "Valid" : "Has Issues"}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Tests:</span>
                    <span className="ml-1 font-medium">
                      {specificTestFile.summary.testCount}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Coverage:</span>
                    <span className="ml-1 font-medium">
                      {typeof specificTestFile.coverageScore === 'number' 
                        ? `${specificTestFile.coverageScore}%`
                        : specificTestFile.coverageScore}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Framework:</span>
                    <span className="ml-1 font-medium">
                      {specificTestFile.summary.framework}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Model:</span>
                    <span className="ml-1 font-medium">
                      {specificTestFile.metadata.model}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Status:</span>
                    <span className="ml-1 font-medium capitalize">
                      {specificTestFile.status}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Session ID:</span>
                    <span className="ml-1 font-medium text-xs">
                      {specificTestFile.sessionId}
                    </span>
                  </div>
                </div>

                {specificTestFile.summary.description && (
                  <p className="text-sm text-gray-600">
                    {specificTestFile.summary.description}
                  </p>
                )}

                {/* Validation Summary */}
                {specificTestFile.validationSummary && (
                  <div className="bg-gray-50 p-3 rounded">
                    <h4 className="font-medium text-gray-700 mb-2">Validation Summary</h4>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Score:</span>
                        <span className="ml-1 font-medium">
                          {typeof specificTestFile.validationSummary === 'object' && 'score' in specificTestFile.validationSummary
                            ? specificTestFile.validationSummary.score
                            : specificTestFile.validationSummary}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Issues:</span>
                        <span className="ml-1 font-medium">
                          {typeof specificTestFile.validationSummary === 'object' && 'issues' in specificTestFile.validationSummary
                            ? specificTestFile.validationSummary.issues
                            : 0}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Status:</span>
                        <span className="ml-1 font-medium capitalize">
                          {typeof specificTestFile.validationSummary === 'object' && 'status' in specificTestFile.validationSummary
                            ? specificTestFile.validationSummary.status
                            : specificTestFile.validationSummary}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // Show generated tests from current session
              generatedTests.map((test, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {test.validation.isValid ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span className="font-medium text-sm">{test.filePath}</span>
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        test.validation.isValid
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {test.validation.isValid ? "Valid" : "Has Issues"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Tests:</span>
                      <span className="ml-1 font-medium">
                        {test.summary.testCount}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Coverage:</span>
                      <span className="ml-1 font-medium">
                        {test.validation.coverage.estimated}%
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Framework:</span>
                      <span className="ml-1 font-medium">
                        {test.summary.framework}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Model:</span>
                      <span className="ml-1 font-medium">
                        {test.metadata.model}
                      </span>
                    </div>
                  </div>

                  {test.summary.description && (
                    <p className="text-sm text-gray-600">
                      {test.summary.description}
                    </p>
                  )}
                </div>
              ))
            )}
          </TabsContent>

          <TabsContent value="code" className="space-y-4 mt-4">
            {specificTestFile ? (
              // Show specific test file code from DB
              <CodeBlock
                code={specificTestFile.testCode}
                filename={specificTestFile.suggestedTestFileName}
                language={specificTestFile.suggestedTestFileName.split(".").pop() || "js"}
              />
            ) : testFile ? (
              // Show testFile from hook (single file case)
              <CodeBlock
                code={testFile.testCode}
                filename={testFile.suggestedTestFileName}
                language={testFile.suggestedTestFileName.split(".").pop() || "js"}
              />
            ) : (
              // Show generated tests from current session
              generatedTests.map((test, index) => (
                <CodeBlock
                  key={index}
                  code={test.testCode}
                  filename={test.filePath}
                  language={test.filePath.split(".").pop() || "js"}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="validation" className="space-y-4 mt-4">
            {specificTestFile ? (
              // Show validation for specific test file from DB
              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="font-medium text-sm">{specificTestFile.originalFilePath}</span>
                  <span
                    className={`px-2 py-1 rounded text-xs ml-auto ${
                      specificTestFile.validation.isValid
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {specificTestFile.validation.isValid ? "Valid" : "Has Issues"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-700">
                      Syntax Validation
                    </h4>
                    <div className="flex items-center gap-2">
                      {specificTestFile.validation.syntax.valid ? (
                        <CheckCircle className="h-3 w-3 text-green-500" />
                      ) : (
                        <XCircle className="h-3 w-3 text-red-500" />
                      )}
                      <span
                        className={
                          specificTestFile.validation.syntax.valid
                            ? "text-green-600"
                            : "text-red-600"
                        }
                      >
                        {specificTestFile.validation.syntax.valid ? "Valid" : "Invalid"}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-700">
                      Logic Validation
                    </h4>
                    <div className="flex items-center gap-2">
                      {specificTestFile.validation.logic.valid ? (
                        <CheckCircle className="h-3 w-3 text-green-500" />
                      ) : (
                        <XCircle className="h-3 w-3 text-red-500" />
                      )}
                      <span
                        className={
                          specificTestFile.validation.logic.valid
                            ? "text-green-600"
                            : "text-red-600"
                        }
                      >
                        {specificTestFile.validation.logic.valid ? "Valid" : "Has Warnings"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-gray-700">
                    Coverage Analysis
                  </h4>
                  <div className="flex items-center gap-2">
                    <Progress
                      value={typeof specificTestFile.coverageScore === 'number' 
                        ? specificTestFile.coverageScore 
                        : specificTestFile.validation.coverage.estimated}
                      className="flex-1"
                    />
                    <span className="text-sm font-medium">
                      {typeof specificTestFile.coverageScore === 'number' 
                        ? `${specificTestFile.coverageScore}%`
                        : specificTestFile.coverageScore}
                    </span>
                  </div>
                </div>

                {specificTestFile.validation.suggestions &&
                  specificTestFile.validation.suggestions.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-xs font-medium text-blue-600">
                        Improvement Suggestions:
                      </span>
                      <ul className="list-disc list-inside space-y-1">
                        {specificTestFile.validation.suggestions.map((suggestion, i) => (
                          <li key={i} className="text-xs text-blue-600">
                            {suggestion}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
              </div>
            ) : (
              // Show validation for generated tests from current session
              generatedTests.map((test, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="font-medium text-sm">{test.filePath}</span>
                    <span
                      className={`px-2 py-1 rounded text-xs ml-auto ${
                        test.validation.isValid
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {test.validation.isValid ? "Valid" : "Has Issues"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-700">
                        Syntax Validation
                      </h4>
                      <div className="flex items-center gap-2">
                        {test.validation.syntax.valid ? (
                          <CheckCircle className="h-3 w-3 text-green-500" />
                        ) : (
                          <XCircle className="h-3 w-3 text-red-500" />
                        )}
                        <span
                          className={
                            test.validation.syntax.valid
                              ? "text-green-600"
                              : "text-red-600"
                          }
                        >
                          {test.validation.syntax.valid ? "Valid" : "Invalid"}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-700">
                        Logic Validation
                      </h4>
                      <div className="flex items-center gap-2">
                        {test.validation.logic.valid ? (
                          <CheckCircle className="h-3 w-3 text-green-500" />
                        ) : (
                          <XCircle className="h-3 w-3 text-red-500" />
                        )}
                        <span
                          className={
                            test.validation.logic.valid
                              ? "text-green-600"
                              : "text-red-600"
                          }
                        >
                          {test.validation.logic.valid ? "Valid" : "Has Warnings"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-700">
                      Coverage Analysis
                    </h4>
                    <div className="flex items-center gap-2">
                      <Progress
                        value={test.validation.coverage.estimated}
                        className="flex-1"
                      />
                      <span className="text-sm font-medium">
                        {test.validation.coverage.estimated}%
                      </span>
                    </div>
                  </div>

                  {test.validation.suggestions &&
                    test.validation.suggestions.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-xs font-medium text-blue-600">
                          Improvement Suggestions:
                        </span>
                        <ul className="list-disc list-inside space-y-1">
                          {test.validation.suggestions.map((suggestion, i) => (
                            <li key={i} className="text-xs text-blue-600">
                              {suggestion}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                </div>
              ))
            )}
          </TabsContent>

          <TabsContent value="issues" className="space-y-4 mt-4">
            {specificTestFile ? (
              // Show issues for specific test file from DB
              !specificTestFile.validation.isValid ||
              (specificTestFile.validation.syntax.errors &&
                specificTestFile.validation.syntax.errors.length > 0) ||
              (specificTestFile.validation.logic.warnings &&
                specificTestFile.validation.logic.warnings.length > 0) ? (
                <div className="border rounded-lg p-4 space-y-3 border-red-200 bg-red-50">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <span className="font-medium text-sm">
                      {specificTestFile.originalFilePath}
                    </span>
                    <span className="px-2 py-1 rounded text-xs bg-red-100 text-red-800 ml-auto">
                      Has Issues
                    </span>
                  </div>

                  {specificTestFile.validation.syntax.errors &&
                    specificTestFile.validation.syntax.errors.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-xs font-medium text-red-600">
                          Syntax Errors:
                        </span>
                        <ul className="list-disc list-inside space-y-1">
                          {specificTestFile.validation.syntax.errors.map((error, i) => (
                            <li key={i} className="text-xs text-red-600">
                              {error}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                  {specificTestFile.validation.logic.warnings &&
                    specificTestFile.validation.logic.warnings.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-xs font-medium text-yellow-600">
                          Logic Warnings:
                        </span>
                        <ul className="list-disc list-inside space-y-1">
                          {specificTestFile.validation.logic.warnings.map(
                            (warning, i) => (
                              <li key={i} className="text-xs text-yellow-600">
                                {warning}
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}

                  {specificTestFile.validation.coverage.gaps &&
                    specificTestFile.validation.coverage.gaps.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-xs font-medium text-orange-600">
                          Coverage Gaps:
                        </span>
                        <ul className="list-disc list-inside space-y-1">
                          {specificTestFile.validation.coverage.gaps.map((gap, i) => (
                            <li key={i} className="text-xs text-orange-600">
                              {gap}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">
                    No Issues Found
                  </h3>
                  <p className="text-gray-500">
                    The test file passed all validation checks!
                  </p>
                </div>
              )
            ) : (
              // Show issues for generated tests from current session
              generatedTests.filter(
                (test) =>
                  !test.validation.isValid ||
                  (test.validation.syntax.errors &&
                    test.validation.syntax.errors.length > 0) ||
                  (test.validation.logic.warnings &&
                    test.validation.logic.warnings.length > 0)
              ).length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">
                    No Issues Found
                  </h3>
                  <p className="text-gray-500">
                    All generated tests passed validation!
                  </p>
                </div>
              ) : (
                generatedTests
                  .filter(
                    (test) =>
                      !test.validation.isValid ||
                      (test.validation.syntax.errors &&
                        test.validation.syntax.errors.length > 0) ||
                      (test.validation.logic.warnings &&
                        test.validation.logic.warnings.length > 0)
                  )
                  .map((test, index) => (
                    <div
                      key={index}
                      className="border rounded-lg p-4 space-y-3 border-red-200 bg-red-50"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        <span className="font-medium text-sm">
                          {test.filePath}
                        </span>
                        <span className="px-2 py-1 rounded text-xs bg-red-100 text-red-800 ml-auto">
                          Has Issues
                        </span>
                      </div>

                      {test.validation.syntax.errors &&
                        test.validation.syntax.errors.length > 0 && (
                          <div className="space-y-1">
                            <span className="text-xs font-medium text-red-600">
                              Syntax Errors:
                            </span>
                            <ul className="list-disc list-inside space-y-1">
                              {test.validation.syntax.errors.map((error, i) => (
                                <li key={i} className="text-xs text-red-600">
                                  {error}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                      {test.validation.logic.warnings &&
                        test.validation.logic.warnings.length > 0 && (
                          <div className="space-y-1">
                            <span className="text-xs font-medium text-yellow-600">
                              Logic Warnings:
                            </span>
                            <ul className="list-disc list-inside space-y-1">
                              {test.validation.logic.warnings.map(
                                (warning, i) => (
                                  <li key={i} className="text-xs text-yellow-600">
                                    {warning}
                                  </li>
                                )
                              )}
                            </ul>
                          </div>
                        )}

                      {test.validation.coverage.gaps &&
                        test.validation.coverage.gaps.length > 0 && (
                          <div className="space-y-1">
                            <span className="text-xs font-medium text-orange-600">
                              Coverage Gaps:
                            </span>
                            <ul className="list-disc list-inside space-y-1">
                              {test.validation.coverage.gaps.map((gap, i) => (
                                <li key={i} className="text-xs text-orange-600">
                                  {gap}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                    </div>
                  ))
              )
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default TestGenerationPanel;
