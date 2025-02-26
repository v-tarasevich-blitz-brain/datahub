import { FacetFilterInput, FacetMetadata } from '@src/types.generated';
import React, { useContext, useState } from 'react';

export type FeildFacetState = {
    facet?: FacetMetadata | undefined;
    loading?: boolean;
}

export type FieldFacetGetter = (fieldName: string) => FeildFacetState | undefined;
export type FieldName = string;

export type SearchFiltersContextType = {
    getFacetForField: FieldFacetGetter;
    fields: FieldName[];
    appliedFilters: FacetFilterInput[];
};

export const SearchFiltersContext = React.createContext<SearchFiltersContextType>({
    getFacetForField: () => undefined,
    fields: [],
    appliedFilters: [],
});

export const useSearchFiltersContext = () => useContext(SearchFiltersContext);

interface SearchFiltersProviderProps {
    getFacetForField: FieldFacetGetter;
    fields: FieldName[];
    defaultAppliedFilters?: FacetFilterInput[];
}

export const SearchFiltersProvider = ({
    children,
    getFacetForField,
    fields,
    defaultAppliedFilters,
}: React.PropsWithChildren<SearchFiltersProviderProps>) => {
    const [appliedFilters, setAppliedFilters] = useState<FacetFilterInput[]>(defaultAppliedFilters || []);

    return <SearchFiltersContext.Provider value={{ getFacetForField, fields, appliedFilters }}>
        {children}
    </SearchFiltersContext.Provider>;
};
