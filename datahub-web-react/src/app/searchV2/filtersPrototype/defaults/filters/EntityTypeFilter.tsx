import { AggregationMetadata } from '@src/types.generated';
import { FilterRendererProps } from '../../types';
import GenericEntityFilter from './GenericEntityFilter';
import React from 'react';
import { EntityIconRenderer } from '@src/app/entityV2/shared/components/AutoCompleteResult/components/icon/DefaultEntityIcon';
import styled from 'styled-components';
import { Text } from '@src/alchemy-components';
import { useEntityRegistryV2 } from '@src/app/useEntityRegistry';

interface PlatformLabelProps {
    aggregation: AggregationMetadata;
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

function EntityTypeLabel({ aggregation }: PlatformLabelProps) {
    const entityRegistry = useEntityRegistryV2();

    const entity = aggregation.entity;

    const displayName = entity ? entityRegistry.getDisplayName(entity.type, entity) : '';

    // entityRegistry

    console.log('>>> EntityTypeLabel', {aggregation})

    return (
        <Container>
            <IconWrapper>
                {aggregation.entity && <EntityIconRenderer entity={aggregation.entity} size={16} />}
            </IconWrapper>
            <Text type="span">{displayName}</Text>
            <Text type="span" size="sm" color="gray">
                {aggregation.count}
            </Text>
        </Container>
    );
}

export default function EntityTypeFilter(props: FilterRendererProps) {
    const aggregationMetadataToLabel = (aggregation: AggregationMetadata) => (
        <EntityTypeLabel aggregation={aggregation} />
    );

    return <GenericEntityFilter {...props} aggregationMetadataToLabel={aggregationMetadataToLabel} />;
}
