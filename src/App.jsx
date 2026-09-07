import React from "react";
import Plugin, { DATASTORE_NAMESPACE } from "./Plugin";
import classes from "./App.module.css";
import i18n from "@dhis2/d2-i18n";

function getTestPropsFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const dashboardItemId = params.get("dashboardItemId");
    const dashboardItemFiltersParam = params.get("dashboardItemFilters");

    return {
        dashboardItemId,
        dashboardItemFilters: dashboardItemFiltersParam ? JSON.parse(dashboardItemFiltersParam) : {},
        setDashboardItemDetails: details => console.debug("setDashboardItemDetails:", details),
    };
}

const MyApp = () => {
    const testProps = getTestPropsFromUrl();

    if (!testProps.dashboardItemId) {
        return (
            <div className={classes.container}>
                <p>
                    {i18n.t("Use a plugin dashboardItemId query param to test the plugin, e.g. {{example}}", {
                        example: "http://localhost:3000/?dashboardItemId=<id>",
                        nsSeparator: false,
                        interpolation: { escapeValue: false },
                    })}
                </p>
                <p>
                    {i18n.t("To get this dashboardItemId:")}
                    <ul>
                        <li>{i18n.t("Install the plugin in the test instance.")}</li>
                        <li>{i18n.t("Add it to the dashboard to test.")}</li>
                        <li>
                            {i18n.t("Get the dashboardItemId via: {{api}}", {
                                api: "http://<host>/api/dashboards/<dashboardId>?fields=id,displayName,dashboardItems[id,appKey]",
                                nsSeparator: false,
                                interpolation: { escapeValue: false },
                            })}
                        </li>
                    </ul>
                </p>
            </div>
        );
    }

    return (
        <div className={classes.container}>
            <div>
                <p>
                    {i18n.t("Use Datastore Management with namespace: {{namespace}} to change the plugin configs.", {
                        namespace: DATASTORE_NAMESPACE,
                        nsSeparator: false,
                    })}
                </p>
                <p>{i18n.t("To apply the config changes reload the page.")}</p>
            </div>
            <div className={classes.sideBySide}>
                <div className={classes.pane}>
                    <h3>{i18n.t("View mode")}</h3>
                    <Plugin {...testProps} dashboardMode="view" />
                </div>
                <div className={classes.pane}>
                    <h3>{i18n.t("Edit mode")}</h3>
                    <Plugin {...testProps} dashboardMode="edit" />
                </div>
            </div>
        </div>
    );
};

export default MyApp;
