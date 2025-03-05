import { AggregationMetadata, Entity } from '@src/types.generated';
import { FieldFilterComponentProps } from '../../types';
import GenericEntityFilter from './entityFilters/GenericEntityFilter';
import React, { memo, useCallback } from 'react';
import { EntityIconRenderer } from '@src/app/entityV2/shared/components/AutoCompleteResult/components/icon/DefaultEntityIcon';
import styled from 'styled-components';
import { Text } from '@src/alchemy-components';
import { useEntityRegistryV2 } from '@src/app/useEntityRegistry';

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

export default function EntityTypeFilter(props: FieldFilterComponentProps) {
    const aggregationMetadataToLabel = useCallback((entity: Entity) => <EntityTypeLabel entity={entity} />, []);

    return <GenericEntityFilter {...props} renderEntity={aggregationMetadataToLabel} />;
};
