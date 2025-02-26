import { useCallback, useEffect, useState } from 'react';
import { FeildFacetState, FieldName, SearchFiltersProvider } from './SearchFiltersContext';
import { useAggregateAcrossEntitiesLazyQuery, useAggregateAcrossEntitiesQuery } from '@src/graphql/search.generated';
import TestField from './TestField';
import styled from 'styled-components';

type FieldFacetState = {
    [fieldName: FieldName]: FeildFacetState;
};

const Container = styled.div`
    /* height: 300px; */
    /* position: relative; */
    display: flex;
    flex-direction: row;
    gap: 16px;
    /* position: relative; */
`;

export default function SearchFilters() {
    const fields = ['platform', 'domains'];
    // const [fieldsFacet, setFieldsFacet] = useState<FieldFacetState>({});
    // const [activeField, setActiveField] = useState<FieldName>();
    // const [updatingField, setUpdatingField] = useState<FieldName>();

    const { data, loading } = useAggregateAcrossEntitiesQuery({
        variables: {
            input: {
                types: [],
                query: 'p*',
                orFilters: [],
                facets: fields,
            },
        },
    });

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

    const getFacetForField = useCallback(
        (fieldName: FieldName) => {
            return {
                loading,
                facet: data?.aggregateAcrossEntities?.facets?.find((facet) => facet.field === fieldName)
            }
        },
        [data, loading],
    );

    return (
        <SearchFiltersProvider getFacetForField={getFacetForField} fields={fields}>
            <Container>
                <TestField fieldName='domains'/>
                <TestField fieldName='platform'/>
                {/* <TestField />
                <TestField />
                <TestField /> */}
                <input />
            </Container>
        </SearchFiltersProvider>
    );
}
