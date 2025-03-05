import { Select, SelectOption, SimpleSelect } from '@src/alchemy-components';
import { AggregationMetadata, Entity, EntityType, FilterOperator } from '@src/types.generated';
import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { FieldFilterComponentProps } from '../../../types';
import { FIELD_TO_FILTER_NAME_MAP } from '../constants';
import { useGetAutoCompleteMultipleResultsLazyQuery } from '@src/graphql/search.generated';
import useConvertEntitiesToOptions from './hooks/useEntitiesToOptions';
import { EntitySelectOption } from './types';

interface GenericEntityFilterProps extends FieldFilterComponentProps {
    renderEntity: (entity: Entity) => React.ReactNode;
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
    appliedFilters,
    onUpdate,
    facetState,
    renderEntity,
}: GenericEntityFilterProps) {

    console.log('>>> RENDER GenericEntityFilter', fieldName);

    const [searchQuery, setSearchQuery] = useState<string>('');

    const [options, setOptions] = useState<EntitySelectOption[]>([]);
    const [label, setLabel] = useState<string>('Unknown');

    // Selects should have only one applied filter
    const values = useMemo(() => appliedFilters?.[0]?.values ?? [], [appliedFilters]);

    const isFacetStateLoading = facetState?.loading;

    const aggregations1 = useMemo(() => facetState?.facet?.aggregations || [], [facetState]);

    const [getSearchResults, { data, loading: searchLoading }] = useGetAutoCompleteMultipleResultsLazyQuery();

    const convertEntiteisToOptions = useConvertEntitiesToOptions();

    // const updateSearchResults = ()

    const onSearch = useCallback(
        (query: string, currentOptions: EntitySelectOption[]) => {
            console.log('>>> onSearch CALL', currentOptions)
            setSearchQuery(query);
            return currentOptions.filter((option) => option.displayName.toLocaleLowerCase().includes(query.toLocaleLowerCase()));
        },
        [],
    );

    // TODO:: add debounce
    useEffect(() => {
        getSearchResults({
            variables: {
                input: {
                    query: searchQuery,
                    // TODO:: replace with real entity type
                    types: [EntityType.Tag],
                    // TODO:: use constant!
                    limit: 20,
                },
            },
        });
    }, [searchQuery]);

    useEffect(() => {
        const entitiesFromAppliedFilters = appliedFilters?.entities || [];

        const entitiesFromAggregations = (facetState?.facet?.aggregations || [])
            .filter((aggregation) => aggregation.count > 0)
            .filter((aggregation) => !!aggregation.entity)
            .map((aggregation) => aggregation.entity);

        const urnsOfEntitiesFromAggregations = entitiesFromAggregations.map((entity) => entity?.urn);

        const entities = [
            ...entitiesFromAppliedFilters.filter((entity) => !urnsOfEntitiesFromAggregations.includes(entity.urn)),
            ...entitiesFromAggregations,
        ];

        // const optionsToShow: SelectOption[] = entities.map((entity) => entityToOption(entity as Entity, renderEntity));
        const optionsToShow = convertEntiteisToOptions(entities as Entity[], renderEntity);
        setOptions(optionsToShow);
    }, [facetState, renderEntity, isFacetStateLoading, convertEntiteisToOptions]);

    const searchedOptions = useMemo(() => {
        data?.autoCompleteForMultiple?.suggestions;
    }, [data]);

    useEffect(() => {
        const filterName = FIELD_TO_FILTER_NAME_MAP.get(fieldName) ?? facetState?.facet?.displayName;
        if (filterName) setLabel(filterName);
    }, [facetState?.facet?.displayName, fieldName]);

    const onSelectUpdate = useCallback(
        (values: string[]) => {
            // const selectedAggregations = aggregations1?.filter((aggregation) => values.includes(aggregation.value));

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
                entities: selectedEntities,
            });
        },
        [onUpdate, aggregations1],
    );

    return (
        <Select<EntitySelectOption>
            // TODO:: implement filter
            searchFilter={onSearch}
            values={values}
            onUpdate={onSelectUpdate}
            options={options}
            isMultiSelect
            showSearch
            selectLabelProps={{ variant: 'labeled', label }}
            width={'fit-content'}
        />
    );
}
