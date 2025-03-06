import { AggregationMetadata, Entity, EntityType } from '@src/types.generated';
import { FieldFilterComponentProps } from '../types';
import GenericEntityFilter from './entityFilters/GenericEntityFilter';
import React, { memo, useCallback, useMemo, useState } from 'react';
import { EntityIconRenderer } from '@src/app/entityV2/shared/components/AutoCompleteResult/components/icon/DefaultEntityIcon';
import styled from 'styled-components';
import { Text } from '@src/alchemy-components';
import { useEntityRegistryV2 } from '@src/app/useEntityRegistry';
import { NestedSelect } from '@src/alchemy-components/components/Select/Nested/NestedSelect';
import { SelectOption } from '@src/alchemy-components/components/Select/Nested/types';
import { FILTER_DELIMITER } from '@src/app/searchV2/utils/constants';

interface PlatformLabelProps {
    entity: Entity;
}

const Container = styled.div`
    display: flex;
    flex-direction: row;
    gap: 8px;
    text-overflow: ellipsis;
    text-wrap: nowrap;
    align-items: center;
`;

const IconWrapper = styled.div`
    display: flex;
    align-items: center;

    & .ant-image {
        display: flex;
        align-items: center;
    }
`;

function EntityTypeLabel({ entity }: PlatformLabelProps) {
    const entityRegistry = useEntityRegistryV2();
    const displayName = entity ? entityRegistry.getDisplayName(entity.type, entity) : '';

    return (
        <Container>
            <IconWrapper>{entity && <EntityIconRenderer entity={entity} size={16} />}</IconWrapper>
            <Text type="span">{displayName}</Text>
        </Container>
    );
}

export default function EntityTypeFilter1({ facetState, appliedFilters }: FieldFilterComponentProps) {
    const entityRegistry = useEntityRegistryV2();

    const values = useMemo(() => appliedFilters?.filters?.map((filter) => filter.values).flat(), [appliedFilters]);

    console.log('>>> EntityTypeFilter', { facetState });

    const options: SelectOption[] = useMemo(() => {
        const valuesFromAggregations = facetState?.facet?.aggregations.map((aggregation) => aggregation.value) ?? [];

        const o: SelectOption[] = valuesFromAggregations.map((value) => {
            const parts = value.split(FILTER_DELIMITER);

            if (parts.length === 2) {
                return {
                    value,
                    label: parts[1],
                    parentValue: parts[0],
                };
            }
            return {
                value,
                label: entityRegistry.getEntityName(value as EntityType),
                isParent: !!valuesFromAggregations.find((possibleChildrenValue) =>
                    possibleChildrenValue.startsWith(value + FILTER_DELIMITER),
                ),
            };
        });

        return o;
    }, [facetState, entityRegistry]);

    return <NestedSelect options={options} isMultiSelect width="fit-content" showSearch showCount />;
}
