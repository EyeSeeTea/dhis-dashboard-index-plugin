import React, { useState } from "react";
import { Checkbox, NoticeBox } from "@dhis2/ui";
import i18n from "@dhis2/d2-i18n";
import styled from "styled-components";
import { INDEXABLE_ITEM_TYPES, getItemTypeLabel, IndexableItemType, useEnabledItemTypes } from "./itemTypeOptions";

interface ConfigPageProps {
    dashboardItemId: string;
}

export default function ConfigPage({ dashboardItemId }: ConfigPageProps) {
    const [enabledTypes, setEnabledItemTypes] = useEnabledItemTypes(dashboardItemId);
    const [saveError, setSaveError] = useState<string | null>(null);

    async function toggleType(type: IndexableItemType) {
        const isEnabled = enabledTypes.includes(type);

        if (isEnabled && enabledTypes.length === 1) {
            return;
        }

        const itemTypes = isEnabled ? enabledTypes.filter(t => t !== type) : [...enabledTypes, type];

        setSaveError(null);

        try {
            await setEnabledItemTypes(itemTypes);
        } catch (error) {
            setSaveError(error instanceof Error ? error.message : String(error));
        }
    }

    return (
        <Container>
            <Title>{i18n.t("Configuration")}</Title>
            <Description>{i18n.t("Select which dashboard item types should be listed in the index.")}</Description>

            {saveError && (
                <NoticeBox error title={i18n.t("Could not save configuration")}>
                    {saveError}
                </NoticeBox>
            )}

            <OptionList>
                {INDEXABLE_ITEM_TYPES.map(type => {
                    const isLastEnabled = enabledTypes.length === 1 && enabledTypes.includes(type);

                    return (
                        <OptionRow
                            key={type}
                            title={isLastEnabled ? i18n.t("At least one item type must stay enabled") : undefined}
                        >
                            <Checkbox
                                checked={enabledTypes.includes(type)}
                                disabled={isLastEnabled}
                                onChange={() => toggleType(type)}
                            />
                            <OptionLabel $disabled={isLastEnabled}>{getItemTypeLabel(type)}</OptionLabel>
                        </OptionRow>
                    );
                })}
            </OptionList>
        </Container>
    );
}

const Container = styled.div`
    padding: 20px;
    max-width: 400px;
`;

const Title = styled.h2`
    margin: 0 0 8px;
`;

const Description = styled.p`
    margin: 0 0 16px;
    color: #6c7787;
`;

const OptionList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;
`;

const OptionRow = styled.label`
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 6px 8px;
    border-radius: 4px;

    &:hover {
        background: #f4f6f8;
    }
`;

const OptionLabel = styled.span<{ $disabled?: boolean }>`
    color: ${({ $disabled }) => ($disabled ? "#a3adb8" : "inherit")};
`;
