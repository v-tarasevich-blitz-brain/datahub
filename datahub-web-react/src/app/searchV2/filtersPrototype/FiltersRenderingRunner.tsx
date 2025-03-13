import { useMemo } from 'react';
import filterRegistry from './FilterRegistry';
import { useSearchFiltersContext } from './SearchFiltersContext';
import { Filter, FiltersRenderingRunnerProps } from './types';

const FiltersRenderingRunner = ({ fieldNames, hideEmptyFilters = false }: FiltersRenderingRunnerProps) => {
    const { filtersRenderer, fieldToFacetStateMap, updateFieldAppliedFilters, fieldToAppliedFiltersMap } =
        useSearchFiltersContext();

    const Renderer = useMemo(() => filtersRenderer, [filtersRenderer]);

    const filters: Filter[] = useMemo(() => {
        const isEmptyFilter = (fieldName: string) => {
            const hasAnyAggregations = (fieldToFacetStateMap.get(fieldName)?.facet?.aggregations?.length ?? 0) > 0;
            const hasAnyAppliedFilters = (fieldToAppliedFiltersMap.get(fieldName)?.filters?.length ?? 0) > 0;

            return !(hasAnyAggregations || hasAnyAppliedFilters);
        };

        return fieldNames
            .filter((fieldName) => !hideEmptyFilters || !isEmptyFilter(fieldName))
            .map((fieldName) => ({
                fieldName: fieldName,
                props: {
                    fieldName,
                    appliedFilters: fieldToAppliedFiltersMap.get(fieldName),
                    onUpdate: (values) => updateFieldAppliedFilters(fieldName, values),
                    facetState: fieldToFacetStateMap.get(fieldName),
                },
                component: filterRegistry.getRenderer(fieldName) || (() => null),
            }));
    }, [fieldNames, fieldToFacetStateMap, updateFieldAppliedFilters, fieldToAppliedFiltersMap, hideEmptyFilters]);

    return <Renderer filters={filters} />;
};

export default FiltersRenderingRunner;
