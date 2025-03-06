import { NestedSelect } from '@src/alchemy-components/components/Select/Nested/NestedSelect';
import { FieldFilterComponentProps } from '../../types';
import useOptions from './hooks/useOptions';
import { SelectOption } from '@src/alchemy-components/components/Select/Nested/types';
import useValues from '../hooks/useValues';
import { useMemo, useState } from 'react';
import { Domain, Entity, EntityType, FilterOperator } from '@src/types.generated';
import { useEntityRegistryV2 } from '@src/app/useEntityRegistry';
import { EntityIconRenderer } from '@src/app/entityV2/shared/components/AutoCompleteResult/components/icon/DefaultEntityIcon';
import { Text } from '@src/alchemy-components';
import styled from 'styled-components';

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

function DomainLabel({ entity }: PlatformLabelProps) {
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

export default function DomainFilter({ fieldName, facetState, appliedFilters, onUpdate }: FieldFilterComponentProps) {
    const [entities, setEntities] = useState<Entity[]>([]);

    const values = useValues(appliedFilters);

    const renderLabel = (domain: Domain) => <DomainLabel entity={domain} />;
    const options = useOptions(facetState, entities, renderLabel);

    const initialValues = useMemo(() => options.filter((option) => values.includes(option.value)), [values, options]);

    const onSelectUpdate = (selectedOptions: SelectOption[]) => {
        const selectedValues = selectedOptions.map((option) => option.value);
        const selectedEntities: Entity[] = selectedOptions
            .map((option) => option.entity)
            .filter((entity): entity is Entity => !!entity);

        setEntities(selectedEntities);

        onUpdate?.({
            filters: [
                {
                    field: fieldName,
                    condition: FilterOperator.Equal,
                    values: selectedValues,
                },
            ],
        });
    };

    console.log('>>> DomainFilter', { options, facetState });

    return (
        <NestedSelect
            initialValues={initialValues}
            onUpdate={onSelectUpdate}
            options={options}
            isMultiSelect
            width="fit-content"
            showSearch
            showCount
        />
    );
}
