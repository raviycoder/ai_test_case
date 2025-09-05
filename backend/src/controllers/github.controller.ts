import { query, type Request, type Response } from "express";
import { getAuth } from "./auth.controller";
import { fromNodeHeaders } from "better-auth/node";
import { accountInfo } from "better-auth/api";
export const isGitHubAccountLinked = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    const {id} = req.params;
    const auth = await getAuth();
    const user = await auth.api.getAccessToken({
      body: { providerId: "github", userId: id },
      headers: fromNodeHeaders(req.headers),
    });
    interface AccountInfoResponse {
      scopes?: string[];
    }

    const typedUser = user as AccountInfoResponse | undefined;

    const isLinked = !!typedUser?.scopes?.includes("repo");

    if (!typedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      isLinked,
    });
  } catch (error) {
    console.error("Error checking GitHub link status:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
