import { describe, it, expect } from "@jest/globals";
import { Dashboard, DashboardItem, displayRef } from "./Plugin.types";
import { computeDashboardIndex } from "./dashboardIndex";
import { INDEXABLE_ITEM_TYPES, FALLBACK_ENABLED_ITEM_TYPES } from "./itemTypeOptions";

const SPACER_TEXT = "SPACER_ITEM_FOR_DASHBOARD_LAYOUT_CONVENIENCE";

function ref(id: string, displayName: string): displayRef {
    return { id, displayName };
}

function visualization(id: string, displayName: string, coords: { x?: number; y?: number } = {}): DashboardItem {
    return { id, type: "VISUALIZATION", visualization: ref(`${id}-ref`, displayName), ...coords };
}

function eventVisualization(id: string, displayName: string, coords: { x?: number; y?: number } = {}): DashboardItem {
    return { id, type: "EVENT_VISUALIZATION", eventVisualization: ref(`${id}-ref`, displayName), ...coords };
}

function eventChart(id: string, displayName: string, coords: { x?: number; y?: number } = {}): DashboardItem {
    return { id, type: "EVENT_CHART", eventChart: ref(`${id}-ref`, displayName), ...coords };
}

function map(id: string, displayName: string, coords: { x?: number; y?: number } = {}): DashboardItem {
    return { id, type: "MAP", map: ref(`${id}-ref`, displayName), ...coords };
}

function eventReport(id: string, displayName: string, coords: { x?: number; y?: number } = {}): DashboardItem {
    return { id, type: "EVENT_REPORT", eventReport: ref(`${id}-ref`, displayName), ...coords };
}

function reports(id: string, displayNames: string[], coords: { x?: number; y?: number } = {}): DashboardItem {
    return { id, type: "REPORTS", reports: displayNames.map((name, i) => ref(`${id}-ref-${i}`, name)), ...coords };
}

function resources(id: string, displayNames: string[], coords: { x?: number; y?: number } = {}): DashboardItem {
    return { id, type: "RESOURCES", resources: displayNames.map((name, i) => ref(`${id}-ref-${i}`, name)), ...coords };
}

function text(id: string, textContent: string, coords: { x?: number; y?: number } = {}): DashboardItem {
    return { id, type: "TEXT", text: textContent, ...coords };
}

function messages(id: string, coords: { x?: number; y?: number } = {}): DashboardItem {
    return { id, type: "MESSAGES", ...coords };
}

function users(id: string, coords: { x?: number; y?: number } = {}): DashboardItem {
    return { id, type: "USERS", ...coords };
}

function app(id: string, coords: { x?: number; y?: number } = {}): DashboardItem {
    return { id, type: "APP", ...coords };
}

function dashboard(id: string, items: DashboardItem[]): Dashboard {
    return { id, name: `Dashboard ${id}`, dashboardItems: items };
}

function names(indexedDashboard: ReturnType<typeof computeDashboardIndex>): string[] {
    return indexedDashboard.items.map(item => item.name);
}

describe("computeDashboardIndex", () => {
    describe("item type filtering", () => {
        it("includes an item when its type is enabled", () => {
            const result = computeDashboardIndex(dashboard("d1", [visualization("v1", "My Visualization")]), [
                "VISUALIZATION",
            ]);
            expect(names(result)).toEqual(["My Visualization"]);
        });

        it("excludes an item when its type is not enabled", () => {
            const result = computeDashboardIndex(dashboard("d1", [visualization("v1", "My Visualization")]), ["MAP"]);
            expect(names(result)).toEqual([]);
        });

        it("excludes USERS items regardless of which types are enabled", () => {
            const result = computeDashboardIndex(dashboard("d1", [users("u1")]), INDEXABLE_ITEM_TYPES);
            expect(names(result)).toEqual([]);
        });

        it("excludes APP items regardless of which types are enabled", () => {
            const result = computeDashboardIndex(dashboard("d1", [app("a1")]), INDEXABLE_ITEM_TYPES);
            expect(names(result)).toEqual([]);
        });
    });

    describe("text items", () => {
        it("classifies a text item with an H1 header as TEXT_MARKDOWN and uses the header as its name", () => {
            const result = computeDashboardIndex(dashboard("d1", [text("t1", "# Section header\nsome body text")]), [
                "TEXT_MARKDOWN",
            ]);
            expect(names(result)).toEqual(["Section header"]);
        });

        it("does not treat an H2+ line as a markdown header", () => {
            const testDashboard = dashboard("d1", [text("t1", "## Not an H1")]);
            expect(names(computeDashboardIndex(testDashboard, ["TEXT_MARKDOWN"]))).toEqual([]);
            expect(names(computeDashboardIndex(testDashboard, ["TEXT_PLAIN"]))).toEqual(["Text Element"]);
        });

        it("classifies a text item without any header as TEXT_PLAIN named 'Text Element'", () => {
            const testDashboard = dashboard("d1", [text("t1", "just some text, no header")]);
            expect(names(computeDashboardIndex(testDashboard, ["TEXT_MARKDOWN"]))).toEqual([]);
            expect(names(computeDashboardIndex(testDashboard, ["TEXT_PLAIN"]))).toEqual(["Text Element"]);
        });

        it("falls back to 'Text Element' when the header line is only whitespace", () => {
            const result = computeDashboardIndex(dashboard("d1", [text("t1", "#    ")]), ["TEXT_PLAIN"]);
            expect(names(result)).toEqual(["Text Element"]);
        });

        it("trims surrounding whitespace from the header", () => {
            const result = computeDashboardIndex(dashboard("d1", [text("t1", "#   Padded header   ")]), [
                "TEXT_MARKDOWN",
            ]);
            expect(names(result)).toEqual(["Padded header"]);
        });

        it("uses only the first H1 header found", () => {
            const result = computeDashboardIndex(dashboard("d1", [text("t1", "# First\nbody\n# Second")]), [
                "TEXT_MARKDOWN",
            ]);
            expect(names(result)).toEqual(["First"]);
        });

        it("excludes a layout spacer item regardless of which text types are enabled", () => {
            const result = computeDashboardIndex(dashboard("d1", [text("t1", SPACER_TEXT)]), [
                "TEXT_MARKDOWN",
                "TEXT_PLAIN",
            ]);
            expect(names(result)).toEqual([]);
        });
    });

    describe("naming", () => {
        it.each([
            ["EVENT_VISUALIZATION", "My Event Viz", eventVisualization] as const,
            ["EVENT_CHART", "My Event Chart", eventChart] as const,
            ["MAP", "My Map", map] as const,
            ["EVENT_REPORT", "My Event Report", eventReport] as const,
        ])("names a %s item after its displayName", (type, displayName, makeItem) => {
            const result = computeDashboardIndex(dashboard("d1", [makeItem("i1", displayName)]), [type]);
            expect(names(result)).toEqual([displayName]);
        });

        it("uses the first entry's displayName for REPORTS with multiple entries", () => {
            const result = computeDashboardIndex(dashboard("d1", [reports("r1", ["First report", "Second report"])]), [
                "REPORTS",
            ]);
            expect(names(result)).toEqual(["First report"]);
        });

        it("falls back to 'Reports' when the reports array is empty", () => {
            const result = computeDashboardIndex(dashboard("d1", [reports("r1", [])]), ["REPORTS"]);
            expect(names(result)).toEqual(["Reports"]);
        });

        it("uses the first entry's displayName for RESOURCES with multiple entries", () => {
            const result = computeDashboardIndex(
                dashboard("d1", [resources("r1", ["First resource", "Second resource"])]),
                ["RESOURCES"]
            );
            expect(names(result)).toEqual(["First resource"]);
        });

        it("falls back to 'Resources' when the resources array is empty", () => {
            const result = computeDashboardIndex(dashboard("d1", [resources("r1", [])]), ["RESOURCES"]);
            expect(names(result)).toEqual(["Resources"]);
        });

        it("names MESSAGES items 'Messages'", () => {
            const result = computeDashboardIndex(dashboard("d1", [messages("m1")]), ["MESSAGES"]);
            expect(names(result)).toEqual(["Messages"]);
        });
    });

    describe("sorting", () => {
        it("sorts items by y coordinate ascending", () => {
            const testDashboard = dashboard("d1", [
                visualization("v1", "Bottom", { y: 10 }),
                visualization("v2", "Top", { y: 0 }),
                visualization("v3", "Middle", { y: 5 }),
            ]);
            expect(names(computeDashboardIndex(testDashboard, ["VISUALIZATION"]))).toEqual(["Top", "Middle", "Bottom"]);
        });

        it("breaks ties on y with x coordinate ascending", () => {
            const testDashboard = dashboard("d1", [
                visualization("v1", "Right", { y: 0, x: 10 }),
                visualization("v2", "Left", { y: 0, x: 0 }),
            ]);
            expect(names(computeDashboardIndex(testDashboard, ["VISUALIZATION"]))).toEqual(["Left", "Right"]);
        });

        it("treats missing x/y as 0 when sorting", () => {
            const testDashboard = dashboard("d1", [
                visualization("v1", "Positioned", { y: 5 }),
                visualization("v2", "No coordinates"),
                visualization("v3", "Above origin", { y: -5 }),
            ]);
            expect(names(computeDashboardIndex(testDashboard, ["VISUALIZATION"]))).toEqual([
                "Above origin",
                "No coordinates",
                "Positioned",
            ]);
        });
    });

    describe("real-world dashboard fixture", () => {
        // Captured from a test instance /api/dashboards query made by the plugin
        // api/dashboards?fields=id,name,dashboardItems[id,type,text,x,y,visualization[id,displayName],
        // eventVisualization[id,displayName],eventChart[id,displayName],map[id,displayName],
        // eventReport[id,displayName],reports[id,displayName],resources[id,displayName],messages]
        // &filter=dashboardItems.id:eq:{plugin_dashboardItem_Id}
        const dashboardItemsFromApi = [
            { text: "Simple text box", x: 0, y: 38, type: "TEXT", id: "kmmjmzitztz", reports: [], resources: [] },
            { x: 0, y: 0, type: "APP", id: "glh4D36tP4V", reports: [], resources: [] },
            {
                text: "SPACER_ITEM_FOR_DASHBOARD_LAYOUT_CONVENIENCE",
                x: 0,
                y: 29,
                type: "TEXT",
                id: "AepQrxyaSZZ",
                reports: [],
                resources: [],
            },
            { messages: true, x: 35, y: 0, type: "MESSAGES", id: "xnTjIxCYs0b", reports: [], resources: [] },
            {
                x: 0,
                y: 53,
                type: "RESOURCES",
                id: "tEgq6SrsbGO",
                reports: [],
                resources: [{ displayName: "DHIS 2 Home Page", id: "hKYLLpNinZR" }],
            },
            {
                x: 17,
                y: 53,
                type: "REPORTS",
                id: "gpiLai5n3ri",
                reports: [{ displayName: "ANC: Coverages This Year", id: "qYVNH1wkZR0" }],
                resources: [],
            },
            {
                eventChart: { displayName: "Inpatient: Age under 5 last 12 months (stacked)", id: "WIxuUpm5m4U" },
                x: 0,
                y: 82,
                type: "EVENT_CHART",
                id: "PL7Mb93C26L",
                reports: [],
                resources: [],
            },
            {
                eventReport: {
                    displayName: "Child health: ARV at birth by Gender active cases last 12 months",
                    id: "sAqSL9Qrl1u",
                },
                x: 20,
                y: 82,
                type: "EVENT_REPORT",
                id: "tl5Klda3G2Y",
                reports: [],
                resources: [],
            },
            {
                eventVisualization: {
                    displayName: "Inpatient: Cases 5 to 15 years this year (case)",
                    id: "TIuOzZ0ID0V",
                },
                x: 0,
                y: 111,
                type: "EVENT_VISUALIZATION",
                id: "qqV3hd2mnQA",
                reports: [],
                resources: [],
            },
            {
                visualization: { displayName: "ANC: 4+ visits by Facility Type last year", id: "ZfQMIA4o2s3" },
                x: 20,
                y: 111,
                type: "VISUALIZATION",
                id: "qASRgyOrb79",
                reports: [],
                resources: [],
            },
            {
                visualization: { displayName: "ANC 1 Coverage - Uvn6LCg7dVU", id: "Yq6QFJRvOqT" },
                x: 40,
                y: 82,
                type: "VISUALIZATION",
                id: "H5EIdBt2Hig",
                reports: [],
                resources: [],
            },
            {
                visualization: { displayName: "ANC: 1 and 3 coverage Yearly", id: "UlfTKWZWV4u" },
                x: 34,
                y: 53,
                type: "VISUALIZATION",
                id: "tO0CVinfWMD",
                reports: [],
                resources: [],
            },
            {
                text: "# Section 1\n\n## Description \nDescription of section 1",
                x: 0,
                y: 140,
                type: "TEXT",
                id: "g6hwYNSCF7L",
                reports: [],
                resources: [],
            },
            {
                text: "# Section 2\n## Description \nDescription of section 2",
                x: 0,
                y: 211,
                type: "TEXT",
                id: "lL8A5w5NCm3",
                reports: [],
                resources: [],
            },
            {
                map: { displayName: "Malaria: Cases <5y female Pujehun this year events", id: "xGDMypGePp8" },
                x: 29,
                y: 151,
                type: "MAP",
                id: "HQp9BAUG9v8",
                reports: [],
                resources: [],
            },
            {
                map: {
                    displayName: "Malaria: ANC LLITN at facility last month with district boundaries",
                    id: "GlCLRPPLsWF",
                },
                x: 0,
                y: 151,
                type: "MAP",
                id: "nwbMWKLEUnF",
                reports: [],
                resources: [],
            },
            {
                map: { displayName: "Malaria: Cases Sierra Leone <5y 2015-2016 clustered", id: "qR8xw5pvVIn" },
                x: 29,
                y: 171,
                type: "MAP",
                id: "MhfQvsEGRTx",
                reports: [],
                resources: [],
            },
            {
                map: { displayName: "Malaria: Cases <5y female Pujehun this year events", id: "xGDMypGePp8" },
                x: 0,
                y: 171,
                type: "MAP",
                id: "PqduVUfvMfX",
                reports: [],
                resources: [],
            },
            {
                map: { displayName: "Malaria: Cases Female <5y Sierra Leone clustered", id: "Wmu8mKsAIa4" },
                x: 29,
                y: 191,
                type: "MAP",
                id: "ARajNqB2q6s",
                reports: [],
                resources: [],
            },
            {
                map: { displayName: "Malaria: Cases 2015-2016 Western Area events", id: "kNYqHu3e7o3" },
                x: 0,
                y: 222,
                type: "MAP",
                id: "NRkYTLSr9Vw",
                reports: [],
                resources: [],
            },
            {
                map: { displayName: "Malaria: Cases 2015-2016 Western Area clustered", id: "UjHKZ2lZJ3T" },
                x: 0,
                y: 242,
                type: "MAP",
                id: "GgVgtTzX9W6",
                reports: [],
                resources: [],
            },
            { text: "# ", x: 0, y: 262, type: "TEXT", id: "qjAJTlTxI9j", reports: [], resources: [] },
        ] as unknown as DashboardItem[];

        const fixtureDashboard = dashboard("JW7RlN5xafN", dashboardItemsFromApi);

        it("excludes the APP item and the layout spacer, keeping everything else in y/x order", () => {
            const result = computeDashboardIndex(fixtureDashboard, INDEXABLE_ITEM_TYPES);
            expect(names(result)).toEqual([
                "Messages",
                "Text Element",
                "DHIS 2 Home Page",
                "ANC: Coverages This Year",
                "ANC: 1 and 3 coverage Yearly",
                "Inpatient: Age under 5 last 12 months (stacked)",
                "Child health: ARV at birth by Gender active cases last 12 months",
                "ANC 1 Coverage - Uvn6LCg7dVU",
                "Inpatient: Cases 5 to 15 years this year (case)",
                "ANC: 4+ visits by Facility Type last year",
                "Section 1",
                "Malaria: ANC LLITN at facility last month with district boundaries",
                "Malaria: Cases <5y female Pujehun this year events",
                "Malaria: Cases <5y female Pujehun this year events",
                "Malaria: Cases Sierra Leone <5y 2015-2016 clustered",
                "Malaria: Cases Female <5y Sierra Leone clustered",
                "Section 2",
                "Malaria: Cases 2015-2016 Western Area events",
                "Malaria: Cases 2015-2016 Western Area clustered",
                "Text Element",
            ]);
        });

        it("only lists text items with markdown headers under the default configuration", () => {
            const result = computeDashboardIndex(fixtureDashboard, FALLBACK_ENABLED_ITEM_TYPES);
            expect(names(result)).toEqual(["Section 1", "Section 2"]);
        });
    });
});
