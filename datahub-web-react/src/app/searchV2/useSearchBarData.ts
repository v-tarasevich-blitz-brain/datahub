import {
    useGetAutoCompleteMultipleResultsLazyQuery,
    useGetSearchResultsForMultipleLazyQuery,
} from '@src/graphql/search.generated';
import { AndFilterInput, Entity, EntityType, FacetMetadata } from '@src/types.generated';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDebounce } from 'react-use';
import { FieldToAppliedFieldFiltersMap } from './filtersV2/types';
import { generateOrFilters } from './utils/generateOrFilters';
import { UnionType } from './utils/constants';

type UpdateDataFunction = (
    query: string,
    orFilters: AndFilterInput[],
    types: EntityType[],
    viewUrn: string | undefined,
) => void;

type APIResponse = {
    updateData: UpdateDataFunction;
    facets?: FacetMetadata[];
    entities?: Entity[];
    loading?: boolean;
};

const useAutocompleteAPI = (): APIResponse => {
    const [entities, setEntities] = useState<Entity[] | undefined>();
    const [facets, setFacets] = useState<FacetMetadata[] | undefined>();
    const [getAutoCompleteMultipleResults, { data, loading }] = useGetAutoCompleteMultipleResultsLazyQuery();

    const updateData = useCallback(
        (query: string, orFilters: AndFilterInput[], types: EntityType[], viewUrn: string | undefined) => {
            if (query.length === 0) {
                setEntities(undefined);
                setFacets(undefined);
            } else {
                getAutoCompleteMultipleResults({
                    variables: {
                        input: {
                            query,
                            orFilters,
                            types,
                            viewUrn,
                        },
                    },
                });
            }
        },
        [getAutoCompleteMultipleResults],
    );

    useEffect(() => {
        if (!loading) {
            setEntities(data?.autoCompleteForMultiple?.suggestions?.flatMap((Suggestion) => Suggestion.entities) || []);
            setFacets(undefined);
        }
    }, [data, loading]);

    return { updateData, entities, facets, loading };
};

const useSearchAPI = (): APIResponse => {
    const [entities, setEntities] = useState<Entity[] | undefined>();
    const [facets, setFacets] = useState<FacetMetadata[] | undefined>();

    const [getSearchResultsForMultiple, { data, loading }] = useGetSearchResultsForMultipleLazyQuery();

    const updateData = useCallback(
        (query: string, orFilters: AndFilterInput[], types: EntityType[], viewUrn: string | undefined) => {
            // SearchAPI supports queries with 3 or longer characters
            if (query.length < 3) {
                setEntities(undefined);
                setFacets(undefined);
            } else {
                getSearchResultsForMultiple({
                    variables: {
                        input: {
                            query,
                            viewUrn,
                            orFilters,
                            count: 20,
                        },
                    },
                });
            }
        },
        [getSearchResultsForMultiple],
    );

    useEffect(() => {
        if (!loading) {
            setEntities(data?.searchAcrossEntities?.searchResults?.map((searchResult) => searchResult.entity) || []);
            setFacets(data?.searchAcrossEntities?.facets || []);
        }
    }, [data, loading]);

    return { updateData, entities, facets, loading };
};

// TODO:: add option for old search bar to skip query
export const useSearchBarData = (
    query: string,
    appliedFilters: FieldToAppliedFieldFiltersMap | undefined,
    searchAPIVariant: 'searchAcrossEntitiesAPI' | 'autocompleteAPI' | undefined,
) => {
    const [debouncedQuery, setDebouncedQuery] = useState<string>('');
    const autocompleteAPI = useAutocompleteAPI();
    const searchAPI = useSearchAPI();

    const api = useMemo(() => {
        switch (searchAPIVariant) {
            case 'searchAcrossEntitiesAPI':
                return searchAPI;
            case 'autocompleteAPI':
                return autocompleteAPI;
            default:
                return autocompleteAPI;
        }
    }, [searchAPIVariant, autocompleteAPI, searchAPI]);

    useDebounce(() => setDebouncedQuery(query), 300, [query]);

    const updateData = useMemo(() => api.updateData, [api.updateData]);
    const entities = useMemo(() => api.entities, [api.entities]);
    const facets = useMemo(() => api.facets, [api.facets]);
    const loading = useMemo(() => api.loading, [api.loading]);

    useEffect(() => {
        const flatAppliedFilters = Array.from(appliedFilters?.values?.() || [])
            .flatMap((value) => value.filters)
            .filter((filter) => filter.values?.length);

        updateData(debouncedQuery, generateOrFilters(UnionType.AND, flatAppliedFilters), [], undefined);
    }, [updateData, debouncedQuery, appliedFilters]);

    return { entities, facets, loading };
};
