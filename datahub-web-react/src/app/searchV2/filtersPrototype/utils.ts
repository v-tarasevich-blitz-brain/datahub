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
/**
 * Merges two arrays into one, ensuring unique items based on their values or a specific key (using `keyAccessor`).
 * Items from `arrayB` take precedence over `arrayA` in case of duplicates.
 */
export function mergeArraysPreferencingLast<T>(
    arrayA: Array<T>,
    arrayB: Array<T>,
    keyAccessor?: (item: T) => any,
): Array<T> {
    const applyAccessor = (item: T) => (keyAccessor ? keyAccessor(item) : item);

    const keysOfArrayB = arrayB.map(applyAccessor);

    return [...arrayA.filter((item) => !keysOfArrayB.includes(applyAccessor(item))), ...arrayB];
}
