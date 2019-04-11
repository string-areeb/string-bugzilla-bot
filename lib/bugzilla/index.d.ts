declare const _default: {
    getComments(bug: number, refresh?: boolean): Promise<any[]>;
    hasTagComment(comments: any[], tag: string): boolean;
    isBugAlreadyCommentedOn(bug: number, tag: string): Promise<Boolean>;
    addCommentTag(id: number, tag: string, refresh?: boolean): Promise<any>;
    comment(bug: number, tag: string, comment: string, refresh?: boolean): Promise<any>;
    getPullRequestFixingMessage(pullRequest: any): string;
    addFixComment(bug: number, pullRequest: any): Promise<any>;
    addFixCommentForPr(pullRequest: any): Promise<any>;
};
export = _default;
