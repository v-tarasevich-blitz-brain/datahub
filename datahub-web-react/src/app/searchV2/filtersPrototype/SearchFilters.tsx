import { useMemo, useState } from 'react';
import DynamicFacetsUpdater from './defaults/DynamicFacetsUpdater';
import filterRegistry from './FilterRegistry';
import FiltersRenderingRunner from './FiltersRenderingRunner';
import { SearchFiltersProvider } from './SearchFiltersContext';
import { FieldToFacetStateMap, FiltersAppliedHandler } from './types';
import {
    DOMAINS_FILTER_NAME,
    ENTITY_SUB_TYPE_FILTER_NAME,
    OWNERS_FILTER_NAME,
    PLATFORM_FILTER_NAME,
    TAGS_FILTER_NAME,
} from '../utils/constants';
import { DomainFilter, EntityTypeFilter, OwnerFilter, PlatformEntityFilter, TagFilter } from './filters';

interface SearchFiltersProps {
    query: string;
    onFiltersApplied?: FiltersAppliedHandler;
}

filterRegistry.registerFieldFilterComponent(PLATFORM_FILTER_NAME, PlatformEntityFilter);
filterRegistry.registerFieldFilterComponent(ENTITY_SUB_TYPE_FILTER_NAME, EntityTypeFilter);
filterRegistry.registerFieldFilterComponent(OWNERS_FILTER_NAME, OwnerFilter);
filterRegistry.registerFieldFilterComponent(TAGS_FILTER_NAME, TagFilter);
filterRegistry.registerFieldFilterComponent(DOMAINS_FILTER_NAME, DomainFilter);

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
            <FiltersRenderingRunner fieldNames={fields} hideEmptyFilters />
        </SearchFiltersProvider>
    );
}
