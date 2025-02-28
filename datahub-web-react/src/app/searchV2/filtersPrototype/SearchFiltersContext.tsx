import { FacetFilterInput, FacetMetadata } from '@src/types.generated';
import React, { useContext, useState } from 'react';
import { SearchFiltersContextType, SearchFiltersProviderProps } from './types';

// export type FeildFacetState = {
//     facet?: FacetMetadata | undefined;
//     loading?: boolean;
// };

// export type FieldFacetGetter = (fieldName: string) => FeildFacetState | undefined;
// export type FieldName = string;

export const SearchFiltersContext = React.createContext<SearchFiltersContextType>({
    getFacets: () => undefined,
    fields: [],
    appliedFilters: [],
});

export const useSearchFiltersContext = () => useContext(SearchFiltersContext);

export const SearchFiltersProvider = ({
    children,
    getFacets,
    fields,
    defaultAppliedFilters,
}: React.PropsWithChildren<SearchFiltersProviderProps>) => {
    const [appliedFilters, setAppliedFilters] = useState<FacetFilterInput[]>(defaultAppliedFilters || []);

    return (
        <SearchFiltersContext.Provider value={{ getFacets, fields, appliedFilters }}>
            {children}
        </SearchFiltersContext.Provider>
    );
};
