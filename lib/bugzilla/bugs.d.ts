import { WebhookPayloadPullRequestPullRequest } from "@octokit/webhooks";
interface AccountDetail {
    id: number;
    email: string;
    name: string;
    real_name: string;
}
export interface Bug {
    id: number;
    product: string;
    component: string;
    summary: string;
    version: string;
    target_milestone: string;
    serverity: string;
    status: string;
    resolution: string;
    platform: string;
    creation_time: string;
    last_change_time: string;
    creator: string;
    creator_detail: AccountDetail;
    is_creator_accessible: boolean;
    assigned_to: string;
    assigned_to_detail: AccountDetail;
    cc: string[];
    cc_detail: AccountDetail[];
    is_cc_accessible: boolean;
    priority: string;
    deadline: any;
    is_open: boolean;
    is_confirmed: boolean;
    keywords: any[];
    blocks: number[];
    depends_on: number[];
    see_also: number[];
    dupe_of: number | null;
    op_sys: string;
    actual_time: number;
    remaining_time: number;
    update_token: string;
    classification: string;
    qa_contact: string;
    whiteboard: string;
    flags: any[];
    alias: any[];
    groups: any[];
}
export interface BugsResponse {
    bugs: Bug[];
}
export interface BugUpdateParams {
    ids?: number[];
    status?: string;
    resolution?: string;
}
export declare function getBugs(bugs: number[]): Promise<Bug[]>;
export declare function updateBugs(params: BugUpdateParams): Promise<any>;
export declare function changeBugsToFixed(pullRequest: WebhookPayloadPullRequestPullRequest, bugs?: number[]): Promise<any>;
export {};
