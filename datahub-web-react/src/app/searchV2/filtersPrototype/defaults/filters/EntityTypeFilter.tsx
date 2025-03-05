import { AggregationMetadata, Entity } from '@src/types.generated';
import { FilterRendererProps } from '../../types';
import GenericEntityFilter from './GenericEntityFilter';
import React from 'react';
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
            <IconWrapper>
                {entity && <EntityIconRenderer entity={entity} size={16} />}
            </IconWrapper>
            <Text type="span">{displayName}</Text>
        </Container>
    );
}

export default function EntityTypeFilter(props: FilterRendererProps) {
    const aggregationMetadataToLabel = (entity: Entity) => (
        <EntityTypeLabel entity={entity} />
    );

    return <GenericEntityFilter {...props} renderEntity={aggregationMetadataToLabel} />;
}
