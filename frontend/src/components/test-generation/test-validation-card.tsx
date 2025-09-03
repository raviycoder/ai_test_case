import React from "react";
import { CheckCircle, XCircle } from "lucide-react";
import { Progress } from "../ui/progress";
import type { GeneratedTest, TestFileDto } from "../../lib/apis/ai-test-api";

interface TestValidationCardProps {
  test?: GeneratedTest;
  specificTestFile?: TestFileDto;
}

export const TestValidationCard: React.FC<TestValidationCardProps> = ({
  test,
  specificTestFile,
}) => {
  // Use specificTestFile if provided, otherwise use test
  const testData = specificTestFile || test;
  
  if (!testData) return null;

  const validation = 'validation' in testData ? testData.validation : null;
  const filePath = 'originalFilePath' in testData ? testData.originalFilePath : testData.filePath;
  const coverage = 'coverageScore' in testData 
    ? (typeof testData.validation.coverage.estimated === 'number' ? testData.validation.coverage.estimated : 0)
    : (validation ? validation.coverage.estimated : 0);

  if (!validation) return null;

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-center gap-2 mb-3">
        <CheckCircle className="h-4 w-4 text-green-500" />
        <span className="font-medium text-sm">{filePath}</span>
        <span
          className={`px-2 py-1 rounded text-xs ml-auto ${
            validation.isValid
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {validation.isValid ? "Valid" : "Has Issues"}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="space-y-2">
          <h4 className="font-medium text-gray-700">Syntax Validation</h4>
          <div className="flex items-center gap-2">
            {validation.syntax.valid ? (
              <CheckCircle className="h-3 w-3 text-green-500" />
            ) : (
              <XCircle className="h-3 w-3 text-red-500" />
            )}
            <span
              className={
                validation.syntax.valid ? "text-green-600" : "text-red-600"
              }
            >
              {validation.syntax.valid ? "Valid" : "Invalid"}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium text-gray-700">Logic Validation</h4>
          <div className="flex items-center gap-2">
            {validation.logic.valid ? (
              <CheckCircle className="h-3 w-3 text-green-500" />
            ) : (
              <XCircle className="h-3 w-3 text-red-500" />
            )}
            <span
              className={
                validation.logic.valid ? "text-green-600" : "text-red-600"
              }
            >
              {validation.logic.valid ? "Valid" : "Has Warnings"}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="font-medium text-gray-700">Coverage Analysis</h4>
        <div className="flex items-center gap-2">
          <Progress value={coverage} className="flex-1" />
          <span className="text-sm font-medium">{coverage}%</span>
        </div>
      </div>

      {validation.suggestions && validation.suggestions.length > 0 && (
        <div className="space-y-1">
          <span className="text-xs font-medium text-blue-600">
            Improvement Suggestions:
          </span>
          <ul className="list-disc list-inside space-y-1">
            {validation.suggestions.map((suggestion: string, i: number) => (
              <li key={i} className="text-xs text-blue-600">
                {suggestion}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
