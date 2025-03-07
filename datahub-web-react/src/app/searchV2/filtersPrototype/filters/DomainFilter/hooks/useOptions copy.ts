import { SelectOption } from '@src/alchemy-components/components/Select/Nested/types';
import { FILTER_DELIMITER } from '@src/app/search/utils/constants';
import { FeildFacetState } from '@src/app/searchV2/filtersPrototype/types';
import { mergeArraysPreferencingLast } from '@src/app/searchV2/filtersPrototype/utils';
import { useEntityRegistryV2 } from '@src/app/useEntityRegistry';
import { Domain, Entity, EntityType } from '@src/types.generated';
import { useMemo } from 'react';
import { isDomain } from '../utils';

export default function useOptions(
    facetState: FeildFacetState | undefined,
    entities: Entity[],
    renderLabel: (domain: Domain) => React.ReactNode,
) {
    const options: SelectOption[] = useMemo(() => {
        const entitiesFromAggregations =
            facetState?.facet?.aggregations
                .filter((aggregation) => aggregation.count > 0)
                .map((aggregation) => aggregation.entity)
                .filter(isDomain) ?? [];

        const mergedEntities = mergeArraysPreferencingLast(entities, entitiesFromAggregations, (entity) => entity.urn);

        const domains = mergedEntities.filter((entity): entity is Domain => entity.type === EntityType.Domain);

        const allParentDomains = domains
            .flatMap((domain) => domain.parentDomains?.domains ?? [])
            .filter((entity): entity is Domain => entity.type === EntityType.Domain);

        const allParentUrns = allParentDomains.map((domain) => domain.urn);

        const allDomains = mergeArraysPreferencingLast(allParentDomains, domains);

        console.log('>>> mergedEntities domains', {
            mergedEntities,
            entities,
            entitiesFromAggregations,
            allDomains: JSON.stringify(allDomains),
        });

        return allDomains.map((domain) => {
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
    }, [facetState, entities, renderLabel]);

    return options;
}
