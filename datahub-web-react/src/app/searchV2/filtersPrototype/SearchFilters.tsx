import { useCallback, useEffect, useMemo, useState } from 'react';
// import { FeildFacetState, FieldName, SearchFiltersProvider } from './SearchFiltersContext';
import { useAggregateAcrossEntitiesLazyQuery, useAggregateAcrossEntitiesQuery } from '@src/graphql/search.generated';
import TestField from './TestField';
import styled from 'styled-components';
import { FacetFilterInput, FacetMetadata, FilterOperator } from '@src/types.generated';
import { FacetsGetterResponse, FieldName } from './types';
import { SearchFiltersProvider } from './SearchFiltersContext';

const Container = styled.div`
    display: flex;
    flex-direction: row;
    gap: 16px;
    padding: 16px 8px;
`;

interface SearchFiltersProps {
    query: string;
}

export default function SearchFilters({ query }: SearchFiltersProps) {
    // TODO: >>> pass field through props
    const fields = ['platform', 'domains'];
    // TODO: >>> add defaults
    const [appliedFilters, setAppliedFilters] = useState<FacetFilterInput[]>([]);

    // const [filterValues, setFilterValues] = useState<

    const [facets, setFacets] = useState<FacetMetadata[]>([]);
    // const [fieldsFacet, setFieldsFacet] = useState<FieldFacetState>({});
    // const [activeField, setActiveField] = useState<FieldName>();
    // const [updatingField, setUpdatingField] = useState<FieldName>();

    const applyFilter = (fieldName: FieldName, values: string[]) => {
        setAppliedFilters((filters) => {
            const otherFilters = filters.filter((filter) => filter.field !== fieldName);

            if (values.length === 0) {
                return otherFilters;
            }

            return [
                ...otherFilters,
                {
                    field: fieldName,
                    condition: FilterOperator.In,
                    values: values,
                },
            ];
        });
    };

    const wrappedQuery = useMemo(() => {
        if (query.length === 0) return query;
        if (query.length < 3) return `${query}*`;
        return query;
    }, [query]);

    const [aggregateAcrossEntityes, { data, loading }] = useAggregateAcrossEntitiesLazyQuery({
        variables: {
            input: {
                types: [],
                query: wrappedQuery,
                // orFilters: [],
                orFilters: [{ and: appliedFilters }],
                facets: fields,
            },
        },
    });

    useEffect(() => {
        setFacets(data?.aggregateAcrossEntities?.facets || []);
    }, [data]);

    const updateFacets = (fieldNames: FieldName[]) => {
        aggregateAcrossEntityes({
            variables: {
                input: {
                    types: [],
                    query: wrappedQuery,
                    // orFilters: [],
                    orFilters: [{ and: appliedFilters }],
                    facets: fieldNames,
                },
            },
        })

    };

    useEffect(() => {
        updateFacets(fields);
    },[])

    const getValues = (fieldName: string) => {};

    const onFilterUpdate = (fieldName: string, values: string[]) => {
        applyFilter(fieldName, values);
        updateFacets(fields.filter(field=>field !== fieldName))
    };

    // useEffect(() => {
    //     if (activeField) {
    //         aggregateAcrossEntities({
    //             variables: {
    //                 input: {
    //                     types: [],
    //                     query: 'p*',
    //                     orFilters: [],
    //                     facets: fields,
    //                 },
    //             },
    //         });
    //         setUpdatingField(activeField);
    //     }
    // }, [activeField, aggregateAcrossEntities]);

    // useEffect(() => {
    //         if (loading) setFieldsFacet(state => state)

    //         if (loading) setFieldsFacet((state) => ({ ...state, [updatingField]: { loading, facet: undefined } }));

    //         if (data) {
    //             setFieldsFacet((state) => ({
    //                 ...state,
    //                 [updatingField]: {
    //                     loading,
    //                     facet: data?.aggregateAcrossEntities?.facets?.find((facet) => facet.field === updatingField),
    //                 },
    //             }));
    //             setUpdatingField(undefined);
    //         }
    //     }
    // }, [data, loading]);

    const getFacets = useCallback(
        (fieldNames: FieldName[]) => {
            return {
                loading,
                facets: facets.filter((facet) => fieldNames.includes(facet.field)),
            };
        },
        [facets, loading],
    );

    return (
        <SearchFiltersProvider getFacets={getFacets} fields={fields}>
            <Container>
                <TestField fieldName="domains" onUpdate={(values) => onFilterUpdate('domains', values)} />
                <TestField fieldName="platform" onUpdate={(values) => onFilterUpdate('platform', values)} />
            </Container>
        </SearchFiltersProvider>
    );
}
