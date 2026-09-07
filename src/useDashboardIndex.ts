import { useDataQuery } from "@dhis2/app-runtime";
import { DashboardsQueryResult } from "./Plugin.types";
import { computeDashboardIndex, IndexedDashboard } from "./dashboardIndex";
import { useEnabledItemTypes } from "./itemTypeOptions";

const DASHBOARD_ITEM_FIELDS = [
    "visualization[id,displayName]",
    "eventVisualization[id,displayName]",
    "eventChart[id,displayName]",
    "map[id,displayName]",
    "eventReport[id,displayName]",
    "reports[id,displayName]",
    "resources[id,displayName]",
    "messages",
].join(",");

export type DashboardIndexState =
    | { status: "loading" }
    | { status: "error"; message: string }
    | { status: "empty" }
    | { status: "ready"; dashboard: IndexedDashboard };

export function useDashboardIndex(dashboardItemId: string): DashboardIndexState {
    const [enabledTypes] = useEnabledItemTypes(dashboardItemId);

    const { loading, error, data } = useDataQuery<DashboardsQueryResult>({
        dashboards: {
            resource: "dashboards",
            params: {
                fields: ["id", "name", `dashboardItems[id,type,text,x,y,${DASHBOARD_ITEM_FIELDS}]`],
                filter: `dashboardItems.id:eq:${dashboardItemId}`,
            },
        },
    });

    if (loading) {
        return { status: "loading" };
    }

    if (error) {
        return { status: "error", message: error.message };
    }

    // Each plugin instance has an unique dashboardItem id, so the API query returns at most one dashboard.
    const dashboard = data?.dashboards?.dashboards?.at(0);
    if (!dashboard) {
        return { status: "empty" };
    }

    return { status: "ready", dashboard: computeDashboardIndex(dashboard, enabledTypes) };
}
