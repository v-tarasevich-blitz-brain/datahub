import { FeildFacetState } from '@src/app/searchV2/filtersPrototype/types';
import { Domain, EntityType } from '@src/types.generated';
import { renderHook } from '@testing-library/react-hooks';
import useOptions from '../useOptions';

function getSampleDomain(urn: string, parents: Domain[] = []): Domain {
    return {
        urn,
        id: urn,
        type: EntityType.Domain,
        properties: { name: urn },
        parentDomains: {
            count: parents.length,
            domains: parents,
        },
    };
}

function getFacetState(domains: Domain[]): FeildFacetState {
    return {
        facet: {
            field: 'domain',
            aggregations: domains.map((domain) => ({
                count: 1,
                entity: domain,
                value: domain.urn,
            })),
        },
    };
}

function renderLabel(domain: Domain) {
    return domain.urn;
}

describe('useOptions', () => {
    it('should handle nested domains', () => {
        const parentDomain = getSampleDomain('parent');
        const childDomain = getSampleDomain('child', [parentDomain]);
        const nestedChildDomain = getSampleDomain('nestedChild', [childDomain]);
        const facetState = getFacetState([parentDomain, childDomain, nestedChildDomain]);

        const response = renderHook(() => useOptions(facetState, [], renderLabel)).result.current;

        expect(response).toStrictEqual([
            {
                value: parentDomain.urn,
                label: parentDomain.urn,
                entity: parentDomain,
                isParent: true,
                parentValue: undefined,
            },
            {
                value: childDomain.urn,
                label: childDomain.urn,
                entity: childDomain,
                isParent: true,
                parentValue: parentDomain.urn,
            },
            {
                value: nestedChildDomain.urn,
                label: nestedChildDomain.urn,
                entity: nestedChildDomain,
                isParent: false,
                parentValue: childDomain.urn,
            },
        ]);
    });

    it('should add additional domains to options', () => {
        const domain = getSampleDomain('domain');
        const additionalDomain = getSampleDomain('additionalDomain');
        const facetState = getFacetState([domain]);

        const response = renderHook(() => useOptions(facetState, [additionalDomain], renderLabel)).result.current;

        expect(response).toStrictEqual([
            {
                value: additionalDomain.urn,
                label: additionalDomain.urn,
                entity: { ...additionalDomain, parentDomains: { count: 0, domains: [] } },
                isParent: false,
                parentValue: undefined,
            },
            {
                value: domain.urn,
                label: domain.urn,
                entity: domain,
                isParent: false,
                parentValue: undefined,
            },
        ]);
    });

    it('should handle duplicates in additional domains', () => {
        const domain = getSampleDomain('domain');
        const additionalDomain = getSampleDomain('domain');
        const facetState = getFacetState([domain]);

        const response = renderHook(() => useOptions(facetState, [additionalDomain], renderLabel)).result.current;

        expect(response).toStrictEqual([
            {
                value: additionalDomain.urn,
                label: additionalDomain.urn,
                entity: additionalDomain,
                isParent: false,
                parentValue: undefined,
            },
        ]);
    });

    it('should extract parents from facetState', () => {
        const domain = getSampleDomain('domain');
        const subDomain = getSampleDomain('subDomain', [domain]);
        const facetState = getFacetState([subDomain]);

        const response = renderHook(() => useOptions(facetState, [], renderLabel)).result.current;

        console.log('>>>', response);
        expect(response).toStrictEqual([
            {
                value: domain.urn,
                label: domain.urn,
                entity: domain,
                isParent: true,
                parentValue: undefined,
            },
            {
                value: subDomain.urn,
                label: subDomain.urn,
                entity: subDomain,
                isParent: false,
                parentValue: domain.urn,
            },
        ]);
    });
});
