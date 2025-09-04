import { Schema, model, Document, Types } from "mongoose";

export type TestSessionStatus = "pending" | "processing" | "completed" | "failed";

export interface ITestSession extends Document {
	userId: Types.ObjectId;
	repositoryId: string;
	repoBranch?: string;
	defaultPath?: string;
	sessionId: string;
	status: TestSessionStatus;
	countFiles?: number;
	framework?: string; // overall framework selected for session, e.g. jest
	processingTimeMs?: number;
	createdAt: Date; // provided by timestamps
	updatedAt: Date; // provided by timestamps
	completedAt?: Date | null;
}

const TestSessionSchema = new Schema<ITestSession>(
	{
		userId: { type: Schema.Types.ObjectId, required: true },
		repositoryId: { type: String, required: true },
		repoBranch: { type: String, trim: true },
		defaultPath: {type: String, default: ""},
		sessionId: { type: String, required: true },
		countFiles: { type: Number, default: 0, min: 0 },
		status: {
			type: String,
			enum: ["pending", "processing", "completed", "failed"],
			default: "pending",
		},
		framework: { type: String, trim: true },
		processingTimeMs: { type: Number, default: 0, min: 0 },
		completedAt: { type: Date, default: null }
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

