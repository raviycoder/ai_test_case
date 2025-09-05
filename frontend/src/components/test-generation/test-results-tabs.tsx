import React from "react";
import { CheckCircle, AlertTriangle, Download } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { FileText, Code } from "lucide-react";
import { Button } from "../ui/button";
import { CodeBlock } from "../ui/code-block";
import { TestOverviewCard } from "./test-overview-card";
import { TestValidationCard } from "./test-validation-card";
import { TestIssuesCard } from "./test-issues-card";
import type { GeneratedTest, TestFileDto } from "../../lib/apis/ai-test-api";

interface TestResultsTabsProps {
  generatedTests: GeneratedTest[];
  specificTestFile?: TestFileDto | null;
  testFile?: {
    testCode: string;
    suggestedTestFileName: string;
  };
}

export const TestResultsTabs: React.FC<TestResultsTabsProps> = ({
  generatedTests,
  specificTestFile,
  testFile,
}) => {
  const hasTests = generatedTests.length > 0 || specificTestFile;

  if (!hasTests) return null;

  // Download function for test files
  const downloadTestFile = (code: string, filename: string) => {
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Download all test files as a zip (simplified version)
  // const downloadAllTests = () => {
  //   if (specificTestFile) {
  //     downloadTestFile(
  //       specificTestFile.testCode,
  //       specificTestFile.suggestedTestFileName
  //     );
  //   } else if (testFile) {
  //     downloadTestFile(testFile.testCode, testFile.suggestedTestFileName);
  //   } else {
  //     generatedTests.forEach((test, index) => {
  //       const filename =
  //         test.filePath.split("/").pop() || `test-${index + 1}.js`;
  //       setTimeout(
  //         () => downloadTestFile(test.testCode, filename),
  //         index * 100
  //       );
  //     });
  //   }
  // };

  // Filter tests with issues for the issues tab
  const testsWithIssues = generatedTests.filter(
    (test) =>
      !test.validation.isValid ||
      (test.validation.syntax.errors &&
        test.validation.syntax.errors.length > 0) ||
      (test.validation.logic.warnings &&
        test.validation.logic.warnings.length > 0)
  );

  return (
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
          <TestOverviewCard specificTestFile={specificTestFile} />
        ) : (
          generatedTests.map((test, index) => (
            <TestOverviewCard key={index} test={test} />
          ))
        )}
      </TabsContent>

      <TabsContent value="code" className="space-y-4 mt-4">
        {specificTestFile ? (
          <div className="relative">
            <div className="absolute top-4 right-10 z-10">
              <Button
                onClick={() =>
                  downloadTestFile(
                    specificTestFile.testCode,
                    specificTestFile.suggestedTestFileName
                  )
                }
                size="sm"
                variant="outline"
                className="bg-transparent text-gray-400 dark:text-gray-50 border-0 hover:bg-transparent hover:text-gray-50"
              >
                <Download className="h-3 w-3" />
              </Button>
            </div>
            <CodeBlock
              code={specificTestFile.testCode}
              filename={specificTestFile.suggestedTestFileName}
              language={
                specificTestFile.suggestedTestFileName.split(".").pop() || "js"
              }
            />
          </div>
        ) : testFile ? (
          <div className="relative">
            <div className="absolute top-4 right-10 z-10">
              <Button
                onClick={() =>
                  downloadTestFile(
                    testFile.testCode,
                    testFile.suggestedTestFileName.split("/").pop() || `test-1.js`
                  )
                }
                size="sm"
                variant="outline"
                className="bg-transparent text-gray-400 dark:text-gray-50 border-0 hover:bg-transparent hover:text-gray-50"
              >
                <Download className="h-3 w-3" />
              </Button>
            </div>
            <CodeBlock
              code={testFile.testCode}
              filename={testFile.suggestedTestFileName}
              language={testFile.suggestedTestFileName.split(".").pop() || "js"}
            />
          </div>
        ) : (
          generatedTests.map((test, index) => (
            <div key={index} className="relative">
              <div className="absolute top-4 right-10 z-10">
                <Button
                  onClick={() =>
                    downloadTestFile(
                      test.testCode,
                      test.filePath.split("/").pop() || `test-${index + 1}.js`
                    )
                  }
                  size="sm"
                  variant="outline"
                  className="bg-transparent text-gray-400 dark:text-gray-50 border-0 hover:bg-transparent hover:text-gray-50"
                >
                  <Download className="h-3 w-3" />
                </Button>
              </div>
              <CodeBlock
                code={test.testCode}
                filename={test.filePath}
                language={test.filePath.split(".").pop() || "js"}
              />
            </div>
          ))
        )}
      </TabsContent>

      <TabsContent value="validation" className="space-y-4 mt-4">
        {specificTestFile ? (
          <TestValidationCard specificTestFile={specificTestFile} />
        ) : (
          generatedTests.map((test, index) => (
            <TestValidationCard key={index} test={test} />
          ))
        )}
      </TabsContent>

      <TabsContent value="issues" className="space-y-4 mt-4">
        {specificTestFile ? (
          <TestIssuesCard specificTestFile={specificTestFile} />
        ) : testsWithIssues.length === 0 ? (
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
          testsWithIssues.map((test, index) => (
            <TestIssuesCard key={index} test={test} />
          ))
        )}
      </TabsContent>
    </Tabs>
  );
};
