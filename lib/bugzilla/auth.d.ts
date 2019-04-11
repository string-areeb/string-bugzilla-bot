export declare function assertTokenNotNull(token: string | null, message: string): void;
export declare function shouldRefresh(error: any, refresh: boolean): boolean;
export declare function getToken(refresh?: boolean): Promise<string | null>;
export declare const testController: {
    releaseToken: () => Promise<void>;
    setCredentials: (login: string | undefined, pass: string | undefined) => Promise<void>;
};
