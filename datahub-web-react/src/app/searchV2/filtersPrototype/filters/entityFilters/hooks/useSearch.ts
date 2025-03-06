import { useGetAutoCompleteMultipleResultsLazyQuery } from '@src/graphql/search.generated';
import { EntityType } from '@src/types.generated';
import { useEffect } from 'react';

export default function useSearch(query: string, entityTypes: EntityType[]) {
    const [getSearchResults, { data, loading }] = useGetAutoCompleteMultipleResultsLazyQuery();

    useEffect(() => {
        if (query !== '') {
            getSearchResults({
                variables: {
                    input: {
                        query: query,
                        types: entityTypes,
                        // TODO:: use constant!
                        limit: 20,
                    },
                },
            });
        }
    }, [query, entityTypes]);

    return { data, loading };
}
