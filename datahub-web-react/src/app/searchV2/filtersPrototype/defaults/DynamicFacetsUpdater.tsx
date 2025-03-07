import { useAggregateAcrossEntitiesQuery } from '@src/graphql/search.generated';
import { EntityType, FacetFilterInput } from '@src/types.generated';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { FeildFacetState, FieldName, FieldToFacetStateMap } from '../types';
import { useSearchFiltersContext } from '../SearchFiltersContext';
import { ENTITY_SUB_TYPE_FILTER_NAME } from '../../utils/constants';

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

    const [entityTypes, filters] = useMemo(() => {
        const entityTypes = appliedFiltersExludingCurrentField
            .filter((filter) => filter.field === ENTITY_SUB_TYPE_FILTER_NAME)
            .map((filter) => filter.values)
            .flat()
            .filter((value): value is EntityType => !!value);

        const anotherFilters = appliedFiltersExludingCurrentField.filter(
            (filter) => filter.field !== ENTITY_SUB_TYPE_FILTER_NAME,
        );

        return [entityTypes, anotherFilters];
    }, [appliedFiltersExludingCurrentField]);

    const { data, loading } = useAggregateAcrossEntitiesQuery({
        variables: {
            input: {
                types: entityTypes,
                query: query,
                // TODO:: add dynamic condition
                orFilters: [{ and: filters }],
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

export default memo(function DynamicFacetsUpdater({
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
                    key={fieldName}
                    fieldName={fieldName}
                    query={query}
                    onFieldFacetUpdated={onFieldFacetUpdated}
                />
            ))}
        </>
    );
});
