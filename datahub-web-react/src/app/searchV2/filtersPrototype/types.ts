import { FacetFilterInput, FacetMetadata } from '@src/types.generated';
import React from 'react';

export type FieldName = string;

export type FacetsGetterResponse = {
    facets?: FacetMetadata[] | undefined;
    loading?: boolean;
};
export type FacetsGetter = (fieldNames: FieldName[]) => FieldToFacetStateMap | undefined;

export type FilterValue = string;

export interface AppliedFieldFilterValue {
    filters: FacetFilterInput[];
}

export type FieldToAppliedFieldFiltersMap = Map<FieldName, AppliedFieldFilterValue>;

export interface FieldFilterComponentProps {
    fieldName: FieldName;
    facetState?: FeildFacetState;
    appliedFilters?: AppliedFieldFilterValue;
    onUpdate?: (value: AppliedFieldFilterValue) => void;
}

export type FieldFilterComponent = React.FC<FieldFilterComponentProps>;

export interface Filter {
    fieldName: FieldName;
    props: FieldFilterComponentProps;
    component: FieldFilterComponent;
}

export interface FiltersRendererProps {
    filters: Filter[];
}

export type FeildFacetState = {
    facet?: FacetMetadata | undefined;
    loading?: boolean;
};

export type FieldToFacetStateMap = Map<FieldName, FeildFacetState>;

export type FieldFacetGetter = (fieldName: FieldName) => FeildFacetState | undefined;

export type FiltersRenderer = React.FC<FiltersRendererProps>;

export type SearchFiltersContextType = {
    // Fields to show in filters
    fields: FieldName[];

    // State of facets for each field
    fieldToFacetStateMap: FieldToFacetStateMap;

    // Internal state of applied filters
    fieldToAppliedFiltersMap: FieldToAppliedFieldFiltersMap;
    updateFieldAppliedFilters: AppliedFieldFilterUpdater;

    // takes all filters and render them together
    filtersRenderer: FiltersRenderer;

    // TODO:: remove
    // fieldFacets?: FieldToFacetStateMap;
    // getFacets?: FacetsGetter;
};

export type FiltersAppliedHandler = (appliedFilters: FieldToAppliedFieldFiltersMap) => void;

// Context provider props
export interface SearchFiltersProviderProps {
    fieldFacets?: FieldToFacetStateMap;
    fields: FieldName[];
    defaultAppliedFilters?: FieldToAppliedFieldFiltersMap;
    filtersRenderer?: FiltersRenderer;
    onFiltersApplied?: FiltersAppliedHandler;

    fieldToFacetStateMap: FieldToFacetStateMap;
}

export type AppliedFieldFilterUpdater = (fieldName: FieldName, value: AppliedFieldFilterValue) => void;

export interface FiltersRenderingRunnerProps {
    fieldNames: FieldName[];
    hideEmptyFilters?: boolean;
}
