import { Select, SelectOption, SimpleSelect } from '@src/alchemy-components';
import { AggregationMetadata, FilterOperator } from '@src/types.generated';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FilterRendererProps } from '../../types';
import { FIELD_TO_FILTER_NAME_MAP } from './constants';

interface GenericEntityFilterProps extends FilterRendererProps {
    aggregationMetadataToLabel: (aggregation: AggregationMetadata) => React.ReactNode;
}

const mergeOptions = (optionsA: SelectOption[], optionsB: SelectOption[]): SelectOption[] => {
    const valuesOfOptionsB = optionsB.map((option) => option.value);

    return [...optionsA.filter((option) => !valuesOfOptionsB.includes(option.value)), ...optionsB];
};

export default function GenericEntityFilter({
    fieldName,
    appliedFilters,
    onUpdate,
    facetState,
    aggregationMetadataToLabel,
}: GenericEntityFilterProps) {
    const [options, setOptions] = useState<SelectOption[]>([]);
    const [label, setLabel] = useState<string>('Unknown');

    // Selects should have only one applied filter
    const values = useMemo(() => appliedFilters?.[0]?.values ?? [], [appliedFilters]);

    useEffect(() => {
        let optionsToShow: SelectOption[] = [];

        const optionsFromAppliedFilters = appliedFilters?.options;
        if (optionsFromAppliedFilters) {
            console.log('>>> optionsFromAppliedFilters', fieldName, optionsFromAppliedFilters)
            optionsToShow = mergeOptions(optionsToShow, optionsFromAppliedFilters);
        }

        const aggregations = facetState?.facet?.aggregations;
        if (aggregations) {
            const optionsFromAggregations = aggregations.map((aggregation) => ({
                value: aggregation.value,
                label: aggregationMetadataToLabel(aggregation),
                entity: aggregation.entity,
            }));

            optionsToShow = mergeOptions(optionsToShow, optionsFromAggregations);
        }

        setOptions(optionsToShow);
    }, [facetState?.facet?.aggregations, aggregationMetadataToLabel, appliedFilters]);

    useEffect(() => {
        const filterName = FIELD_TO_FILTER_NAME_MAP.get(fieldName) ?? facetState?.facet?.displayName;
        if (filterName) setLabel(filterName);
    }, [facetState?.facet?.displayName, fieldName]);

    const onSelectUpdate = useCallback(
        (values: string[]) => {
            onUpdate?.({
                filters: [
                    {
                        field: fieldName,
                        condition: FilterOperator.Equal,
                        values: values,
                    },
                ],
                options: options.filter((option) => values.includes(option.value)),
            });
        },
        [onUpdate],
    );

    // console.log('>>> GenericEntityFilter', {options, facetState})

    return (
        <Select
            // TODO: >>> implement filter
            searchFilter={(options) => options}
            // showSelectAll
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
