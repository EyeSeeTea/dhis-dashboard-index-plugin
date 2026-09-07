import i18n from "@dhis2/d2-i18n";
import { useSavedObject, useSetting } from "@dhis2/app-service-datastore";
import { DashboardItemType } from "./Plugin.types";

export type IndexableItemType = Exclude<DashboardItemType, "APP" | "USERS" | "TEXT"> | "TEXT_MARKDOWN" | "TEXT_PLAIN";

export const INDEXABLE_ITEM_TYPES: IndexableItemType[] = [
    "TEXT_MARKDOWN",
    "TEXT_PLAIN",
    "VISUALIZATION",
    "EVENT_VISUALIZATION",
    "EVENT_CHART",
    "MAP",
    "EVENT_REPORT",
    "REPORTS",
    "RESOURCES",
    "MESSAGES",
];

export const FALLBACK_ENABLED_ITEM_TYPES: IndexableItemType[] = ["TEXT_MARKDOWN"];

const DEFAULT_ENABLED_ITEM_TYPES_SETTING_KEY = "defaultEnabledItemTypes";

export const DEFAULT_GLOBAL_SETTINGS = {
    [DEFAULT_ENABLED_ITEM_TYPES_SETTING_KEY]: FALLBACK_ENABLED_ITEM_TYPES,
};

export function useDefaultEnabledItemTypes(): IndexableItemType[] {
    const [value] = useSetting(DEFAULT_ENABLED_ITEM_TYPES_SETTING_KEY, { global: true }) as [unknown, unknown];

    return resolveEnabledItemTypes(value, FALLBACK_ENABLED_ITEM_TYPES);
}

export function getItemTypeLabel(type: IndexableItemType): string {
    switch (type) {
        case "TEXT_MARKDOWN":
            return i18n.t("Text (with markdown header)");
        case "TEXT_PLAIN":
            return i18n.t("Text (plain)");
        case "VISUALIZATION":
            return i18n.t("Visualizations");
        case "EVENT_VISUALIZATION":
            return i18n.t("Event visualizations");
        case "EVENT_CHART":
            return i18n.t("Event charts");
        case "MAP":
            return i18n.t("Maps");
        case "EVENT_REPORT":
            return i18n.t("Event reports");
        case "REPORTS":
            return i18n.t("Reports");
        case "RESOURCES":
            return i18n.t("Resources");
        case "MESSAGES":
            return i18n.t("Messages");
    }
}

export type PluginConfig = {
    itemTypes: IndexableItemType[];
};

export function resolveEnabledItemTypes(itemTypes: unknown, fallback: IndexableItemType[]): IndexableItemType[] {
    if (!Array.isArray(itemTypes)) {
        return fallback;
    }

    const validTypes = itemTypes.filter((type): type is IndexableItemType => INDEXABLE_ITEM_TYPES.includes(type));

    return validTypes.length > 0 ? validTypes : fallback;
}

export function useEnabledItemTypes(
    dashboardItemId: string
): [IndexableItemType[], (itemTypes: IndexableItemType[]) => Promise<PluginConfig>] {
    const [savedConfig, { update }] = useSavedObject(dashboardItemId) as [
        PluginConfig | undefined,
        { update: (config: PluginConfig) => Promise<PluginConfig> },
    ];

    const defaultEnabledItemTypes = useDefaultEnabledItemTypes();
    const enabledTypes = resolveEnabledItemTypes(savedConfig?.itemTypes, defaultEnabledItemTypes);

    function setEnabledItemTypes(itemTypes: IndexableItemType[]) {
        return update({ itemTypes });
    }

    return [enabledTypes, setEnabledItemTypes];
}
