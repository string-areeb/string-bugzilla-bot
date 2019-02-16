declare const _default: {
    getToken(refresh?: boolean): Promise<string | null>;
    releaseToken(): void;
    setCredentials(login: string | undefined, pass: string | undefined): void;
    getComments(bug: number, refresh?: boolean): Promise<any[]>;
    hasTagComment(comments: any[]): boolean;
    isBugAlreadyCommentedOn(bug: number): Promise<Boolean>;
};
export = _default;
