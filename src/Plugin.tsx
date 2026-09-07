import React, { useEffect, useState } from "react";
import { CircularLoader } from "@dhis2/ui";
import styled from "styled-components";
import { DataStoreProvider } from "@dhis2/app-service-datastore";
import i18n from "@dhis2/d2-i18n";
import { DashboardPluginProps } from "./Plugin.types";
import { DEFAULT_GLOBAL_SETTINGS } from "./itemTypeOptions";
import { useDashboardIndex } from "./useDashboardIndex";
import ConfigPage from "./Plugin.config";

export const DATASTORE_NAMESPACE = "dashboard-index-plugin";
const LOADING_HINT_DELAY_MS = 7000;

// If a user lacks read access to any key under this namespace, the datastore
// service's own initialization rejects without being caught (a bug in
// @dhis2/app-service-datastore: DataStoreProvider's init() has no .catch(),
// so `loading` never flips to false), remaining stuck in the loading state.
// There's no way to distinguish this from a legit loading without checking the
// API directly, so this at least turns an infinite spinner into a hint after a while.
function LoadingWithTimeoutHint() {
    const [showHint, setShowHint] = useState(false);

    useEffect(() => {
        const timeoutId = setTimeout(() => setShowHint(true), LOADING_HINT_DELAY_MS);
        return () => clearTimeout(timeoutId);
    }, []);

    return (
        <LoadingContainer>
            <CircularLoader />
            {showHint && (
                <HintText>
                    {i18n.t(
                        'This is taking longer than expected. You may not have view access to the "settings" or "savedObjects" keys in the "{{namespace}}" datastore namespace.',
                        { namespace: DATASTORE_NAMESPACE }
                    )}
                </HintText>
            )}
        </LoadingContainer>
    );
}

export default function Plugin(props: DashboardPluginProps) {
    return (
        <DataStoreProvider
            namespace={DATASTORE_NAMESPACE}
            loadingComponent={<LoadingWithTimeoutHint />}
            defaultGlobalSettings={DEFAULT_GLOBAL_SETTINGS}
        >
            <PluginContent {...props} />
        </DataStoreProvider>
    );
}

function PluginContent({ dashboardItemId, dashboardMode }: DashboardPluginProps) {
    if (dashboardMode === "edit") {
        return <ConfigPage dashboardItemId={dashboardItemId} />;
    }

    return <PluginIndex dashboardItemId={dashboardItemId} />;
}

function PluginIndex({ dashboardItemId }: { dashboardItemId: string }) {
    const state = useDashboardIndex(dashboardItemId);

    if (state.status === "loading") {
        return <CircularLoader />;
    }

    if (state.status === "error") {
        return (
            <span>
                {i18n.t("Error")}: {state.message}
            </span>
        );
    }

    if (state.status === "empty") {
        return <span>{i18n.t("No data available")}</span>;
    }

    function scrollToItem(itemId: string) {
        const element = window.parent.document.querySelector(`[data-test="dashboarditem-${itemId}"]`);
        element?.scrollIntoView(true);
    }

    return (
        <Container>
            <ul>
                {state.dashboard.items.length === 0 ? (
                    <EmptyMessage>{i18n.t("No dashboard items match the current configuration.")}</EmptyMessage>
                ) : (
                    state.dashboard.items.map(item => (
                        <li key={item.id} id={`index-${item.id}`}>
                            <Link onClick={() => scrollToItem(item.id)}>{item.name}</Link>
                        </li>
                    ))
                )}
            </ul>
        </Container>
    );
}

const Container = styled.div`
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    font-size: 1rem;
`;

const Link = styled.a`
    cursor: pointer;
    gap: 8px;

    &:hover {
        text-decoration: underline;
    }
`;

const EmptyMessage = styled.li`
    color: #6c7787;
    font-style: italic;
`;

const LoadingContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 16px;
    text-align: center;
`;

const HintText = styled.span`
    color: #6c7787;
    font-size: 0.875rem;
`;
