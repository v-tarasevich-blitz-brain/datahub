import { useEffect, useMemo } from 'react';
import { useSearchFiltersContext } from '../../SearchFiltersContext';
import { FeildFacetState, FieldName } from '../../types';
import useGetAggregations from './useGetAggregations';

export default function useUpdateEntityTypes(
    fieldName: FieldName,
    query: string,

    onFieldFacetUpdated: (fieldName: FieldName, facetState: FeildFacetState) => void,
) {
    const { fieldToAppliedFiltersMap } = useSearchFiltersContext();

    const filters = useMemo(
        () =>
            Array.from(fieldToAppliedFiltersMap.entries())
                .filter(([fieldNameKey, _]) => fieldNameKey !== fieldName)
                .map(([_, value]) => value.filters)
                .flat(),

        [fieldName, fieldToAppliedFiltersMap],
    );

    const hasAppliedFiltersByEntityType = useMemo(() => {
        Array.from(fieldToAppliedFiltersMap.entries()).find(
            ([key, value]) => key === fieldName && value.filters.length > 0,
        );
    }, []);

    const { data, loading } = useGetAggregations([fieldName], query, filters);

    useEffect(() => {
        onFieldFacetUpdated(fieldName, {
            facet: data?.aggregateAcrossEntities?.facets?.find((facet) => facet.field === fieldName),
            loading,
        });
    }, [onFieldFacetUpdated, data, loading]);
}
