import React from "react";
import { CheckCircle, XCircle } from "lucide-react";
import type { GeneratedTest, TestFileDto } from "../../lib/apis/ai-test-api";

interface TestOverviewCardProps {
  test?: GeneratedTest;
  specificTestFile?: TestFileDto;
}

export const TestOverviewCard: React.FC<TestOverviewCardProps> = ({
  test,
  specificTestFile,
}) => {
  // Use specificTestFile if provided, otherwise use test
  const testData = specificTestFile || test;
  
  if (!testData) return null;

  const isValid = 'validation' in testData ? testData.validation.isValid : true;
  const filePath = 'originalFilePath' in testData ? testData.originalFilePath : testData.filePath;
  const testCount = 'summary' in testData ? testData.summary.testCount : 0;
  const coverage = 'coverageScore' in testData 
    ? (typeof testData.validation.coverage.estimated === 'number' ? testData.validation.coverage.estimated : 0)
    : ('validation' in testData ? testData.validation.coverage.estimated : 0);
  const framework = 'summary' in testData ? testData.summary.framework : 'unknown';
  const model = 'metadata' in testData ? testData.metadata.model : 'unknown';
  const description = 'summary' in testData ? testData.summary.description : '';
  const sessionId = 'sessionId' in testData ? testData.sessionId : '';
  const status = 'status' in testData ? testData.status : 'completed';

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isValid ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <XCircle className="h-4 w-4 text-red-500" />
          )}
          <span className="font-medium text-sm">{filePath}</span>
        </div>
        <span
          className={`px-2 py-1 rounded text-xs ${
            isValid
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {isValid ? "Valid" : "Has Issues"}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div>
          <span className="text-gray-500">Tests:</span>
          <span className="ml-1 font-medium">{testCount}</span>
        </div>
        <div>
          <span className="text-gray-500">Coverage:</span>
          <span className="ml-1 font-medium">{coverage}%</span>
        </div>
        <div>
          <span className="text-gray-500">Framework:</span>
          <span className="ml-1 font-medium">{framework}</span>
        </div>
        <div>
          <span className="text-gray-500">Model:</span>
          <span className="ml-1 font-medium">{model}</span>
        </div>
      </div>

      {sessionId && (
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Test Status:</span>
            <span className="ml-1 font-medium capitalize">{status}</span>
          </div>
        </div>
      )}

      {description && (
        <p className="text-sm text-gray-600">{description}</p>
      )}

      {/* Validation Summary for specific test files */}
      {specificTestFile?.validationSummary && (
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
  );
};
