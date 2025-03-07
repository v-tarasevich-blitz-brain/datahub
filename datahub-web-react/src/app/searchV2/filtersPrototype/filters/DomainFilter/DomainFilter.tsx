import { NestedSelect } from '@src/alchemy-components/components/Select/Nested/NestedSelect';
import { SelectOption } from '@src/alchemy-components/components/Select/Nested/types';
import { Domain, Entity, FilterOperator } from '@src/types.generated';
import { useMemo, useState } from 'react';
import { FieldFilterComponentProps } from '../../types';
import { EntityIconWithName } from '../BaseEntityFilter/components/EntityIconWithName';
import useValues from '../hooks/useValues';
import useOptions from './hooks/useOptions';

export default function DomainFilter({ fieldName, facetState, appliedFilters, onUpdate }: FieldFilterComponentProps) {
    const [entities, setEntities] = useState<Entity[]>([]);

    const values = useValues(appliedFilters);

    const renderLabel = (domain: Domain) => <EntityIconWithName entity={domain} />;
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
            shouldManuallyUpdate
            selectLabelProps={{ variant: 'labeled', label: 'Domains' }}
        />
    );
}
