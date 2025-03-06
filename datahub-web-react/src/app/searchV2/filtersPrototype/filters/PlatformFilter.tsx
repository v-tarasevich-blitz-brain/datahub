import { Text } from '@src/alchemy-components';
import { EntityIconRenderer } from '@src/app/entityV2/shared/components/AutoCompleteResult/components/icon/DefaultEntityIcon';
import { useEntityRegistryV2 } from '@src/app/useEntityRegistry';
import { Entity, EntityType } from '@src/types.generated';
import styled from 'styled-components';
import { FieldFilterComponentProps } from '../types';
import GenericEntityFilter from './entityFilters/GenericEntityFilter';
import { memo, useCallback } from 'react';

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
    justify-content: space-between;
`;

const IconAndNameContainer = styled.div`
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

function PlatformLabel({ entity }: PlatformLabelProps) {
    const entityRegistry = useEntityRegistryV2();

    const displayName = entityRegistry.getDisplayName(entity.type, entity);

    return (
        <Container>
            <IconAndNameContainer>
                <IconWrapper>
                    <EntityIconRenderer entity={entity} size={16} />
                </IconWrapper>
                <Text type="span">{displayName}</Text>
            </IconAndNameContainer>
        </Container>
    );
}

export default function PlatformEntityFilter(props: FieldFilterComponentProps) {
    const renderEntity = useCallback((entity: Entity) => <PlatformLabel entity={entity} />, []);

    return (
        <GenericEntityFilter
            {...props}
            renderEntity={renderEntity}
            entityTypes={[EntityType.DataPlatform]}
            filterName="Platforms"
        />
    );
}
