import type { Request, Response } from "express";
import { getAuth } from "./auth.controller";
export const isGitHubAccountLinked = async (req: Request<{ id: string }>, res: Response) => {
  const auth = await getAuth();
  const { id } = req.params;
  const user = await auth.api.accountInfo({ accountId: id });
  console.log("User accounts:", user);
  interface GitHubLinkedAccount {
    scopes: string[];
  }

  interface AccountInfoResponse {
    account?: GitHubLinkedAccount[] | null;
  }

  const typedUser = user as AccountInfoResponse | undefined;

  res.status(200).json({
    isLinked: typedUser?.account?.some((account: GitHubLinkedAccount) =>
      account.scopes.includes("repo")
    )
  });
};
