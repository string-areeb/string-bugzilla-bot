export declare function getComments(bug: number): Promise<any[]>;
export declare function hasTagComment(comments: any[], tag: string): boolean;
export declare function addFixCommentForPr(pullRequest: any): Promise<any>;
