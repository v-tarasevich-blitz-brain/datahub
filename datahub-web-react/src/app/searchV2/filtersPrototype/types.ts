import { FacetFilterInput, FacetMetadata } from '@src/types.generated';
import React from 'react';

export type FieldName = string;
export type FacetsGetterResponse = {
    facets?: FacetMetadata[] | undefined;
    loading?: boolean;
}
export type FacetsGetter = (fieldNames: FieldName[]) => FacetsGetterResponse | undefined;

export interface FilterRendererProps {
    getFacets: (fieldNames: FieldName[]) => FacetMetadata[];
    onApplyFilter: (fieldName: FieldName) => void;
}

export type FilterRenderer = (props: FilterRendererProps) => React.ReactNode;

export interface Filter {
    values: string[];
    fieldName: FieldName;
    render: FilterRenderer;
}

export interface FiltersRendererProps {
    filters: Filter[];
}


export type FeildFacetState = {
    facet?: FacetMetadata | undefined;
    loading?: boolean;
}


export type FieldFacetGetter = (fieldName: string) => FeildFacetState | undefined;

// Context
export type SearchFiltersContextType = {
    getFacets: FacetsGetter;
    fields: FieldName[];
    appliedFilters: FacetFilterInput[];
};

// Context provider props
export interface SearchFiltersProviderProps {
    getFacets: FacetsGetter;
    fields: FieldName[];
    defaultAppliedFilters?: FacetFilterInput[];
}
