import { FacetFilterInput, FacetMetadata } from '@src/types.generated';
import React from 'react';

export type FieldName = string;
export type FacetsGetterResponse = {
    facets?: FacetMetadata[] | undefined;
    loading?: boolean;
}
export type FacetsGetter = (fieldNames: FieldName[]) => FieldToFacetStateMap | undefined;

export type FilterValue = string;

export type FieldAppliedFiltersMap = Map<FieldName, FacetFilterInput[]>;

export interface FilterRendererProps {
    fieldName: FieldName;
    facetState?: FeildFacetState;
    appliedFilters?: FacetFilterInput[];
    onUpdate?: (values: FacetFilterInput[]) => void;
}

export type FilterRenderer = (props: FilterRendererProps) => React.ReactNode;

export interface Filter {
    fieldName: FieldName;
    props: FilterRendererProps;
    render: FilterRenderer;
}

export interface FiltersRendererProps {
    filters: Filter[];
}


export type FeildFacetState = {
    facet?: FacetMetadata | undefined;
    loading?: boolean;
}

export type FieldToFacetStateMap = Map<FieldName, FeildFacetState>;


export type FieldFacetGetter = (fieldName: FieldName) => FeildFacetState | undefined;


export type FiltersRenderer = (props: FiltersRendererProps) => React.ReactNode;
// Context
export type SearchFiltersContextType = {
    fields: FieldName[];

    // State of facets for each field
    fieldToFacetStateMap: FieldToFacetStateMap

    // Internal state of applied filters
    fieldToAppliedFiltersMap: FieldAppliedFiltersMap;
    updateFieldAppliedFilters: FiledAppliedFilterUpdater;

    // takes all filters and render them together
    filtersRenderer: FiltersRenderer;

    // TODO: >>> remove
    fieldFacets?: FieldToFacetStateMap;
    getFacets?: FacetsGetter;
};

// Context provider props
export interface SearchFiltersProviderProps {
    fieldFacets?: FieldToFacetStateMap;
    getFacets?: FacetsGetter;
    fields: FieldName[];
    defaultAppliedFilters?: FacetFilterInput[];
    filtersRenderer?: FiltersRenderer;

    fieldToFacetStateMap: FieldToFacetStateMap
}


export type FiledAppliedFilterUpdater = (fieldName: FieldName, facetFilterInputs: FacetFilterInput[]) => void;
