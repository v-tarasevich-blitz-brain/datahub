import { useAggregateAcrossEntitiesQuery } from '@src/graphql/search.generated';
import { FieldName } from '../../types';
import { FacetFilterInput } from '@src/types.generated';

export default function useGetAggregations(
    fieldNames: FieldName[],
    query: string,
    filters: FacetFilterInput[],
    skip: boolean = false,
) {
    const { data, loading } = useAggregateAcrossEntitiesQuery({
        variables: {
            input: {
                query,
                // TODO:: add dynamic condition
                orFilters: [{ and: filters }],
                facets: fieldNames,
            },
        },
        skip,
    });

    return { data, loading };
}
