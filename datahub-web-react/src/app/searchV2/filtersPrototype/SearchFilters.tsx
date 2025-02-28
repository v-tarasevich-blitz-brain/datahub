import { useMemo, useState } from 'react';
import styled from 'styled-components';
import DynamicFacetsUpdater from './defaults/DynamicFacetsUpdater';
import FiltersRenderer from './FiltersRenderer';
import { SearchFiltersProvider } from './SearchFiltersContext';
import { FieldToFacetStateMap } from './types';

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
    const [fieldToFacetStateMap, setFieldToFacetStateMap] = useState<FieldToFacetStateMap>(new Map());

    const wrappedQuery = useMemo(() => {
        if (query.length === 0) return query;
        if (query.length < 3) return `${query}*`;
        return query;
    }, [query]);

    return (
        <SearchFiltersProvider
            fieldFacets={fieldToFacetStateMap}
            fields={fields}
            fieldToFacetStateMap={fieldToFacetStateMap}
        >
            <DynamicFacetsUpdater
                fieldNames={fields}
                query={wrappedQuery}
                onFieldFacetsUpdated={(map) => setFieldToFacetStateMap(map)}
            />
            <FiltersRenderer />
        </SearchFiltersProvider>
    );
}
