import { GoogleGenAI } from "@google/genai";
import type { Request, Response } from "express";
import { getAuth } from "./auth.controller";
import { fromNodeHeaders } from "better-auth/node";
import TestSession from "../models/testSession.model";
import TestFile from "../models/testFile.model";
import { Types } from "mongoose";

// Utility function to safely decode file paths
const safeDecodeFilePath = (path: string): string => {
  try {
    // Try decoding once
    let decoded = decodeURIComponent(path);
    
    // Check if it needs another round of decoding (double-encoded)
    try {
      const doubleDecoded = decodeURIComponent(decoded);
      // If successful, it was double-encoded
      decoded = doubleDecoded;
    } catch {
      // Single encoding was correct
    }
    
    console.log(`Path decoding: original="${path}", decoded="${decoded}"`);
    return decoded;
  } catch (error) {
    console.warn(`Failed to decode path "${path}":`, error);
    return path;
  }
};

// Initialize Gemini AI
const geminiAI = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY || "",
});

// Types for test generation
interface DirectTestGenerationRequest {
  repositoryId: string;
  files: Array<{
    path: string;
    content: string;
    framework?: string;
  }>;
  framework: string;
  options?: {
    testTypes?: string[];
    coverage?: "basic" | "comprehensive";
    includeEdgeCases?: boolean;
    mockExternal?: boolean;
  };
}

interface TestGenerationRequest {
  sessionId: string;
  files: Array<{
    path: string;
    content: string;
    framework?: string;
  }>;
  framework: string;
  options?: {
    testTypes?: string[];
    coverage?: "basic" | "comprehensive";
    includeEdgeCases?: boolean;
    mockExternal?: boolean;
  };
}

interface GenerationStep {
  step: string;
  status: "pending" | "processing" | "completed" | "error";
  message: string;
  progress?: number;
  details?: any;
  timestamp: Date;
}

interface ValidationResult {
  isValid: boolean;
  syntax: { valid: boolean; errors?: string[] };
  logic: { valid: boolean; warnings?: string[] };
  coverage: { estimated: number; gaps?: string[] };
  suggestions?: string[];
}

interface GeneratedTest {
  filePath: string;
  testCode: string;
  summary: {
    description: string;
    testCount: number;
    coverageAreas: string[];
    framework: string;
    dependencies: string[];
  };
  validation: ValidationResult;
  metadata: {
    generatedAt: Date;
    tokensUsed: { prompt: number; response: number };
    model: string;
    processingTime: number;
  };
}

// Enhanced prompts for better test generation
const createTestPrompt = (
  fileContent: string,
  framework: string,
  options: any = {}
) => {
  const {
    testTypes = ["unit"],
    coverage = "comprehensive",
    includeEdgeCases = true,
    mockExternal = true,
  } = options;

  return `
You are an expert test engineer. Generate comprehensive ${framework} tests for the following code.

REQUIREMENTS:
- Framework: ${framework}
- Test Types: ${testTypes.join(", ")}
- Coverage Level: ${coverage}
- Include Edge Cases: ${includeEdgeCases}
- Mock External Dependencies: ${mockExternal}

CODE TO TEST:
\`\`\`
${fileContent}
\`\`\`

INSTRUCTIONS:
1. Analyze the code structure, functions, classes, and dependencies
2. Generate comprehensive tests covering:
   - Happy path scenarios
   - Edge cases and error conditions
   - Input validation
   - Async operations (if any)
   - State management (if applicable)
3. Include proper setup/teardown
4. Mock external dependencies appropriately
5. Use descriptive test names and comments
6. Follow ${framework} best practices

RESPONSE FORMAT (JSON):
{
  "analysis": {
    "description": "Brief description of the code's purpose",
    "complexity": "low|medium|high",
    "mainFunctions": ["function1", "function2"],
    "dependencies": ["dep1", "dep2"],
    "testableAreas": ["area1", "area2"]
  },
  "testCode": "// Complete test code here",
  "summary": {
    "testCount": 10,
    "coverageAreas": ["function testing", "error handling"],
    "estimatedCoverage": 85,
    "framework": "${framework}",
    "dependencies": ["jest", "@testing-library/react"]
  },
  "validation": {
    "syntaxChecks": ["check1", "check2"],
    "potentialIssues": ["issue1", "issue2"],
    "suggestions": ["suggestion1", "suggestion2"]
  }
}

Generate only valid JSON. No explanations outside the JSON.
`;
};

const createCodeSummaryPrompt = (fileContent: string) => {
  return `
Analyze this code and provide a comprehensive summary:

\`\`\`
${fileContent}
\`\`\`

RESPONSE FORMAT (JSON):
{
  "summary": {
    "purpose": "What this code does",
    "mainFeatures": ["feature1", "feature2"],
    "complexity": "low|medium|high",
    "linesOfCode": 150,
    "maintainability": "good|fair|poor"
  },
  "structure": {
    "functions": [{"name": "func1", "purpose": "does X", "complexity": "low"}],
    "classes": [{"name": "Class1", "purpose": "manages Y"}],
    "exports": ["export1", "export2"],
    "dependencies": ["react", "lodash"]
  },
  "quality": {
    "score": 8.5,
    "strengths": ["well-structured", "good naming"],
    "improvements": ["add error handling", "more comments"],
    "testability": "high|medium|low"
  }
}

Generate only valid JSON.
`;
};

// Validate generated test code
const validateTestCode = async (
  testCode: string,
  framework: string
): Promise<ValidationResult> => {
  const validation: ValidationResult = {
    isValid: true,
    syntax: { valid: true },
    logic: { valid: true },
    coverage: { estimated: 0 },
  };

  try {
    // Basic syntax validation
    if (!testCode || testCode.trim().length === 0) {
      validation.isValid = false;
      validation.syntax = {
        valid: false,
        errors: ["Empty test code generated"],
      };
      return validation;
    }

    // Framework-specific validation
    const frameworkChecks = {
      jest: ["describe", "it", "test", "expect"],
      mocha: ["describe", "it"],
      vitest: ["describe", "it", "test", "expect"],
      "testing-library": ["render", "screen"],
    };

    const requiredPatterns =
      frameworkChecks[framework as keyof typeof frameworkChecks] || [];
    const missingPatterns = requiredPatterns.filter(
      (pattern) => !testCode.includes(pattern)
    );

    if (missingPatterns.length > 0) {
      validation.logic = {
        valid: false,
        warnings: [
          `Missing ${framework} patterns: ${missingPatterns.join(", ")}`,
        ],
      };
    }

    // Estimate coverage based on test patterns
    const testCount = (testCode.match(/\b(it|test)\s*\(/g) || []).length;
    validation.coverage.estimated = Math.min(testCount * 10, 90); // Rough estimation

    // Generate suggestions
    validation.suggestions = [];
    if (testCount < 3)
      validation.suggestions.push("Consider adding more test cases");
    if (!testCode.includes("mock"))
      validation.suggestions.push(
        "Consider adding mocks for external dependencies"
      );
    if (!testCode.includes("error"))
      validation.suggestions.push("Consider adding error handling tests");
  } catch (error) {
    validation.isValid = false;
    validation.syntax = {
      valid: false,
      errors: [
        `Validation error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      ],
    };
  }

  return validation;
};

// Main test generation endpoint
export const generateTests = async (req: Request, res: Response) => {
  const startTime = Date.now();
  let session: any = null;

  try {
    // Validate authentication
    const auth = await getAuth();
    const sessionResp = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!sessionResp?.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const {
      sessionId,
      files,
      framework,
      options = {},
    } = req.body as TestGenerationRequest;

    if (!sessionId || !files || !framework) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: sessionId, files, framework",
      });
    }

    // Find or create test session
    session = await TestSession.findOne({ sessionId }).populate("userId");
    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Test session not found",
      });
    }

    // Update session status
    session.status = "processing";
    session.framework = framework;
    await session.save();

    // Send initial response with streaming headers for real-time updates
    res.writeHead(200, {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
    });

    // Helper function to send updates
    const sendUpdate = (update: any) => {
      res.write(JSON.stringify(update) + "\n");
    };

    const generatedTests: GeneratedTest[] = [];

    // Process each file
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const progress = 20 + (i / files.length) * 60;

      sendUpdate({
        type: "progress",
        data: {
          step: "test_generation",
          message: `Generating tests for ${file.path}...`,
          progress,
          fileIndex: i,
          totalFiles: files.length,
        },
      });

      try {
        // Generate code summary
        const summaryPrompt = createCodeSummaryPrompt(file.content);
        const summaryResult = await geminiAI.models.generateContent({
          model: "gemini-2.5-flash",
          contents: summaryPrompt,
        });
        const summaryResponse = summaryResult.text || "";

        let codeSummary;
        try {
          // Remove markdown code blocks if present
          const cleanResponse = summaryResponse
            .replace(/```json\n?|\n?```/g, "")
            .trim();
          codeSummary = JSON.parse(cleanResponse);
        } catch {
          codeSummary = { summary: { purpose: "Code analysis failed" } };
        }

        sendUpdate({
          type: "file_analysis",
          data: {
            filePath: file.path,
            summary: codeSummary,
          },
        });

        // Generate test code
        const testPrompt = createTestPrompt(file.content, framework, options);
        const testResult = await geminiAI.models.generateContent({
          model: "gemini-2.5-flash",
          contents: testPrompt,
        });
        const testResponse = testResult.text || "";

        let parsedResponse;
        try {
          // Remove markdown code blocks if present
          const cleanResponse = testResponse
            .replace(/```json\n?|\n?```/g, "")
            .trim();
          parsedResponse = JSON.parse(cleanResponse);
        } catch (parseError) {
          throw new Error(
            `AI response parsing failed: ${
              parseError instanceof Error
                ? parseError.message
                : "Unknown parsing error"
            }`
          );
        }

        // Validate generated test
        const validation = await validateTestCode(
          parsedResponse.testCode,
          framework
        );

        const generatedTest: GeneratedTest = {
          filePath: file.path,
          testCode: parsedResponse.testCode,
          summary: {
            description:
              parsedResponse.analysis?.description || "Generated test",
            testCount: parsedResponse.summary?.testCount || 0,
            coverageAreas: parsedResponse.summary?.coverageAreas || [],
            framework,
            dependencies: parsedResponse.summary?.dependencies || [],
          },
          validation,
          metadata: {
            generatedAt: new Date(),
            tokensUsed: {
              prompt: testPrompt.length + summaryPrompt.length,
              response: testResponse.length + summaryResponse.length,
            },
            model: "gemini-2.5-flash",
            processingTime: Date.now() - startTime,
          },
        };

        generatedTests.push(generatedTest);

        sendUpdate({
          type: "test_generated",
          data: {
            filePath: file.path,
            summary: generatedTest.summary,
            validation: generatedTest.validation,
            progress: progress + (1 / files.length) * 60,
          },
        });

        // Create TestFile record for this generated test
        try {
          const testFile = new TestFile({
            sessionId: session._id,
            userId: sessionResp.user.id,
            repositoryId: session.repositoryId,
            originalFilePath: file.path,
            testCode: generatedTest.testCode,
            summary: {
              description: generatedTest.summary.description,
              testCount: generatedTest.summary.testCount,
              coverageAreas: generatedTest.summary.coverageAreas,
              framework: generatedTest.summary.framework,
              dependencies: generatedTest.summary.dependencies,
            },
            validation: {
              isValid: generatedTest.validation.isValid,
              syntax: {
                valid: generatedTest.validation.syntax.valid,
                errors: generatedTest.validation.syntax.errors || [],
              },
              logic: {
                valid: generatedTest.validation.logic.valid,
                warnings: generatedTest.validation.logic.warnings || [],
              },
              coverage: {
                estimated: generatedTest.validation.coverage.estimated,
                gaps: generatedTest.validation.coverage.gaps || [],
              },
              suggestions: generatedTest.validation.suggestions || [],
            },
            metadata: {
              generatedAt: generatedTest.metadata.generatedAt,
              tokensUsed: {
                prompt: generatedTest.metadata.tokensUsed.prompt,
                response: generatedTest.metadata.tokensUsed.response,
              },
              model: generatedTest.metadata.model,
              processingTime: generatedTest.metadata.processingTime,
              aiProvider: "google",
            },
            status: generatedTest.validation.isValid ? "generated" : "draft",
            isActive: true,
          });

          await testFile.save();
        } catch (testFileError) {
          console.error(
            `Error saving test file for ${file.path}:`,
            testFileError
          );
          // Continue processing other files
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";

        sendUpdate({
          type: "error",
          data: {
            filePath: file.path,
            error: errorMessage,
            step: "test_generation",
          },
        });

        generatedTests.push({
          filePath: file.path,
          testCode: "",
          summary: {
            description: "Test generation failed",
            testCount: 0,
            coverageAreas: [],
            framework,
            dependencies: [],
          },
          validation: {
            isValid: false,
            syntax: { valid: false, errors: [errorMessage] },
            logic: { valid: false },
            coverage: { estimated: 0 },
          },
          metadata: {
            generatedAt: new Date(),
            tokensUsed: { prompt: 0, response: 0 },
            model: "gemini-2.5-flash",
            processingTime: Date.now() - startTime,
          },
        });
      }
    }

    // Update final session state
    session.status = generatedTests.every((t) => t.validation.isValid)
      ? "completed"
      : "failed";
    session.processingTimeMs = Date.now() - startTime;
    session.completedAt = new Date();
    await session.save();

    // Send final completion response
    const finalResponse = {
      type: "completed",
      data: {
        sessionId,
        success: true,
        generatedTests,
        summary: {
          totalFiles: files.length,
          successfulTests: generatedTests.filter((t) => t.validation.isValid)
            .length,
          failedTests: generatedTests.filter((t) => !t.validation.isValid)
            .length,
          totalTestCount: generatedTests.reduce(
            (sum, t) => sum + t.summary.testCount,
            0
          ),
          averageCoverage:
            generatedTests.reduce(
              (sum, t) => sum + t.validation.coverage.estimated,
              0
            ) / generatedTests.length,
          processingTime: Date.now() - startTime,
        },
      },
    };

    sendUpdate(finalResponse);
    res.end();
    return;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    console.error("Test generation error:", error);

    // Update session status on error
    if (session) {
      session.status = "failed";
      session.processingTimeMs = Date.now() - startTime;
      await session.save();
    }

    const errorResponse = {
      type: "error",
      data: {
        success: false,
        message: "Test generation failed",
        error: errorMessage,
        processingTime: Date.now() - startTime,
      },
    };

    if (res.headersSent) {
      res.write(JSON.stringify(errorResponse) + "\n");
      res.end();
    } else {
      res.status(500).json(errorResponse.data);
    }
    return;
  }
};

// Get test generation status
export const getTestStatus = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;

    const session = await TestSession.findOne({ sessionId });
    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Test session not found",
      });
    }

    return res.json({
      success: true,
      data: {
        sessionId: session.sessionId,
        status: session.status,
        framework: session.framework,
        processingTimeMs: session.processingTimeMs,
        createdAt: session.createdAt,
        completedAt: session.completedAt,
      },
    });
  } catch (error) {
    console.error("Get test status error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get test status",
    });
  }
};

// NEW: Generate tests directly without requiring a pre-existing session
// Creates session automatically after first successful test generation
export const generateTestsDirect = async (req: Request, res: Response) => {
  const startTime = Date.now();
  let createdSession: any = null;

  try {
    // Validate authentication
    const auth = await getAuth();
    const sessionResp = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!sessionResp?.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const {
      repositoryId,
      files,
      framework,
      options = {},
      repoBranch,
    } = req.body as any;

    if (!repositoryId || !files || !framework) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: repositoryId, files, framework",
      });
    }

    // repositoryId can be a string (not necessarily a Mongo ObjectId). No strict validation here.

    // Send initial response with streaming headers for real-time updates
    res.writeHead(200, {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
    });

    // Helper function to send updates
    const sendUpdate = (update: any) => {
      res.write(JSON.stringify(update) + "\n");
    };

    const generatedTests: GeneratedTest[] = [];

    sendUpdate({
      type: "progress",
      data: {
        step: "initialization",
        message: "Starting test generation...",
        progress: 5,
      },
    });

    // Process each file
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const progress = 10 + (i / files.length) * 70;

      sendUpdate({
        type: "progress",
        data: {
          step: "test_generation",
          message: `Generating tests for ${file.path}...`,
          progress,
          fileIndex: i,
          totalFiles: files.length,
        },
      });

      try {
        // Generate code summary
        const summaryPrompt = createCodeSummaryPrompt(file.content);
        const summaryResult = await geminiAI.models.generateContent({
          model: "gemini-2.5-flash",
          contents: summaryPrompt,
        });
        const summaryResponse = summaryResult.text || "";

        let codeSummary;
        try {
          // Remove markdown code blocks if present
          const cleanResponse = summaryResponse
            .replace(/```json\n?|\n?```/g, "")
            .trim();
          codeSummary = JSON.parse(cleanResponse);
        } catch (e) {
          codeSummary = {
            functions: [],
            classes: [],
            dependencies: [],
            complexity: "medium",
            testability: "medium",
          };
        }

        // Generate tests
        const testPrompt = createTestPrompt(file.content, framework, options);
        const testResult = await geminiAI.models.generateContent({
          model: "gemini-2.5-flash",
          contents: testPrompt,
        });

        const testResponse = testResult.text || "";

        let testData;
        try {
          // Remove markdown code blocks if present
          const cleanTestResponse = testResponse
            .replace(/```json\n?|\n?```/g, "")
            .trim();
          testData = JSON.parse(cleanTestResponse);
        } catch (e) {
          console.warn("Failed to parse test JSON, using fallback:", e);
          testData = {
            analysis: { functions: [], classes: [], dependencies: [] },
            testCode: `// Generated test for ${file.path}\n// Test generation failed to parse properly\n`,
            summary: {
              description: "Test generation incomplete",
              testCount: 0,
            },
          };
        }

        // Validate the generated test
        const validation = await validateTestCode(testData.testCode, framework);

        const generatedTest: GeneratedTest = {
          filePath: file.path,
          testCode: testData.testCode,
          summary: {
            description:
              testData.summary?.description || `Tests for ${file.path}`,
            testCount: testData.summary?.testCount || 0,
            coverageAreas:
              testData.analysis?.functions?.map((f: any) => f.name) || [],
            framework,
            dependencies: testData.analysis?.dependencies || [],
          },
          validation,
          metadata: {
            generatedAt: new Date(),
            tokensUsed: {
              prompt: 0, // Would need to calculate if needed
              response: 0,
            },
            model: "gemini-2.5-flash",
            processingTime: Date.now() - startTime,
          },
        };

        generatedTests.push(generatedTest);

        sendUpdate({
          type: "test_generated",
          data: {
            filePath: file.path,
            isValid: validation.isValid,
            testCount: generatedTest.summary.testCount,
            progress: progress + 70 / files.length,
          },
        });
      } catch (error) {
        console.error(`Error generating test for ${file.path}:`, error);

        sendUpdate({
          type: "error",
          data: {
            filePath: file.path,
            error: error instanceof Error ? error.message : "Unknown error",
            progress,
          },
        });
      }
    }

    // Create session first, then test files after successful test generation
    if (generatedTests.length > 0) {
      sendUpdate({
        type: "progress",
        data: {
          step: "session_creation",
          message: "Creating test session...",
          progress: 85,
        },
      });

      try {
        // First create the session
        const sessionId = `session_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`;

        createdSession = new TestSession({
          userId: sessionResp.user.id,
          repositoryId: repositoryId,
          repoBranch,
          sessionId,
          status: "processing", // Will be updated after test files are saved
          framework,
          processingTimeMs: 0, // Will be updated later
          completedAt: null,
        });

        await createdSession.save();

        sendUpdate({
          type: "progress",
          data: {
            step: "saving_tests",
            message: "Saving generated tests...",
            progress: 90,
          },
        });

        // Then save individual test files with session reference
        const savedTestFiles = [];
        for (let i = 0; i < generatedTests.length; i++) {
          const test = generatedTests[i];

          try {
            const testFile = new TestFile({
              sessionId: createdSession._id, // Required reference to session
              userId: sessionResp.user.id,
              repositoryId: repositoryId,
              originalFilePath: test.filePath,
              testCode: test.testCode,
              summary: {
                description: test.summary.description,
                testCount: test.summary.testCount,
                coverageAreas: test.summary.coverageAreas,
                framework: test.summary.framework,
                dependencies: test.summary.dependencies,
              },
              validation: {
                isValid: test.validation.isValid,
                syntax: {
                  valid: test.validation.syntax.valid,
                  errors: test.validation.syntax.errors || [],
                },
                logic: {
                  valid: test.validation.logic.valid,
                  warnings: test.validation.logic.warnings || [],
                },
                coverage: {
                  estimated: test.validation.coverage.estimated,
                  gaps: test.validation.coverage.gaps || [],
                },
                suggestions: test.validation.suggestions || [],
              },
              metadata: {
                generatedAt: test.metadata.generatedAt,
                tokensUsed: {
                  prompt: test.metadata.tokensUsed.prompt,
                  response: test.metadata.tokensUsed.response,
                },
                model: test.metadata.model,
                processingTime: test.metadata.processingTime,
                aiProvider: "google",
              },
              status: test.validation.isValid ? "generated" : "draft",
              isActive: true,
            });

            const savedTestFile = await testFile.save();
            savedTestFiles.push(savedTestFile);
          } catch (saveError) {
            console.error(
              `Error saving test file for ${test.filePath}:`,
              saveError
            );
            // Continue with other files
          }
        }

        // Update session status and completion time
        createdSession.status =
          savedTestFiles.length > 0 ? "completed" : "failed";
        createdSession.processingTimeMs = Date.now() - startTime;
        createdSession.completedAt = new Date();
        await createdSession.save();

        sendUpdate({
          type: "session_created",
          data: {
            sessionId: createdSession.sessionId,
            testFilesCreated: savedTestFiles.length,
            message: "Test session and files created successfully",
            progress: 95,
          },
        });
      } catch (sessionError) {
        console.error("Error creating session:", sessionError);
        // Continue without failing - tests were generated successfully
        sendUpdate({
          type: "warning",
          data: {
            message: "Tests generated successfully but session creation failed",
            error:
              sessionError instanceof Error
                ? sessionError.message
                : "Unknown error",
            progress: 95,
          },
        });
      }
    }

    // Send final results
    sendUpdate({
      type: "completion",
      data: {
        message: "Test generation completed",
        progress: 100,
        generatedTests,
        sessionId: createdSession?.sessionId || null,
        totalFiles: files.length,
        successfulTests: generatedTests.length,
        processingTime: Date.now() - startTime,
      },
    });

    res.end();
    return; // Explicit return after streaming response
  } catch (error) {
    console.error("Direct test generation error:", error);

    // If session was created but an error occurred, update its status
    if (createdSession) {
      try {
        createdSession.status = "failed";
        await createdSession.save();
      } catch (saveError) {
        console.error("Error updating failed session:", saveError);
      }
    }

    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: "Failed to generate tests",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    } else {
      res.write(
        JSON.stringify({
          type: "error",
          data: {
            message: "Test generation failed",
            error: error instanceof Error ? error.message : "Unknown error",
          },
        }) + "\n"
      );
      res.end();
      return; // Explicit return after streaming error response
    }
  }
};

// Get test files for a session
export const getTestFiles = async (req: Request, res: Response) => {
  try {
    const auth = await getAuth();
    const sessionResp = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!sessionResp?.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { sessionId } = req.params;

    // Find the session first
    const session = await TestSession.findOne({ sessionId });
    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Test session not found",
      });
    }

    // Get test files for this session
    const testFiles = await TestFile.find({
      sessionId: session._id,
      userId: sessionResp.user.id,
      isActive: true,
    }).sort({ "metadata.generatedAt": -1 });

    return res.json({
      success: true,
      data: {
        sessionId,
        testFiles: testFiles.map((testFile) => ({
          id: testFile._id,
          originalFilePath: testFile.originalFilePath,
          testFilePath: testFile.testFilePath,
          suggestedTestFileName: testFile.suggestedTestFileName,
          testCode: testFile.testCode,
          summary: testFile.summary,
          validation: testFile.validation,
          metadata: testFile.metadata,
          status: testFile.status,
          validationSummary: testFile.getValidationSummary(),
          coverageScore: testFile.getCoverageScore(),
        })),
      },
    });
  } catch (error) {
    console.error("Get test files error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve test files",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getTestFileByPath = async (req: Request, res: Response) => {
  try {
    const auth = await getAuth();
    const sessionResp = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!sessionResp?.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { filePath, sessionId } = req.params;
    
    // Decode the file path to handle special characters
    const decodedFilePath = safeDecodeFilePath(filePath);
    
    console.log(
      "Fetching test file for path:",
      decodedFilePath,
      "and sessionId:",
      sessionId
    );
    const session_id = await TestSession.findOne({ sessionId: sessionId });
    // Find the test file by its original path
    const testFile = await TestFile.findOne({
      originalFilePath: decodedFilePath,
      sessionId: session_id?._id,
      userId: sessionResp.user.id,
      isActive: true,
    });

    if (!testFile) {
      return res.status(404).json({
        success: false,
        message: "Test file not found",
      });
    }

    return res.json({
      success: true,
      data: {
        sessionId: testFile.sessionId,
        id: testFile._id,
        originalFilePath: testFile.originalFilePath,
        testFilePath: testFile.testFilePath,
        suggestedTestFileName: testFile.suggestedTestFileName,
        testCode: testFile.testCode,
        summary: testFile.summary,
        validation: testFile.validation,
        metadata: testFile.metadata,
        status: testFile.status,
        validationSummary: testFile.getValidationSummary(),
        coverageScore: testFile.getCoverageScore(),
      },
    });
  } catch (error) {
    console.error("Get test file by path error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve test file",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Get test files by repository
export const getTestFilesByRepository = async (req: Request, res: Response) => {
  try {
    const auth = await getAuth();
    const sessionResp = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!sessionResp?.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { repositoryId } = req.params;

    // Get test files for this repository
    const testFiles = await TestFile.findByRepository(
      repositoryId,
      new Types.ObjectId(sessionResp.user.id)
    );

    // Get validation statistics
    const stats = await TestFile.getValidationStats({
      repositoryId: repositoryId,
      userId: new Types.ObjectId(sessionResp.user.id),
    });

    return res.json({
      success: true,
      data: {
        repositoryId,
        testFiles: testFiles.map((testFile) => ({
          id: testFile._id,
          originalFilePath: testFile.originalFilePath,
          testFilePath: testFile.testFilePath,
          suggestedTestFileName: testFile.suggestedTestFileName,
          summary: testFile.summary,
          validation: testFile.validation,
          metadata: testFile.metadata,
          status: testFile.status,
          validationSummary: testFile.getValidationSummary(),
          coverageScore: testFile.getCoverageScore(),
        })),
        statistics: stats[0] || {
          totalTests: 0,
          validTests: 0,
          avgCoverage: 0,
          avgTestCount: 0,
          frameworks: [],
        },
      },
    });
  } catch (error) {
    console.error("Get repository test files error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve repository test files",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Update test file status
export const updateTestFileStatus = async (req: Request, res: Response) => {
  try {
    const auth = await getAuth();
    const sessionResp = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!sessionResp?.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { testFileId } = req.params;
    const { status, testFilePath } = req.body;

    const validStatuses = ["draft", "generated", "saved", "applied"];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    const testFile = await TestFile.findOne({
      _id: testFileId,
      userId: sessionResp.user.id,
      isActive: true,
    });

    if (!testFile) {
      return res.status(404).json({
        success: false,
        message: "Test file not found",
      });
    }

    // Update the test file
    if (status) testFile.status = status;
    if (testFilePath) testFile.testFilePath = testFilePath;

    await testFile.save();

    return res.json({
      success: true,
      message: "Test file updated successfully",
      data: {
        id: testFile._id,
        status: testFile.status,
        testFilePath: testFile.testFilePath,
      },
    });
  } catch (error) {
    console.error("Update test file error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update test file",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
