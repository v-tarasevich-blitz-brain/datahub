import { Select } from '@src/alchemy-components';
import { Entity, EntityType, FilterOperator } from '@src/types.generated';
import React, { useCallback, useState } from 'react';
import { FieldFilterComponentProps } from '../../types';
import useValues from '../hooks/useValues';
import { BaseEntitySelectOption } from './types';
import useOptions from './hooks/useOptions';

interface BaseEntityFilterProps extends FieldFilterComponentProps {
    filterName: string;
    renderEntity: (entity: Entity) => React.ReactNode;
    entityTypes: EntityType[];
}

export default function BaseEntityFilter({
    fieldName,
    filterName,
    appliedFilters,
    onUpdate,
    facetState,
    renderEntity,
    entityTypes,
}: BaseEntityFilterProps) {
    const [searchQuery, setSearchQuery] = useState<string>('');
    // used to forcibly show entities in options even though these entities are not in facet
    const [appliedEntities, setAppliedEntities] = useState<Entity[]>([]);
    const options = useOptions(appliedEntities, facetState, searchQuery, entityTypes, renderEntity);
    const values = useValues(appliedFilters);

    const searchFilter = useCallback((query: string, currentOptions: BaseEntitySelectOption[]) => {
        return currentOptions.filter((option) =>
            option.displayName.toLocaleLowerCase().includes(query.toLocaleLowerCase()),
        );
    }, []);

    const onSelectUpdate = useCallback(
        (values: string[]) => {
            const selectedOptions = options.filter((option) => values.includes(option.value));
            const selectedEntities = selectedOptions.map((option) => option.entity);

            onUpdate?.({
                filters: [
                    {
                        field: fieldName,
                        condition: FilterOperator.Equal,
                        values,
                    },
                ],
                // entities: selectedEntities,
            });

            setAppliedEntities(selectedEntities);
        },
        [onUpdate, options],
    );

    return (
        <Select<BaseEntitySelectOption>
            values={values}
            onUpdate={onSelectUpdate}
            options={options}
            isMultiSelect
            showSearch
            selectLabelProps={{ variant: 'labeled', label: filterName }}
            width="fit-content"
            searchFilter={searchFilter}
            onSearchQueryChanged={(query) => setSearchQuery(query)}
        />
    );
}
