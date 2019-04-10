declare function getBugzillaLink(bug: string | number, reference?: string | number): string;
declare const _default: {
    replaceLinks(body: string): string;
    getBugzillaLink: typeof getBugzillaLink;
    getFixedIssueNumbers(body: string): number[];
    getFixedRenderedIssueNumbers(body: string): number[];
};
export = _default;
