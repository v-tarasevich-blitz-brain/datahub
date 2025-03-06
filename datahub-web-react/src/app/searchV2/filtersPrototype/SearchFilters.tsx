import { memo, useMemo, useState } from 'react';
import styled from 'styled-components';
import DynamicFacetsUpdater from './defaults/DynamicFacetsUpdater';
import FiltersRenderingRunner from './FiltersRenderingRunner';
import { SearchFiltersProvider } from './SearchFiltersContext';
import { FieldToFacetStateMap, FiltersAppliedHandler } from './types';
import filterRegistry from './FilterRegistry';
import PlatformEntityFilter from './defaults/filters/PlatformFilter';
import {
    DOMAINS_FILTER_NAME,
    ENTITY_SUB_TYPE_FILTER_NAME,
    FIELD_TAGS_FILTER_NAME,
    OWNERS_FILTER_NAME,
    PLATFORM_FILTER_NAME,
    TAGS_FILTER_NAME,
} from '../utils/constants';
import OwnerFilter from './defaults/filters/OwnerFilter';
import TagFilter from './defaults/filters/TagFilter';
// import DomainFilter from './defaults/filters/DomainFilter';
import EntityTypeFilter from './defaults/filters/EntityTypeFilter/EntityTypeFilter';
import DomainFilter from './defaults/filters/DomainFilter/DomainFilter';

const Container = styled.div`
    display: flex;
    flex-direction: row;
    gap: 16px;
    padding: 16px 8px;
`;

interface SearchFiltersProps {
    query: string;
    onFiltersApplied?: FiltersAppliedHandler;
}

filterRegistry.registerRenderer(PLATFORM_FILTER_NAME, PlatformEntityFilter);
filterRegistry.registerRenderer(ENTITY_SUB_TYPE_FILTER_NAME, EntityTypeFilter);
filterRegistry.registerRenderer(OWNERS_FILTER_NAME, OwnerFilter);
filterRegistry.registerRenderer(TAGS_FILTER_NAME, TagFilter);
filterRegistry.registerRenderer(DOMAINS_FILTER_NAME, DomainFilter);

export default function SearchFilters({ query, onFiltersApplied }: SearchFiltersProps) {
    // TODO:: pass field through props
    const fields = useMemo(
        () => [
            PLATFORM_FILTER_NAME,
            ENTITY_SUB_TYPE_FILTER_NAME,
            OWNERS_FILTER_NAME,
            TAGS_FILTER_NAME,
            DOMAINS_FILTER_NAME,
        ],
        [],
    );
    const [fieldToFacetStateMap, setFieldToFacetStateMap] = useState<FieldToFacetStateMap>(new Map());

    const wrappedQuery = useMemo(() => {
        if (query.length === 0) return query;
        if (query.length < 3 && !query.endsWith('*')) return `${query}*`;
        return query;
    }, [query]);

    return (
        <SearchFiltersProvider
            fieldFacets={fieldToFacetStateMap}
            fields={fields}
            fieldToFacetStateMap={fieldToFacetStateMap}
            onFiltersApplied={onFiltersApplied}
        >
            <DynamicFacetsUpdater
                fieldNames={fields}
                query={wrappedQuery}
                onFieldFacetsUpdated={(map) => setFieldToFacetStateMap(map)}
            />
            <FiltersRenderingRunner fields={fields} />
        </SearchFiltersProvider>
    );
}
