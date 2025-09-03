import { compressTest, decompressTest } from "../services/compress";
import { Schema, model, Document, Types, Model } from "mongoose";

// Validation subdocument interfaces
export interface IValidationSyntax {
  valid: boolean;
  errors?: string[];
}



export interface IValidationLogic {
  valid: boolean;
  warnings?: string[];
}

export interface IValidationCoverage {
  estimated: number;
  gaps?: string[];
}

export interface IValidation {
  isValid: boolean;
  syntax: IValidationSyntax;
  logic: IValidationLogic;
  coverage: IValidationCoverage;
  suggestions?: string[];
}

// Summary subdocument interface
export interface ITestSummary {
  description: string;
  testCount: number;
  coverageAreas: string[];
  framework: string;
  dependencies: string[];
}

// Token usage subdocument interface
export interface ITokenUsage {
  prompt: number;
  response: number;
}

// Metadata subdocument interface
export interface ITestMetadata {
  generatedAt: Date;
  tokensUsed: ITokenUsage;
  model: string;
  processingTime: number; // in milliseconds
  aiProvider?: string; // e.g. 'google', 'openai', 'anthropic'
}

// Main TestFile document interface
export interface ITestFile extends Document {
  sessionId: Types.ObjectId; // Reference to TestSession (required)
  userId: Types.ObjectId; // Reference to User
  repositoryId: string; // Reference to Repository (string to support non-ObjectId repo ids)
  originalFilePath: string; // Path of the source file being tested
  testFilePath?: string; // Suggested path for the test file
  testCode: Buffer; // The compressed test code
  compressionAlgo: "br" | "gzip"; // Compression algorithm used
  summary: ITestSummary;
  validation: IValidation;
  metadata: ITestMetadata;
  status:
    | "draft"
    | "generated"
    | "saved"
    | "applied"
    | "processing"
    | "completed"
    | "failed"; // Lifecycle status aligned with Inngest events
  isActive: boolean; // Whether this test file is currently active
  createdAt: Date; // Provided by timestamps
  updatedAt: Date; // Provided by timestamps

  // Virtual properties
  suggestedTestFileName: string;

  // Instance methods
  getCoverageScore(): string;
  getValidationSummary(): { score: number; issues: number; status: string };
}

// Static methods interface
export interface ITestFileModel extends Model<ITestFile> {
  findBySession(sessionId: Types.ObjectId): Promise<ITestFile[]>;
  findByRepository(
    repositoryId: string,
    userId: Types.ObjectId
  ): Promise<ITestFile[]>;
  getValidationStats(filter?: any): Promise<any[]>;
  getPathNames(
    repositoryId: string,
    sessionId: Types.ObjectId
  ): Promise<string[]>;
}

// Subdocument schemas
const ValidationSyntaxSchema = new Schema<IValidationSyntax>(
  {
    valid: { type: Boolean, required: true },
    errors: [{ type: String, trim: true }],
  },
  { _id: false }
);

const ValidationLogicSchema = new Schema<IValidationLogic>(
  {
    valid: { type: Boolean, required: true },
    warnings: [{ type: String, trim: true }],
  },
  { _id: false }
);

const ValidationCoverageSchema = new Schema<IValidationCoverage>(
  {
    estimated: { type: Number, required: true, min: 0, max: 100 },
    gaps: [{ type: String, trim: true }],
  },
  { _id: false }
);

const ValidationSchema = new Schema<IValidation>(
  {
    isValid: { type: Boolean, required: true },
    syntax: { type: ValidationSyntaxSchema, required: true },
    logic: { type: ValidationLogicSchema, required: true },
    coverage: { type: ValidationCoverageSchema, required: true },
    suggestions: [{ type: String, trim: true }],
  },
  { _id: false }
);

const TestSummarySchema = new Schema<ITestSummary>(
  {
    description: { type: String, required: true, trim: true },
    testCount: { type: Number, required: true, min: 0 },
    coverageAreas: [{ type: String, trim: true }],
    framework: { type: String, required: true, trim: true },
    dependencies: [{ type: String, trim: true }],
  },
  { _id: false }
);

const TokenUsageSchema = new Schema<ITokenUsage>(
  {
    prompt: { type: Number, default: 0, min: 0 },
    response: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

const TestMetadataSchema = new Schema<ITestMetadata>(
  {
    generatedAt: { type: Date, required: true },
    tokensUsed: { type: TokenUsageSchema, required: true },
    model: { type: String, required: true, trim: true },
    processingTime: { type: Number, required: true, min: 0 },
    aiProvider: { type: String, trim: true, lowercase: true },
  },
  { _id: false }
);

// Main TestFile schema
const TestFileSchema = new Schema<ITestFile>(
  {
    sessionId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "TestSession",
    },
    userId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    repositoryId: { type: String, required: true },
    originalFilePath: { type: String, required: true, trim: true },
    testFilePath: { type: String, trim: true },
    testCode: { type: Buffer, required: true },
    compressionAlgo: { type: String, enum: ["br", "gzip"], default: "br" },
    summary: { type: TestSummarySchema, required: true },
    validation: { type: ValidationSchema, required: true },
    metadata: { type: TestMetadataSchema, required: true },
    status: {
      type: String,
      enum: [
        "draft",
        "generated",
        "saved",
        "applied",
        "processing",
        "completed",
        "failed",
      ],
      default: "generated",
    },
    isActive: { type: Boolean, default: true },
  },
  {
    collection: "test_files",
    timestamps: { createdAt: "createdAt", updatedAt: true },
  }
);

// Indexes for performance
TestFileSchema.index({ sessionId: 1 });
TestFileSchema.index({ userId: 1, repositoryId: 1 });
TestFileSchema.index({ originalFilePath: 1 });
TestFileSchema.index({ status: 1, isActive: 1 });
TestFileSchema.index({ "metadata.generatedAt": -1 });
TestFileSchema.index({ "validation.isValid": 1 });

// Virtual for test file name suggestion
TestFileSchema.virtual("suggestedTestFileName").get(function () {
  const originalPath = this.originalFilePath;
  const pathParts = originalPath.split("/");
  const fileName = pathParts[pathParts.length - 1];
  const nameWithoutExt = fileName.split(".")[0];

  // Generate test file name based on framework
  const framework = this.summary.framework.toLowerCase();
  if (framework.includes("jest") || framework.includes("vitest")) {
    return `${nameWithoutExt}.test.${fileName.split(".")[1] || "js"}`;
  } else if (framework.includes("mocha")) {
    return `${nameWithoutExt}.spec.${fileName.split(".")[1] || "js"}`;
  } else {
    return `${nameWithoutExt}.test.${fileName.split(".")[1] || "js"}`;
  }
});


// Instance method to calculate coverage score
TestFileSchema.methods.getCoverageScore = function (): string {
  const coverage = this.validation.coverage.estimated;
  if (coverage >= 90) return "excellent";
  if (coverage >= 75) return "good";
  if (coverage >= 60) return "fair";
  return "poor";
};

// Instance method to get validation summary
TestFileSchema.methods.getValidationSummary = function (): {
  score: number;
  issues: number;
  status: string;
} {
  const { syntax, logic, coverage } = this.validation;
  const syntaxIssues = syntax.errors?.length || 0;
  const logicIssues = logic.warnings?.length || 0;
  const coverageGaps = coverage.gaps?.length || 0;

  const totalIssues = syntaxIssues + logicIssues + coverageGaps;
  const score = Math.max(
    0,
    100 - syntaxIssues * 10 - logicIssues * 5 - coverageGaps * 3
  );

  let status = "excellent";
  if (totalIssues > 0) status = "good";
  if (totalIssues > 3) status = "fair";
  if (totalIssues > 6) status = "poor";

  return { score, issues: totalIssues, status };
};

// Static method to find tests by session
TestFileSchema.statics.findBySession = function (sessionId: Types.ObjectId) {
  return this.find({ sessionId, isActive: true }).sort({
    "metadata.generatedAt": -1,
  });
};

// Static method to find tests by repository
TestFileSchema.statics.findByRepository = function (
  repositoryId: string,
  userId: Types.ObjectId
) {
  return this.find({ repositoryId, userId, isActive: true }).sort({
    "metadata.generatedAt": -1,
  });
};

// Static method to get validation statistics
TestFileSchema.statics.getValidationStats = function (filter: any = {}) {
  return this.aggregate([
    { $match: { isActive: true, ...filter } },
    {
      $group: {
        _id: null,
        totalTests: { $sum: 1 },
        validTests: { $sum: { $cond: ["$validation.isValid", 1, 0] } },
        avgCoverage: { $avg: "$validation.coverage.estimated" },
        avgTestCount: { $avg: "$summary.testCount" },
        frameworks: { $addToSet: "$summary.framework" },
      },
    },
  ]);
};

// only give path names
TestFileSchema.statics.getPathNames = function (
  repositoryId: string,
  sessionId: Types.ObjectId
) {
  return this.find(
    { repositoryId, sessionId, isActive: true },
    "originalFilePath"
  ).then((files: any[]) => {
    return files.map((file) => file.originalFilePath);
  });
};

export const TestFile = model<ITestFile, ITestFileModel>(
  "TestFile",
  TestFileSchema,
  "test_files"
);

export default TestFile;
