import { SelectOption, SimpleSelect } from '@src/alchemy-components';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FilterRendererProps } from './types';
import { FilterOperator } from '@src/types.generated';

export default function TestField({ fieldName, appliedFilters, onUpdate, facetState }: FilterRendererProps) {
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
                    label:
                        aggregation.displayName ??
                        aggregation.entity?.properties?.name ??
                        aggregation.entity?.properties?.displayName,
                })),
            );
        }
    }, [facetState?.facet?.aggregations]);

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

    return (
        <SimpleSelect
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
