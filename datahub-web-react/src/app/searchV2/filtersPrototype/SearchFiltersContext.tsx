import { FacetFilterInput, FilterOperator } from '@src/types.generated';
import React, { useCallback, useContext, useState } from 'react';
import DefaultFiltersRenderer from './defaults/DefaultFiltersRenderer';
import {
    FieldAppliedFiltersMap,
    FiledAppliedFilterUpdater,
    FieldName,
    SearchFiltersContextType,
    SearchFiltersProviderProps,
} from './types';

export const SearchFiltersContext = React.createContext<SearchFiltersContextType>({
    fields: [],

    fieldToFacetStateMap: new Map(),

    fieldToAppliedFiltersMap: new Map(),
    updateFieldAppliedFilters: () => null,

    filtersRenderer: DefaultFiltersRenderer,
});

export const useSearchFiltersContext = () => useContext(SearchFiltersContext);

export const SearchFiltersProvider = ({
    children,
    getFacets,
    fields,
    defaultAppliedFilters,
    fieldToFacetStateMap,
    filtersRenderer = DefaultFiltersRenderer,
}: React.PropsWithChildren<SearchFiltersProviderProps>) => {
    // const [appliedFiltersOld, setAppliedFiltersOld] = useState<FacetFilterInput[]>(defaultAppliedFilters || []);

    // TODO: >>> add default value
    const [fieldToAppliedFiltersMap, setFieldToAppliedFiltersMap] = useState<FieldAppliedFiltersMap>(new Map());

    const applyFilter: FiledAppliedFilterUpdater = useCallback((fieldName, facetFilterInputs) => {
        setFieldToAppliedFiltersMap((prevAppliedFilters) => {
            const facetFIlterInputsWithValues = facetFilterInputs
                .filter((input) => input.field === fieldName)
                .filter((input) => input.values && input.values.length > 0);

            return new Map(prevAppliedFilters.set(fieldName, facetFIlterInputsWithValues));
        });
    }, []);

    return (
        <SearchFiltersContext.Provider
            value={{
                fieldToFacetStateMap,
                fields,
                fieldToAppliedFiltersMap,
                filtersRenderer,
                updateFieldAppliedFilters: applyFilter,
            }}
        >
            {children}
        </SearchFiltersContext.Provider>
    );
};
