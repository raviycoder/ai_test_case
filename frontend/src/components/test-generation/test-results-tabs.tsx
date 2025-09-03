import React from "react";
import { CheckCircle, AlertTriangle } from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../ui/tabs";
import {
  FileText,
  Code,
} from "lucide-react";
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

  // Filter tests with issues for the issues tab
  const testsWithIssues = generatedTests.filter(
    (test) =>
      !test.validation.isValid ||
      (test.validation.syntax.errors && test.validation.syntax.errors.length > 0) ||
      (test.validation.logic.warnings && test.validation.logic.warnings.length > 0)
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
          <CodeBlock
            code={specificTestFile.testCode}
            filename={specificTestFile.suggestedTestFileName}
            language={specificTestFile.suggestedTestFileName.split(".").pop() || "js"}
          />
        ) : testFile ? (
          <CodeBlock
            code={testFile.testCode}
            filename={testFile.suggestedTestFileName}
            language={testFile.suggestedTestFileName.split(".").pop() || "js"}
          />
        ) : (
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
            <h3 className="text-lg font-medium text-gray-900">No Issues Found</h3>
            <p className="text-gray-500">All generated tests passed validation!</p>
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
