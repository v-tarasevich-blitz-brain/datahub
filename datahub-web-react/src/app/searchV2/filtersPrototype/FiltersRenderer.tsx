import { useMemo } from 'react';
import PlatformEntityFilter from './defaults/filters/PlatformFilter';
import filterRegistry from './FilterRegistry';
import { useSearchFiltersContext } from './SearchFiltersContext';
import { Filter, InternalRenderer } from './types';

export default function FiltersRenderingRunner({ fields }: InternalRenderer) {
    const { filtersRenderer, fieldToFacetStateMap, updateFieldAppliedFilters, fieldToAppliedFiltersMap } =
        useSearchFiltersContext();

    const filters: Filter[] = useMemo(
        () =>
            fields.map((field) => ({
                fieldName: field,
                props: {
                    fieldName: field,
                    appliedFilters: fieldToAppliedFiltersMap.get(field),
                    onUpdate: (values) => updateFieldAppliedFilters(field, values),
                    facetState: fieldToFacetStateMap.get(field),
                },
                render: filterRegistry.getRenderer(field) || (() => null),
            })),
        [fields, fieldToFacetStateMap, updateFieldAppliedFilters, fieldToAppliedFiltersMap],
    );

    return <>{filtersRenderer({ filters })}</>;
}
