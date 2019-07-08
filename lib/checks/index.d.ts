import { Context } from "probot";
import { PullRequestsGetResponse } from "@octokit/rest";
export declare function handlePullRequestChange(context: Context, pullRequest?: PullRequestsGetResponse | null): Promise<void>;
export declare function handleCheckRun(context: Context): Promise<void>;
export declare function handleCheckSuite(context: Context): Promise<void>;
