import React from "react";
import { AlertTriangle, CheckCircle } from "lucide-react";
import type { GeneratedTest, TestFileDto } from "../../lib/apis/ai-test-api";

interface TestIssuesCardProps {
  test?: GeneratedTest;
  specificTestFile?: TestFileDto;
}

export const TestIssuesCard: React.FC<TestIssuesCardProps> = ({
  test,
  specificTestFile,
}) => {
  // Use specificTestFile if provided, otherwise use test
  const testData = specificTestFile || test;
  
  if (!testData) return null;

  const validation = 'validation' in testData ? testData.validation : null;
  const filePath = 'originalFilePath' in testData ? testData.originalFilePath : testData.filePath;

  if (!validation) return null;

  const hasIssues = !validation.isValid ||
    (validation.syntax.errors && validation.syntax.errors.length > 0) ||
    (validation.logic.warnings && validation.logic.warnings.length > 0);

  if (!hasIssues) {
    return (
      <div className="text-center py-8">
        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900">No Issues Found</h3>
        <p className="text-gray-500">
          The test file passed all validation checks!
        </p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-4 space-y-3 border-red-200 bg-red-50">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle className="h-4 w-4 text-red-500" />
        <span className="font-medium text-sm">{filePath}</span>
        <span className="px-2 py-1 rounded text-xs bg-red-100 text-red-800 ml-auto">
          Has Issues
        </span>
      </div>

      {validation.syntax.errors && validation.syntax.errors.length > 0 && (
        <div className="space-y-1">
          <span className="text-xs font-medium text-red-600">
            Syntax Errors:
          </span>
          <ul className="list-disc list-inside space-y-1">
            {validation.syntax.errors.map((error: string, i: number) => (
              <li key={i} className="text-xs text-red-600">
                {error}
              </li>
            ))}
          </ul>
        </div>
      )}

      {validation.logic.warnings && validation.logic.warnings.length > 0 && (
        <div className="space-y-1">
          <span className="text-xs font-medium text-yellow-600">
            Logic Warnings:
          </span>
          <ul className="list-disc list-inside space-y-1">
            {validation.logic.warnings.map((warning: string, i: number) => (
              <li key={i} className="text-xs text-yellow-600">
                {warning}
              </li>
            ))}
          </ul>
        </div>
      )}

      {validation.coverage.gaps && validation.coverage.gaps.length > 0 && (
        <div className="space-y-1">
          <span className="text-xs font-medium text-orange-600">
            Coverage Gaps:
          </span>
          <ul className="list-disc list-inside space-y-1">
            {validation.coverage.gaps.map((gap: string, i: number) => (
              <li key={i} className="text-xs text-orange-600">
                {gap}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
