import React from "react";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Loader2,
  Play,
  CheckCircle,
  XCircle,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface TestGenerationFormProps {
  framework: string;
  onFrameworkChange: (framework: string) => void;
  selectedFiles: string[];
  fileContents: Record<string, string>;
  isLoadingFiles: boolean;
  isGenerating: boolean;
  isBackgroundGenerating: boolean;
  onStartGeneration: () => void;
  onStopGeneration?: () => void;
  onReset?: () => void;
  hasResults: boolean;
  hasError: boolean;
}

export const TestGenerationForm: React.FC<TestGenerationFormProps> = ({
  framework,
  onFrameworkChange,
  selectedFiles,
  fileContents,
  isLoadingFiles,
  isGenerating,
  isBackgroundGenerating,
  onStartGeneration,
  onStopGeneration,
  onReset,
  hasResults,
  hasError,
}) => {
  return (
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
            <Select value={framework} onValueChange={onFrameworkChange}>
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
              Selected File:
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
              onClick={onStartGeneration}
              disabled={
                isGenerating || isBackgroundGenerating || isLoadingFiles || selectedFiles.length === 0
              }
              className="flex items-center gap-2"
            >
              {(isGenerating || isBackgroundGenerating) ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              {(isGenerating || isBackgroundGenerating) 
                ? (isBackgroundGenerating ? "Generating in Background..." : "Generating...") 
                : "Generate Test with AI"}
            </Button>

            {isBackgroundGenerating && onStopGeneration && (
              <Button variant="outline" onClick={onStopGeneration}>
                Stop Generation
              </Button>
            )}

            {(hasResults || hasError) && onReset && (
              <Button variant="outline" onClick={onReset}>
                Reset
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
