import React, { useCallback, useContext, useEffect, useState } from 'react';
import DefaultFiltersRenderer from './defaults/DefaultFiltersRenderer';
import {
    AppliedFieldFilterUpdater,
    FieldToAppliedFieldFiltersMap,
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
    fields,
    defaultAppliedFilters,
    fieldToFacetStateMap,
    filtersRenderer = DefaultFiltersRenderer,
    onFiltersApplied,
}: React.PropsWithChildren<SearchFiltersProviderProps>) => {
    const [fieldToAppliedFiltersMap, setFieldToAppliedFiltersMap] = useState<FieldToAppliedFieldFiltersMap>(
        new Map(defaultAppliedFilters),
    );

    const applyFilter: AppliedFieldFilterUpdater = useCallback((fieldName, value) => {
        setFieldToAppliedFiltersMap((prevAppliedFilters) => {
            const filters = value.filters
                .filter((input) => input.field === fieldName)
                .filter((input) => input.values && input.values.length > 0);

            return new Map([...prevAppliedFilters, [fieldName, { filters }]]);
        });
    }, []);

    useEffect(() => onFiltersApplied?.(fieldToAppliedFiltersMap), [onFiltersApplied, fieldToAppliedFiltersMap]);

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
