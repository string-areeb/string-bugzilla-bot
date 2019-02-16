declare const _default: {
    getToken(refresh?: boolean): Promise<string | null>;
    releaseToken(): void;
    setCredentials(login: string | undefined, pass: string | undefined): void;
    getComments(bug: number, refresh?: boolean): Promise<any[]>;
    hasTagComment(comments: any[], tag: string): boolean;
    isBugAlreadyCommentedOn(bug: number, tag: string): Promise<Boolean>;
    addCommentTag(id: number, tag: string, refresh?: boolean): Promise<any>;
    comment(bug: number, tag: string, comment: string, refresh?: boolean): Promise<any>;
};
export = _default;
