import { SelectOption } from '@src/alchemy-components/components/Select/Nested/types';
import { FeildFacetState } from '@src/app/searchV2/filtersPrototype/types';
import { mergeArraysPreferencingLast } from '@src/app/searchV2/filtersPrototype/utils';
import { Domain, EntityType } from '@src/types.generated';
import { useMemo } from 'react';
import { isDomain } from '../utils';

function getLongestArray<T>(arrays: T[][]): T[] | null {
    if (arrays.length === 0) return null; // Return null if the input is empty

    return arrays.reduce((longest, current) => (current.length > longest.length ? current : longest), []);
}

export default function useOptions(
    facetState: FeildFacetState | undefined,
    domainsFromAppliedFilters: Domain[],
    renderLabel: (domain: Domain) => React.ReactNode,
) {
    const options: SelectOption[] = useMemo(() => {
        const aggregations = facetState?.facet?.aggregations ?? [];
        const filteredAggregations = aggregations.filter((aggregation) => aggregation.count > 0);
        const entitiesFromAggregations = filteredAggregations.map((aggregation) => aggregation.entity);
        const domainsFromAggregations = entitiesFromAggregations.filter(isDomain) ?? [];

        const mergedDomains = mergeArraysPreferencingLast(
            domainsFromAppliedFilters,
            domainsFromAggregations,
            (entity) => entity.urn,
        );

        // extract parent domains
        const allParentDomainsCombinations = mergedDomains
            .map((domain) => (domain?.parentDomains?.domains ?? []).filter(isDomain))
            .filter((domains) => domains.length !== 0);

        const a = Object.groupBy(allParentDomainsCombinations, (parentDomains) => parentDomains[0].urn);
        const longestParentDomainsStacks = Object.values(a)
            .filter((groupedDomains) => !!groupedDomains)
            .map((groupedDomains) => getLongestArray(groupedDomains))
            .filter((domains) => !!domains);

        const parentDomains = longestParentDomainsStacks
            .map((domains) => {
                let stack: Domain[] = [];

                return domains.map((domain, index) => {
                    const newDomain: Domain = {
                        ...domain,
                        parentDomains: {
                            count: stack.length,
                            domains: stack,
                        },
                    };
                    stack = [...stack, newDomain];
                    return newDomain;
                });
            })
            .flat();

        mergedDomains.forEach((domain) => {
            const parentDomains = (domain.parentDomains?.domains ?? []).filter(isDomain);
            if (parentDomains.length === 0) return;
        });

        const domains = mergedDomains.filter((entity): entity is Domain => entity.type === EntityType.Domain);
        const allParentUrns = parentDomains.map((domain) => domain.urn);

        const allDomains = mergeArraysPreferencingLast(parentDomains, domains, (entity) => entity.urn);

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
    }, [facetState, domainsFromAppliedFilters, renderLabel]);

    return options;
}
