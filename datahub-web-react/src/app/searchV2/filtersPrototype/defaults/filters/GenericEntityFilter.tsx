import { Select, SelectOption, SimpleSelect } from '@src/alchemy-components';
import { AggregationMetadata, Entity, FilterOperator } from '@src/types.generated';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FilterRendererProps } from '../../types';
import { FIELD_TO_FILTER_NAME_MAP } from './constants';
import { useGetAutoCompleteMultipleResultsLazyQuery } from '@src/graphql/search.generated';

interface GenericEntityFilterProps extends FilterRendererProps {
    renderEntity: (entity: Entity) => React.ReactNode;
}

const mergeOptions = (optionsA: SelectOption[], optionsB: SelectOption[]): SelectOption[] => {
    const valuesOfOptionsB = optionsB.map((option) => option.value);

    return [...optionsA.filter((option) => !valuesOfOptionsB.includes(option.value)), ...optionsB];
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
    const [options, setOptions] = useState<SelectOption[]>([]);
    const [label, setLabel] = useState<string>('Unknown');

    // Selects should have only one applied filter
    const values = useMemo(() => appliedFilters?.[0]?.values ?? [], [appliedFilters]);

    const isFacetStateLoading = facetState?.loading;

    const aggregations = useMemo(() => {
        const aggregationsFromFacet = facetState?.facet?.aggregations || [];
        const aggregationsFromAppliedFilters = appliedFilters?.aggregations || [];
        return mergeAggregations(aggregationsFromFacet, aggregationsFromAppliedFilters);
    }, [facetState, appliedFilters]);

    const [getSearchResults, { data, loading: searchLoading }] = useGetAutoCompleteMultipleResultsLazyQuery();

    // TODO: >>> move options to the second place?
    const onSearch = (options: SelectOption[], query: string) => {};

    useEffect(() => {
        const optionsToShow = aggregations
            .filter((aggregation) => aggregation.entity !== undefined)
            .map((aggregation) => ({
                value: aggregation.value,
                label: renderEntity(aggregation.entity as Entity),
                entity: aggregation.entity,
                aggregation: aggregation,
            }));

        if (fieldName === 'platform') debugger;

        // if (!isFacetStateLoading) setOptions(optionsToShow);
        setOptions(optionsToShow);
    }, [aggregations, renderEntity, isFacetStateLoading]);

    useEffect(() => {
        const filterName = FIELD_TO_FILTER_NAME_MAP.get(fieldName) ?? facetState?.facet?.displayName;
        if (filterName) setLabel(filterName);
    }, [facetState?.facet?.displayName, fieldName]);

    const onSelectUpdate = useCallback(
        (values: string[]) => {
            const selectedAggregations = aggregations?.filter((aggregation) => values.includes(aggregation.value));

            onUpdate?.({
                filters: [
                    {
                        field: fieldName,
                        condition: FilterOperator.Equal,
                        values: values,
                    },
                ],
                options: options.filter((option) => values.includes(option.value)),
                aggregations: selectedAggregations,
            });
        },
        [onUpdate, aggregations],
    );

    return (
        <Select
            // TODO: >>> implement filter
            searchFilter={(_, options) => options}
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
