import { memo, useMemo } from 'react';
import filterRegistry from './FilterRegistry';
import { useSearchFiltersContext } from './SearchFiltersContext';
import { Filter, InternalRenderer } from './types';

export default memo(function FiltersRenderingRunner({ fields }: InternalRenderer) {
    const { filtersRenderer, fieldToFacetStateMap, updateFieldAppliedFilters, fieldToAppliedFiltersMap } =
        useSearchFiltersContext();

    const Renderer = useMemo(() => filtersRenderer, [filtersRenderer]);

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
                component: filterRegistry.getRenderer(field) || (() => null),
            })),
        [fields, fieldToFacetStateMap, updateFieldAppliedFilters, fieldToAppliedFiltersMap],
    );

    return <Renderer filters={filters} />;
});
