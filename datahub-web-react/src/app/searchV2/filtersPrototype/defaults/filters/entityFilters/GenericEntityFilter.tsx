import { Select, SelectOption, SimpleSelect } from '@src/alchemy-components';
import { AggregationMetadata, Entity, EntityType, FilterOperator } from '@src/types.generated';
import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { FieldFilterComponentProps } from '../../../types';
import { FIELD_TO_FILTER_NAME_MAP } from '../constants';
import { useGetAutoCompleteMultipleResultsLazyQuery } from '@src/graphql/search.generated';
import useConvertEntitiesToOptions from './hooks/useEntitiesToOptions';
import { EntitySelectOption } from './types';
import useOptions from './hooks/useOptions';
import useValues from '../hooks/useValues';

interface GenericEntityFilterProps extends FieldFilterComponentProps {
    filterName: string;
    renderEntity: (entity: Entity) => React.ReactNode;
    entityTypes: EntityType[];
}

const mergeOptions = (optionsA: SelectOption[], optionsB: SelectOption[]): SelectOption[] => {
    const valuesOfOptionsB = optionsB.map((option) => option.value);

    return [...optionsA.filter((option) => !valuesOfOptionsB.includes(option.value)), ...optionsB];
};

const mergeEntities = (optionsA: SelectOption[], optionsB: SelectOption[]): SelectOption[] => {
    const valuesOfOptionsB = optionsB.map((option) => option.value);

    return [...optionsA.filter((option) => !valuesOfOptionsB.includes(option.value)), ...optionsB];
};

const entityToOption = (entity: Entity, render: (entity: Entity) => React.ReactNode) => {
    return {
        value: entity.urn,
        label: render(entity),
        entity,
    };
};

const mergeAggregations = (
    aggregationsA: AggregationMetadata[],
    aggregationsB: AggregationMetadata[],
): AggregationMetadata[] => {
    const valuesOfAggregationsB = aggregationsB.map((aggregation) => aggregation.value);

    return [
        ...aggregationsA.filter((aggregation) => !valuesOfAggregationsB.includes(aggregation.value)),
        ...aggregationsB,
    ];
};

export default function GenericEntityFilter({
    fieldName,
    filterName,
    appliedFilters,
    onUpdate,
    facetState,
    renderEntity,
    entityTypes,
}: GenericEntityFilterProps) {
    const [searchQuery, setSearchQuery] = useState<string>('');
    // used to forcibly show entities in options even though these entities are not in facet
    const [appliedEntities, setAppliedEntities] = useState<Entity[]>([]);
    const options = useOptions(appliedEntities, facetState, searchQuery, entityTypes, renderEntity);
    const values = useValues(appliedFilters);

    const searchFilter = useCallback((query: string, currentOptions: EntitySelectOption[]) => {
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
                        values: values,
                    },
                ],
                // entities: selectedEntities,
            });

            setAppliedEntities(selectedEntities);
        },
        [onUpdate, options],
    );

    return (
        <Select<EntitySelectOption>
            values={values}
            onUpdate={onSelectUpdate}
            options={options}
            isMultiSelect
            showSearch
            selectLabelProps={{ variant: 'labeled', label: filterName }}
            width={'fit-content'}
            searchFilter={searchFilter}
            onSearchQueryChanged={(query) => setSearchQuery(query)}
        />
    );
}
