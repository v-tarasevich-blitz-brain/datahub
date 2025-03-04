import { AggregationMetadata, CorpUser, EntityType } from '@src/types.generated';
import { FilterRendererProps } from '../../types';
import GenericEntityFilter from './GenericEntityFilter';
import React from 'react';
import { EntityIconRenderer } from '@src/app/entityV2/shared/components/AutoCompleteResult/components/icon/DefaultEntityIcon';
import styled from 'styled-components';
import { Pill, Text } from '@src/alchemy-components';
import { useEntityRegistryV2 } from '@src/app/useEntityRegistry';
import UserEntityIcon from '@src/app/entityV2/shared/components/AutoCompleteResult/components/icon/UserEntityIcon';
import EntityIcon from '@src/app/entityV2/shared/components/AutoCompleteResult/components/icon/EntityIcon';

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

const TitleContainer = styled.div`
    display: flex;
    flex-direction: column;
    /* gap: 8px; */
`;

function OwnerLabel({ aggregation }: PlatformLabelProps) {
    const entityRegistry = useEntityRegistryV2();

    const entity = aggregation.entity;

    const displayName = entity ? entityRegistry.getDisplayName(entity.type, entity) : '';
    const subtitle = entity?.type === EntityType.CorpUser ? (entity as CorpUser)?.properties?.email : undefined;

    return (
        <Container>
            <IconAndNameContainer>
                <IconWrapper>{aggregation.entity && <EntityIcon entity={aggregation.entity} />}</IconWrapper>
                <TitleContainer>
                    <Text type="div">{displayName}</Text>
                    {subtitle && (
                        <Text type="div" size="sm" color="gray">
                            {subtitle}
                        </Text>
                    )}
                </TitleContainer>
            </IconAndNameContainer>

            <Pill label={aggregation.count} />
        </Container>
    );
}

export default function OwnerFilter(props: FilterRendererProps) {
    const aggregationMetadataToLabel = (aggregation: AggregationMetadata) => <OwnerLabel aggregation={aggregation} />;

    return <GenericEntityFilter {...props} aggregationMetadataToLabel={aggregationMetadataToLabel} />;
}
