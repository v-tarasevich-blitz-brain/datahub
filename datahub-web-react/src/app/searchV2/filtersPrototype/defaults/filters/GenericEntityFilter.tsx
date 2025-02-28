import { SelectOption, SimpleSelect } from '@src/alchemy-components';
import { AggregationMetadata, FilterOperator } from '@src/types.generated';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FilterRendererProps } from '../../types';

interface GenericEntityFilterProps extends FilterRendererProps {
    aggregationMetadataToLabel: (aggregation: AggregationMetadata) => React.ReactNode;
}

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
        const aggregations = facetState?.facet?.aggregations;
        if (aggregations) {
            setOptions(
                aggregations.map((aggregation) => ({
                    value: aggregation.value,
                    label: aggregationMetadataToLabel(aggregation),
                }))
            );
        }
    }, [facetState?.facet?.aggregations, aggregationMetadataToLabel]);

    useEffect(() => {
        const displayName = facetState?.facet?.displayName;
        if (displayName) setLabel(displayName);
    }, [facetState?.facet?.displayName]);

    const onSelectUpdate = useCallback(
        (values: string[]) => {
            onUpdate?.([
                {
                    field: fieldName,
                    condition: FilterOperator.Equal,
                    values: values,
                },
            ]);
        },
        [onUpdate],
    );

    console.log('>>> GenericEntityFilter', {options, facetState})

    return (
        <SimpleSelect
            // TODO: >>> implement filter
            searchFilter={(options) => options}
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
