import { FacetFilterInput } from '@src/types.generated';
import { FieldName, FieldToAppliedFieldFiltersMap } from './types';

export function getFacetFilterInputsFromAppliedFilters(
    appliedFilters: FieldToAppliedFieldFiltersMap,
    excludeFields?: FieldName[],
): FacetFilterInput[] {
    const appliedFiltersWithoutExludedFields = new Map(
        appliedFilters.entries().filter(([key, _]) => excludeFields?.includes(key)),
    );

    return Array.from(appliedFiltersWithoutExludedFields.entries().map(([key, value]) => value.filters))
        .flat()
        .filter((filter) => filter.values?.length);
}
