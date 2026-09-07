export type DashboardFilterItem = {
    id: string;
    name: string;
    path?: string;
};

export type DashboardItemFilters = {
    ou?: DashboardFilterItem[];
    pe?: DashboardFilterItem[];
    [dimensionId: string]: DashboardFilterItem[] | undefined;
};

export type DashboardMode = "view" | "edit" | "print";

export type DashboardItemDetails = {
    itemTitle?: string;
    appUrl?: string;
    onRemove?: () => Promise<void>;
};

export type DashboardPluginProps = {
    dashboardItemId: string;
    dashboardItemFilters: DashboardItemFilters;
    dashboardMode: DashboardMode;
    setDashboardItemDetails: (details: DashboardItemDetails) => void;
};

export type DashboardItemType =
    | "VISUALIZATION"
    | "EVENT_VISUALIZATION"
    | "EVENT_CHART"
    | "MAP"
    | "EVENT_REPORT"
    | "USERS"
    | "REPORTS"
    | "RESOURCES"
    | "TEXT"
    | "MESSAGES"
    | "APP";

export type displayRef = {
    id: string;
    displayName: string;
};

type DashboardItemBase = {
    id: string;
    x?: number;
    y?: number;
};

export type DashboardItem =
    | (DashboardItemBase & { type: "VISUALIZATION"; visualization: displayRef })
    | (DashboardItemBase & { type: "EVENT_VISUALIZATION"; eventVisualization: displayRef })
    | (DashboardItemBase & { type: "EVENT_CHART"; eventChart: displayRef })
    | (DashboardItemBase & { type: "MAP"; map: displayRef })
    | (DashboardItemBase & { type: "EVENT_REPORT"; eventReport: displayRef })
    | (DashboardItemBase & { type: "REPORTS"; reports: displayRef[] })
    | (DashboardItemBase & { type: "RESOURCES"; resources: displayRef[] })
    | (DashboardItemBase & { type: "TEXT"; text: string })
    | (DashboardItemBase & { type: "MESSAGES" })
    | (DashboardItemBase & { type: "USERS" })
    | (DashboardItemBase & { type: "APP" });

export type Dashboard = {
    id: string;
    name: string;
    dashboardItems: DashboardItem[];
};

export type DashboardsQueryResult = {
    dashboards: { dashboards: Dashboard[] };
};
