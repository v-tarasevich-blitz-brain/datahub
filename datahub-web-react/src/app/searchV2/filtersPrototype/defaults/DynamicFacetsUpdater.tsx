import { useAggregateAcrossEntitiesQuery } from '@src/graphql/search.generated';
import { FacetFilterInput } from '@src/types.generated';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FeildFacetState, FieldName, FieldToFacetStateMap } from '../types';
import { useSearchFiltersContext } from '../SearchFiltersContext';

interface DynamicFacetsUpdaterProps {
    fieldNames: FieldName[];
    // appliedFilters: FacetFilterInput[];
    onFieldFacetsUpdated?: (fieldToFacetStateMap: FieldToFacetStateMap) => void;
    query: string;
}

interface FieldFacetUpdaterProps {
    fieldName: FieldName;
    // appliedFilters: FacetFilterInput[];
    query: string;
    onFieldFacetUpdated: (fieldName: FieldName, facetState: FeildFacetState) => void;
}

function FieldFacetUpdater({ fieldName, query, onFieldFacetUpdated }: FieldFacetUpdaterProps) {
    const { fieldToAppliedFiltersMap } = useSearchFiltersContext();

    const appliedFiltersExludingCurrentField = useMemo(
        () =>
            Array.from(fieldToAppliedFiltersMap.entries())
                .filter(([fieldNameKey, _]) => fieldNameKey !== fieldName)
                .map(([_, value]) => value.filters)
                .flat(),

        [fieldName, fieldToAppliedFiltersMap],
    );

    const { data, loading } = useAggregateAcrossEntitiesQuery({
        variables: {
            input: {
                types: [],
                query: query,
                // TODO: >>> add dynamic condition
                orFilters: [{ and: appliedFiltersExludingCurrentField }],
                facets: [fieldName],
            },
        },
    });

    useEffect(() => {
        onFieldFacetUpdated(fieldName, {
            facet: data?.aggregateAcrossEntities?.facets?.find((facet) => facet.field === fieldName),
            loading,
        });
    }, [onFieldFacetUpdated, data?.aggregateAcrossEntities?.facets, loading]);

    return null;
}

export default function DynamicFacetsUpdater({
    fieldNames,
    query,
    onFieldFacetsUpdated,
}: DynamicFacetsUpdaterProps) {
    const [fieldFacets, setFieldFacets] = useState<Map<FieldName, FeildFacetState>>(new Map());

    const onFieldFacetUpdated = useCallback(
        (fieldName: FieldName, facetState: FeildFacetState) => {
            setFieldFacets((currentFieldFacets) => new Map(currentFieldFacets.set(fieldName, facetState)));
        },
        [setFieldFacets],
    );

    useEffect(() => onFieldFacetsUpdated?.(fieldFacets), [onFieldFacetsUpdated, fieldFacets]);

    return (
        <>
            {fieldNames.map((fieldName) => (
                <FieldFacetUpdater
                    fieldName={fieldName}
                    query={query}
                    onFieldFacetUpdated={onFieldFacetUpdated}
                />
            ))}
        </>
    );
}
