import { Inngest } from "inngest";
import { realtimeMiddleware, channel, topic } from "@inngest/realtime";
import { Types } from "mongoose";
import TestSession from "../../models/test_session.model";
import TestFile from "../../models/test_file.model";
import { compressTest } from "../../services/compress";

// Import existing functions from AI test controller
import { 
  createTestFile,
  generateTestForFile
} from "../../controllers/ai_test.controller";

// Create a client to send and receive events with realtime middleware
export const inngest = new Inngest({ 
  id: "ai-test-generator",
  name: "AI Test Generator",
  // Add realtime middleware for streaming progress updates
  middleware: [realtimeMiddleware()],
});

// Define realtime channels for progress streaming  
export const testGenerationChannel = channel((sessionId: string) => `test-generation:${sessionId}`)
  .addTopic(
    topic("progress").type<{
      type: string;
      step?: string;
      message?: string;
      progress?: number;
      currentFile?: string;
      fileIndex?: number;
      totalFiles?: number;
      timestamp: string;
      generatedTest?: {
        filePath: string;
        testCode: string;
      };
      summary?: any;
    }>()
  );

// Types for the background job
interface TestGenerationData {
  userId: string;
  repositoryId: string;
  sessionId?: string;
  files: Array<{
    path: string;
    content: string;
    framework?: string;
  }>;
  framework: string;
  repoBranch?: string;
  options?: {
    testTypes?: string[];
    coverage?: "basic" | "comprehensive";
    includeEdgeCases?: boolean;
    mockExternal?: boolean;
  };
}

// Background AI Test Generation Function
const generateAITests = inngest.createFunction(
  { 
    id: "generate-ai-tests", // Fixed ID to match standard naming convention
    name: "Generate AI Tests",
    concurrency: {
      limit: 3, // Process max 3 generations concurrently
    },
    retries: 2,
  },
  { event: "ai-test/generate" },
  async ({ event, step, publish }) => {
    const {
      userId,
      repositoryId,
      sessionId,
      files,
      framework,
      repoBranch = "main",
      options = {},
    } = event.data as TestGenerationData;


    // Step 1: Create or Find Session
    const session = await step.run("create-session", async () => {
      let testSession: any;
      
      if (sessionId) {
        testSession = await TestSession.findOne({ sessionId });
      }
      
      if (!testSession) {
        const newSessionId = sessionId || globalThis.crypto?.randomUUID?.() || `sess_${Date.now()}`;
        testSession = new TestSession({
          sessionId: newSessionId,
          userId: new Types.ObjectId(userId),
          repositoryId,
          status: "processing",
          framework,
          defaultPath: files[0]?.path || "",
          repoBranch,
          testFiles: [],
          createdAt: new Date(),
        });
        await testSession.save();
      } else {
        testSession.status = "processing";
        testSession.framework = framework;
        await testSession.save();
      }

      // Send progress update
      await inngest.send({
        name: "ai-test/progress",
        data: {
          sessionId: testSession.sessionId,
          userId,
          type: "session_created",
          step: "session",
          message: "Session created successfully",
          progress: 10,
          timestamp: new Date(),
        },
      });

      // Publish to Inngest Realtime for frontend streaming
      await publish(
        testGenerationChannel(testSession.sessionId).progress({
          type: "session_created",
          step: "session",
          message: "Session created successfully",
          progress: 10,
          timestamp: new Date().toISOString(),
        })
      );

      return testSession;
    });

    // Step 2: Process Files and Generate Tests
    const generatedTests: any[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileProgress = 10 + ((i / files.length) * 70); // 10-80% for file processing
      
      const testResult = await step.run(`generate-test-${i}`, async () => {
        
        // Send progress update
        await inngest.send({
          name: "ai-test/progress",
          data: {
            sessionId: session.sessionId,
            userId,
            type: "file_processing",
            step: "generation",
            message: `Generating tests for ${file.path}`,
            progress: fileProgress,
            currentFile: file.path,
            fileIndex: i + 1,
            totalFiles: files.length,
            timestamp: new Date(),
          },
        });

        // Publish to Inngest Realtime
        await publish(
          testGenerationChannel(session.sessionId).progress({
            type: "file_processing",
            step: "generation",
            message: `Generating tests for ${file.path}`,
            progress: fileProgress,
            currentFile: file.path,
            fileIndex: i + 1,
            totalFiles: files.length,
            timestamp: new Date().toISOString(),
          })
        );

        try {
          // Use the existing generateTestForFile function
          const generatedTest = await generateTestForFile(
            file.content,
            file.path,
            framework,
            options
          );


          // Publish to Inngest Realtime
          await publish(
            testGenerationChannel(session.sessionId).progress({
              type: "test_generated",
              step: "generation", 
              message: `Generated tests for ${file.path}`,
              progress: Math.min(fileProgress + 5, 85),
              generatedTest: { filePath: file.path, testCode: generatedTest.testCode },
              timestamp: new Date().toISOString(),
            })
          );
          return generatedTest;
          
        } catch (error) {
          console.error(`❌ Failed to generate test for ${file.path}:`, error);
          
          // Create error test result
          return {
            filePath: file.path,
            testCode: "// Test generation failed",
            summary: {
              description: "Test generation failed",
              testCount: 0,
              coverageAreas: [],
              framework,
              dependencies: [],
            },
            validation: {
              isValid: false,
              syntax: { valid: false, errors: [error instanceof Error ? error.message : "Unknown error"] },
              logic: { valid: false },
              coverage: { estimated: 0 },
            },
            metadata: {
              generatedAt: new Date(),
              tokensUsed: { prompt: 0, response: 0 },
              model: "gemini-2.5-flash",
              processingTime: 0,
            },
          };
        }
      });

      generatedTests.push(testResult);
    }

    // Step 3: Save Test Files to Database
    await step.run("save-test-files", async () => {

    const testFilePromises = generatedTests.map(async (test) => {
        const testFile = await createTestFile({
          sessionId: session._id,
          userId: new Types.ObjectId(userId),
          originalFilePath: test.filePath,
          repositoryId: repositoryId,
          testFilePath: test.filePath.replace(/\.(js|ts|jsx|tsx)$/, `.test.$1`),
          testCode: compressTest(test.testCode, "gzip"),
          compressionAlgo: "gzip" as const,
          summary: test.summary,
          validation: test.validation,
          metadata: test.metadata,
          status: test.validation.isValid ? "completed" : "failed",
          isActive: true,
        });

        return testFile;
      });

      const savedFiles = await Promise.all(testFilePromises);
      
      // Update session with test file references
      // session.testFiles = savedFiles.map((file) => file._id);
      // await session.save();

      // Send progress update
      await inngest.send({
        name: "ai-test/progress",
        data: {
          sessionId: session.sessionId,
          userId,
          type: "files_saved",
          step: "saving",
          message: "Test files saved successfully",
          progress: 90,
          timestamp: new Date(),
        },
      });

      // Publish to Inngest Realtime
      await publish(
        testGenerationChannel(session.sessionId).progress({
          type: "files_saved",
          step: "saving",
          message: "Test files saved successfully", 
          progress: 90,
          timestamp: new Date().toISOString(),
        })
      );

    });

    // Step 4: Finalize Session
    await step.run("finalize-session", async () => {
      const successfulTests = generatedTests.filter((t) => t.validation.isValid).length;
      const totalTests = generatedTests.length;
      
      // Use updateOne instead of modifying and saving the session object
      await TestSession.updateOne(
        { sessionId: session.sessionId },
        {
          status: successfulTests === totalTests ? "completed" : "partial",
          completedAt: new Date()
        }
      );

      // Send completion event
      await inngest.send({
        name: "ai-test/completed",
        data: {
          sessionId: session.sessionId,
          userId,
          type: "generation_completed",
          step: "completed",
          message: "AI test generation completed",
          progress: 100,
          summary: {
            totalFiles: totalTests,
            successfulTests,
            failedTests: totalTests - successfulTests,
            totalTestCount: generatedTests.reduce((sum, t) => sum + t.summary.testCount, 0),
            averageCoverage: generatedTests.reduce((sum, t) => sum + t.validation.coverage.estimated, 0) / totalTests,
          },
          generatedTests,
          timestamp: new Date(),
        },
      });

      // Publish final completion to Inngest Realtime
      await publish(
        testGenerationChannel(session.sessionId).progress({
          type: "generation_completed",
          step: "completed",
          message: "AI test generation completed",
          progress: 100,
          summary: {
            totalFiles: totalTests,
            successfulTests,
            failedTests: totalTests - successfulTests,
            totalTestCount: generatedTests.reduce((sum, t) => sum + t.summary.testCount, 0),
            averageCoverage: generatedTests.reduce((sum, t) => sum + t.validation.coverage.estimated, 0) / totalTests,
          },
          timestamp: new Date().toISOString(),
        })
      );

    });

    return {
      sessionId: session.sessionId,
      success: true,
      generatedTests,
      summary: {
        totalFiles: files.length,
        successfulTests: generatedTests.filter((t) => t.validation.isValid).length,
        failedTests: generatedTests.filter((t) => !t.validation.isValid).length,
        totalTestCount: generatedTests.reduce((sum, t) => sum + t.summary.testCount, 0),
      },
    };
  }
);

// Simple hello world function (keeping for testing)
const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    await step.sleep("wait-a-moment", "1s");
    return { message: `Hello ${event.data.email}!` };
  },
);

// Export all functions
export const functions = [
  generateAITests,
  helloWorld,
];