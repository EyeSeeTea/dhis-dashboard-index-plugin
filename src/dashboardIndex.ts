import { Dashboard, DashboardItem } from "./Plugin.types";
import { IndexableItemType, INDEXABLE_ITEM_TYPES } from "./itemTypeOptions";

// Spacer widgets are stored as a TEXT item with this fixed content
const SPACER_TEXT = "SPACER_ITEM_FOR_DASHBOARD_LAYOUT_CONVENIENCE";

export type IndexEntry = {
    id: string;
    name: string;
};

export type IndexedDashboard = {
    id: string;
    items: IndexEntry[];
};

function isIndexableItemType(type: unknown): type is IndexableItemType {
    return INDEXABLE_ITEM_TYPES.includes(type as IndexableItemType);
}

function getTextElementHeader(item: Extract<DashboardItem, { type: "TEXT" }>): string | undefined {
    // using the HTML rendered markdown doesnt work because the text widget may not be rendered yet
    const match = item.text.match(/^#\s+(.+)$/m);
    return match?.at(1)?.trim() || undefined;
}

function getIndexableType(item: DashboardItem, textHeader: string | undefined): IndexableItemType | null {
    if (item.type === "TEXT") {
        if (item.text === SPACER_TEXT) {
            return null;
        }

        return textHeader ? "TEXT_MARKDOWN" : "TEXT_PLAIN";
    }

    return isIndexableItemType(item.type) ? item.type : null;
}

function getItemName(item: DashboardItem, textHeader: string | undefined): string {
    switch (item.type) {
        case "VISUALIZATION":
            return item.visualization.displayName;
        case "EVENT_VISUALIZATION":
            return item.eventVisualization.displayName;
        case "EVENT_CHART":
            return item.eventChart.displayName;
        case "MAP":
            return item.map.displayName;
        case "EVENT_REPORT":
            return item.eventReport.displayName;
        case "REPORTS":
            return item.reports.at(0)?.displayName ?? "Reports";
        case "RESOURCES":
            return item.resources.at(0)?.displayName ?? "Resources";
        case "TEXT":
            return textHeader ?? "Text Element";
        case "MESSAGES":
            return "Messages";
        default:
            return item.type;
    }
}

function sortByCoordinates(a: DashboardItem, b: DashboardItem): number {
    const yDelta = (a.y ?? 0) - (b.y ?? 0);
    return yDelta !== 0 ? yDelta : (a.x ?? 0) - (b.x ?? 0);
}

export function computeDashboardIndex(dashboard: Dashboard, enabledTypes: IndexableItemType[]): IndexedDashboard {
    const items = dashboard.dashboardItems
        .map(item => ({
            item,
            textHeader: item.type === "TEXT" ? getTextElementHeader(item) : undefined,
        }))
        .filter(({ item, textHeader }) => {
            const indexableType = getIndexableType(item, textHeader);
            return indexableType !== null && enabledTypes.includes(indexableType);
        })
        .sort((a, b) => sortByCoordinates(a.item, b.item))
        .map(({ item, textHeader }) => ({
            id: item.id,
            name: getItemName(item, textHeader),
        }));

    return { id: dashboard.id, items };
}
