interface Summary {
    bugs: Number[];
    count: Number;
}
export declare function getSummary(product: string, targetMilestone: string): Promise<Summary>;
export {};
