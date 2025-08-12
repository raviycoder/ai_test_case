import { Schema, model, Document, Types } from "mongoose";

// Selected file subdocument type
export interface ISelectedFile {
	testFileId: Types.ObjectId;
	path: string;
	framework: string; // e.g. jest, vitest, mocha
	aiProvider?: string; // e.g. openai, gemini, anthropic
	aiModel?: string; // e.g. gpt-4o, gemini-2.5-flash
	promptTokens?: number;
	responseTokens?: number;
	included: boolean;
}

export type TestSessionStatus = "pending" | "processing" | "completed" | "failed";

export interface ITestSession extends Document {
	userId: Types.ObjectId;
	repositoryId: Types.ObjectId;
	sessionId: string;
	status: TestSessionStatus;
	framework?: string; // overall framework selected for session, e.g. jest
	selectedFiles: ISelectedFile[];
	processingTimeMs?: number;
	createdAt: Date; // provided by timestamps
	updatedAt: Date; // provided by timestamps
	completedAt?: Date | null;
}

const SelectedFileSchema = new Schema<ISelectedFile>(
	{
		testFileId: { type: Schema.Types.ObjectId, required: true },
		path: { type: String, required: true, trim: true },
		framework: { type: String, required: true, trim: true },
		aiProvider: { type: String, trim: true },
		aiModel: { type: String, trim: true },
		promptTokens: { type: Number, default: 0, min: 0 },
		responseTokens: { type: Number, default: 0, min: 0 },
		included: { type: Boolean, default: true },
	},
	{ _id: false }
);

const TestSessionSchema = new Schema<ITestSession>(
	{
		userId: { type: Schema.Types.ObjectId, required: true },
		repositoryId: { type: Schema.Types.ObjectId, required: true },
		sessionId: { type: String, required: true },
		status: {
			type: String,
			enum: ["pending", "processing", "completed", "failed"],
			default: "pending",
		},
		framework: { type: String, trim: true },
		selectedFiles: { type: [SelectedFileSchema], default: [] },
		processingTimeMs: { type: Number, default: 0, min: 0 },
		completedAt: { type: Date, default: null },
	},
	{
		collection: "test_sessions",
		timestamps: { createdAt: "createdAt", updatedAt: true },
	}
);

// Indexes
TestSessionSchema.index({ sessionId: 1 }, { unique: true });
TestSessionSchema.index({ userId: 1, repositoryId: 1 });

export const TestSession = model<ITestSession>(
	"TestSession",
	TestSessionSchema,
	"test_sessions"
);

export default TestSession;

