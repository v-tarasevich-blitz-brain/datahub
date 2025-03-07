import { Text } from '@src/alchemy-components';
import { EntityIconRenderer } from '@src/app/entityV2/shared/components/AutoCompleteResult/components/icon/DefaultEntityIcon';
import { useEntityRegistryV2 } from '@src/app/useEntityRegistry';
import { Entity } from '@src/types.generated';
import styled from 'styled-components';

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
    padding-right: 8px;
`;

const IconWrapper = styled.div`
    display: flex;
    align-items: center;

    & .ant-image {
        display: flex;
        align-items: center;
    }
`;

const Name = styled.div`
    max-width: 250px;
    text-overflow: ellipsis;
    overflow: hidden;
`;

interface Props {
    entity: Entity;
}

export function EntityIconWithName({ entity }: Props) {
    const entityRegistry = useEntityRegistryV2();

    const displayName = entityRegistry.getDisplayName(entity.type, entity);

    return (
        <Container>
            <IconAndNameContainer>
                <IconWrapper>
                    <EntityIconRenderer entity={entity} size={16} />
                </IconWrapper>
                <Name>
                    <Text type="span">{displayName}</Text>
                </Name>
            </IconAndNameContainer>
        </Container>
    );
}
