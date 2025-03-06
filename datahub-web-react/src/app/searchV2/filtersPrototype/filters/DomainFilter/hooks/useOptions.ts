import { SelectOption } from '@src/alchemy-components/components/Select/Nested/types';
import { FILTER_DELIMITER } from '@src/app/search/utils/constants';
import { FeildFacetState } from '@src/app/searchV2/filtersPrototype/types';
import { mergeArraysPreferencingLast } from '@src/app/searchV2/filtersPrototype/utils';
import { useEntityRegistryV2 } from '@src/app/useEntityRegistry';
import { Domain, Entity, EntityType } from '@src/types.generated';
import { useMemo } from 'react';

export default function useOptions(
    facetState: FeildFacetState | undefined,
    entities: Entity[],
    renderLabel: (domain: Domain) => React.ReactNode,
) {
    const entityRegistry = useEntityRegistryV2();

    // const valuesFromAggregations = useMemo(
    //     () => facetState?.facet?.aggregations.map((aggregation) => aggregation.value) ?? [],
    //     [facetState],
    // );

    // // prefer values from aggregations to save their ordering
    // const uniqueValues = useMemo(
    //     () => [...values.filter((value) => !valuesFromAggregations.includes(value)), ...valuesFromAggregations],
    //     [values, valuesFromAggregations],
    // );

    const options: SelectOption[] = useMemo(() => {
        const entitiesFromAggregations =
            facetState?.facet?.aggregations
                .filter((aggregation) => aggregation.count > 0)
                .map((aggregation) => aggregation.entity)
                .filter((entity): entity is Entity => !!entity) ?? [];

        // const uniqueEntities = ()

        const mergedEntities = mergeArraysPreferencingLast(entities, entitiesFromAggregations, (entity) => entity.urn);
        // debugger;

        const domains = mergedEntities.filter((entity): entity is Domain => entity.type === EntityType.Domain);
        const allParentUrns = domains
            .map((domain) => domain.parentDomains?.domains ?? [])
            .flat()
            .map((domain) => domain.urn);

        return domains.map((domain) => {
            const countOfParentDomains = domain.parentDomains?.count ?? 0;
            const hasParentDomains = countOfParentDomains > 0;
            const lastParentDomain = hasParentDomains
                ? domain.parentDomains?.domains?.[countOfParentDomains - 1]?.urn
                : undefined;

            const hasChildren = allParentUrns.includes(domain.urn);

            return {
                value: domain.urn,
                label: renderLabel(domain),
                entity: domain,
                parentValue: lastParentDomain,
                isParent: hasChildren,
            };
        });
    }, [entityRegistry, facetState, entities, renderLabel]);

    return options;
}
