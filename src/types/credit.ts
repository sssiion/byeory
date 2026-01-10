export interface DailyQuest {
    id: string;
    description: string;
    reward: number;
    isCompleted: boolean;
    isClaimable: boolean;
    type: "login" | "time" | "widget" | "post";
    targetValue?: number;
}
