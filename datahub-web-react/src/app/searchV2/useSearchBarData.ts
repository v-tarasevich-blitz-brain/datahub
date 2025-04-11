import {
    useGetAutoCompleteMultipleResultsLazyQuery,
    useGetSearchResultsForMultipleTrimmedLazyQuery,
} from '@src/graphql/search.generated';
import { AndFilterInput, Entity, EntityType, FacetMetadata, SearchBarApi } from '@src/types.generated';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDebounce } from 'react-use';
import { FieldToAppliedFieldFiltersMap } from './filtersV2/types';
import { generateOrFilters } from './utils/generateOrFilters';
import { ENTITY_SUB_TYPE_FILTER_NAME, UnionType } from './utils/constants';
import { isEntityType } from '../entityV2/shared/utils';

type UpdateDataFunction = (
    query: string,
    orFilters: AndFilterInput[],
    types: EntityType[],
    viewUrn: string | undefined | null,
) => void;

type APIResponse = {
    updateData: UpdateDataFunction;
    facets?: FacetMetadata[];
    entities?: Entity[];
    loading?: boolean;
};

export type SearchResponse = {
    facets?: FacetMetadata[];
    entities?: Entity[];
    loading?: boolean;
    searchAPIVariant?: SearchBarApi;
};

const SEARCH_API_RESPONSE_MAX_ITEMS = 20;

const useAutocompleteAPI = (): APIResponse => {
    const [entities, setEntities] = useState<Entity[] | undefined>();
    const [facets, setFacets] = useState<FacetMetadata[] | undefined>();
    const [getAutoCompleteMultipleResults, { data, loading }] = useGetAutoCompleteMultipleResultsLazyQuery();

    const updateData = useCallback(
        (query: string, orFilters: AndFilterInput[], types: EntityType[], viewUrn: string | undefined | null) => {
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

    const [getSearchResultsForMultiple, { data, loading }] = useGetSearchResultsForMultipleTrimmedLazyQuery();

    const updateData = useCallback(
        (query: string, orFilters: AndFilterInput[], types: EntityType[], viewUrn: string | undefined | null) => {
            // SearchAPI supports queries with 3 or longer characters
            if (query.length < 3) {
                setEntities(undefined);
                // set to empty array instead of undefined to forcibly control facets
                // FYI: undefined triggers requests to get facets. see `filtersV2/SearchFilters` for details
                setFacets([]);
            } else {
                getSearchResultsForMultiple({
                    variables: {
                        input: {
                            query,
                            types,
                            viewUrn,
                            orFilters,
                            count: SEARCH_API_RESPONSE_MAX_ITEMS,
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

export const useSearchBarData = (
    query: string,
    appliedFilters: FieldToAppliedFieldFiltersMap | undefined,
    viewUrn: string | undefined | null,
    searchAPIVariant: SearchBarApi | undefined,
    enabled: boolean,
): SearchResponse => {
    const [debouncedQuery, setDebouncedQuery] = useState<string>('');
    const autocompleteAPI = useAutocompleteAPI();
    const searchAPI = useSearchAPI();

    const api = useMemo(() => {
        switch (searchAPIVariant) {
            case SearchBarApi.SearchAcrossEntities:
                return searchAPI;
            case SearchBarApi.AutocompleteForMultiple:
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
        if (enabled) {
            const entityTypes =
                appliedFilters
                    ?.get(ENTITY_SUB_TYPE_FILTER_NAME)
                    ?.filters?.flatMap((filter) => filter.values)
                    ?.filter(isEntityType) ?? [];

            const flatAppliedFilters = Array.from(appliedFilters?.entries?.() || [])
                .filter(([key, _]) => key !== ENTITY_SUB_TYPE_FILTER_NAME)
                .flatMap(([_, value]) => value.filters)
                .filter((filter) => filter.values?.length);

            updateData(debouncedQuery, generateOrFilters(UnionType.AND, flatAppliedFilters), entityTypes, viewUrn);
        }
    }, [updateData, debouncedQuery, appliedFilters, viewUrn, enabled]);

    return { entities, facets, loading, searchAPIVariant };
};
