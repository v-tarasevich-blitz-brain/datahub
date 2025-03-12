import { useAggregateAcrossEntitiesQuery } from '@src/graphql/search.generated';
import { EntityType, FacetFilterInput, FacetMetadata } from '@src/types.generated';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { FeildFacetState, FieldName, FieldToFacetStateMap } from '../types';
import { useSearchFiltersContext } from '../SearchFiltersContext';
import { ENTITY_SUB_TYPE_FILTER_NAME } from '../../utils/constants';
import useUpdateEntityTypes from './hooks/useUpdateEntityTypes';

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

interface FacetsUpdaterProps {
    fieldNames: FieldName[];
    query: string;
    onFacetsUpdated: (facets: FieldToFacetStateMap) => void;
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
                query,
                // TODO:: add dynamic condition
                orFilters: [{ and: filters }],
                facets: [fieldName],
            },
        },
        skip: filters.length === 0,
    });

    useEffect(() => {
        onFieldFacetUpdated(fieldName, {
            facet: data?.aggregateAcrossEntities?.facets?.find((facet) => facet.field === fieldName),
            loading,
        });
    }, [onFieldFacetUpdated, data?.aggregateAcrossEntities?.facets, loading]);

    return null;
}

function FacetsUpdater({ fieldNames, query, onFacetsUpdated }: FacetsUpdaterProps) {
    const [facets, setFacets] = useState<FacetMetadata[]>([]);
    const [isInitialized, setIsInitialized] = useState<boolean>(false);
    const { fieldToAppliedFiltersMap } = useSearchFiltersContext();

    const appliedFiltersForAnotherFields = useMemo(
        () =>
            Array.from(fieldToAppliedFiltersMap.entries())
                .filter(([key, _]) => !fieldNames.includes(key))
                .flatMap(([_, value]) => value.filters),

        [fieldToAppliedFiltersMap],
    );

    const entityTypesFromFilters = useMemo(() => {
        return appliedFiltersForAnotherFields
            .filter((filter) => filter.field === ENTITY_SUB_TYPE_FILTER_NAME)
            .flatMap((filter) => filter.values)
            .filter((value): value is EntityType => !!value);
    }, [appliedFiltersForAnotherFields]);

    const filters = useMemo(() => {
        return appliedFiltersForAnotherFields.filter((filter) => filter.field !== ENTITY_SUB_TYPE_FILTER_NAME);
    }, [appliedFiltersForAnotherFields]);

    const { data, loading } = useAggregateAcrossEntitiesQuery({
        variables: {
            input: {
                types: entityTypesFromFilters,
                query,
                // TODO:: add dynamic condition
                orFilters: [{ and: filters }],
                facets: fieldNames,
            },
        },
        skip: fieldNames.length === 0,
    });

    useEffect(() => {
        if (!loading) {
            setFacets(data?.aggregateAcrossEntities?.facets ?? []);
            setIsInitialized(true);
        }
    }, [loading, data, setFacets]);

    useEffect(() => {
        if (isInitialized)
            onFacetsUpdated(
                new Map(
                    fieldNames.map((fieldName) => [
                        fieldName,
                        {
                            facet: facets.find((facet) => facet.field === fieldName),
                            loading,
                        },
                    ]),
                ),
            );
    }, [onFacetsUpdated, facets, loading, isInitialized]);

    return null;
}

export default ({ fieldNames, query, onFieldFacetsUpdated }: DynamicFacetsUpdaterProps) => {
    const { fieldToAppliedFiltersMap } = useSearchFiltersContext();

    const [fieldFacets, setFieldFacets] = useState<FieldToFacetStateMap>(new Map());

    const onFacetsUpdated = useCallback(
        (facets: Map<FieldName, FeildFacetState>) => {
            setFieldFacets((currentFieldFacets) => new Map([...currentFieldFacets, ...facets]));
        },
        [setFieldFacets],
    );

    // useUpdateEntityTypes(ENTITY_SUB_TYPE_FILTER_NAME, query, onFieldFacetUpdated);

    useEffect(() => onFieldFacetsUpdated?.(fieldFacets), [onFieldFacetsUpdated, fieldFacets]);

    const hasFiltersByEntityType = useMemo(
        () =>
            Array.from(fieldToAppliedFiltersMap.entries()).some(
                ([key, filter]) => key === ENTITY_SUB_TYPE_FILTER_NAME && filter.filters.length > 0,
            ),
        [fieldToAppliedFiltersMap],
    );

    const hasAnotherFilters = useMemo(
        () =>
            Array.from(fieldToAppliedFiltersMap.entries()).some(
                ([key, filter]) => key !== ENTITY_SUB_TYPE_FILTER_NAME && filter.filters.length > 0,
            ),
        [fieldToAppliedFiltersMap],
    );

    console.log('>>> FacetUPdater', { hasFiltersByEntityType, hasAnotherFilters, fieldToAppliedFiltersMap });

    return (
        <>
            {/* In a case when there're no any filters applied we can use a single request for all fields */}
            {!hasFiltersByEntityType && !hasAnotherFilters && (
                <FacetsUpdater fieldNames={fieldNames} query={query} onFacetsUpdated={onFacetsUpdated} />
            )}

            {/* In a case when there're only filters by entity type we have to call requests for entity types and another fields separately */}
            {hasFiltersByEntityType && !hasAnotherFilters && (
                <>
                    <FacetsUpdater
                        fieldNames={fieldNames.filter((fieldName) => fieldName === ENTITY_SUB_TYPE_FILTER_NAME)}
                        query={query}
                        onFacetsUpdated={onFacetsUpdated}
                    />
                    <FacetsUpdater
                        fieldNames={fieldNames.filter((fieldName) => fieldName !== ENTITY_SUB_TYPE_FILTER_NAME)}
                        query={query}
                        onFacetsUpdated={onFacetsUpdated}
                    />
                </>
            )}

            {/* In a case when there're both filters by entity type and by non-entity-type fields we have to call separated requests for each field */}
            {hasAnotherFilters &&
                fieldNames.map((fieldName) => (
                    <FacetsUpdater
                        key={fieldName}
                        fieldNames={[fieldName]}
                        query={query}
                        onFacetsUpdated={onFacetsUpdated}
                    />
                ))}
        </>
    );
};
