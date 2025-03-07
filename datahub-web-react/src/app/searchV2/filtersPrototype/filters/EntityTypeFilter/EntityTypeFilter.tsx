import { NestedSelect } from '@src/alchemy-components/components/Select/Nested/NestedSelect';
import { FieldFilterComponentProps } from '../../types';
import useOptions from './hooks/useOptions';
import { SelectOption } from '@src/alchemy-components/components/Select/Nested/types';
import useValues from '../hooks/useValues';
import { useMemo } from 'react';
import { FilterOperator } from '@src/types.generated';

const collectChildren = (options: SelectOption[], allOptions: SelectOption[]): SelectOption[] => {
    const result: SelectOption[] = [];

    // Find all direct children of the given parent values
    for (const node of allOptions) {
        if (options.find((option) => node.parentValue === option.value)) {
            result.push(node);
            // Recursively collect grandchildren
            result.push(...collectChildren([node], allOptions));
        }
    }

    return result;
};

export default function EntityTypeFilter({
    fieldName,
    facetState,
    appliedFilters,
    onUpdate,
}: FieldFilterComponentProps) {
    const values = useValues(appliedFilters);
    const options = useOptions(facetState, values);

    const initialValues = useMemo(() => options.filter((option) => values.includes(option.value)), [values, options]);

    const onSelectUpdate = (selectedOptions: SelectOption[]) => {
        const selectedValues = selectedOptions.map((option) => option.value);
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

    console.log('>>> EntityTypeFilter2', { options, appliedFilters });

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
        />
    );
}
