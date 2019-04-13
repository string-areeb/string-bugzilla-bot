interface TagContainer {
    tags: string[];
}
interface Comment extends TagContainer {
    id: number;
    bug_id: number;
    text: string;
    count: number;
    creator: string;
    attachment_id: string;
    creation_time: string;
    is_private: boolean;
}
export declare function getComments(bug: number): Promise<Comment[]>;
export declare function hasTagComment(comments: TagContainer[], tag: string): boolean;
export declare function addFixCommentForPr(pullRequest: any): Promise<any>;
export {};
