import type {WidgetInstance} from "../components/settings/widgets/type.ts";


export interface WidgetPreset {
    id: string;
    name: string;
    createdAt: number;
    widgets: WidgetInstance[];
    gridSize: { cols: number; rows: number };
}
