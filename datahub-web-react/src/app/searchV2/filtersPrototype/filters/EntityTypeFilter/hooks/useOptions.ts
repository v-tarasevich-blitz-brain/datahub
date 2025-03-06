import { SelectOption } from '@src/alchemy-components/components/Select/Nested/types';
import { FILTER_DELIMITER } from '@src/app/search/utils/constants';
import { FeildFacetState } from '@src/app/searchV2/filtersPrototype/types';
import { useEntityRegistryV2 } from '@src/app/useEntityRegistry';
import { EntityType } from '@src/types.generated';
import { useMemo } from 'react';

export default function useOptions(facetState: FeildFacetState | undefined, values: string[]) {
    const entityRegistry = useEntityRegistryV2();

    const valuesFromAggregations = useMemo(
        () => facetState?.facet?.aggregations.map((aggregation) => aggregation.value) ?? [],
        [facetState],
    );

    // prefer values from aggregations to save their ordering
    const uniqueValues = useMemo(
        () => [...values.filter((value) => !valuesFromAggregations.includes(value)), ...valuesFromAggregations],
        [values, valuesFromAggregations],
    );

    const options: SelectOption[] = useMemo(() => {
        // TODO:: add parent nodes
        return uniqueValues.map((value) => {
            const isSubtype = value.includes(FILTER_DELIMITER);
            if (isSubtype) {
                // Only one level in depth possible
                const [entityType, entitySubType] = value.split(FILTER_DELIMITER);
                return {
                    value,
                    label: entitySubType,
                    parentValue: entityType,
                };
            }

            const hasChildren =
                uniqueValues.findIndex((possibleChildrenValue) =>
                    possibleChildrenValue.includes(value + FILTER_DELIMITER),
                ) !== -1;

            console.debug('>>> EntityType[value]', EntityType[value]);

            return {
                value,
                // Parent's value has to be one of EntityType
                label: entityRegistry.getEntityName(value as EntityType) || value,
                isParent: hasChildren,
            };
        });
    }, [uniqueValues, entityRegistry]);

    return options;
}
