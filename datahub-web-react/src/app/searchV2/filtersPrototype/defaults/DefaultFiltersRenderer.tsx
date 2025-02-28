import React from 'react';
import styled from 'styled-components';
import { FiltersRendererProps } from '../types';
import { useSearchFiltersContext } from '../SearchFiltersContext';
import TestField from '../TestField';
import PlatformEntityFilter from './filters/PlatformFilter';

const Container = styled.div`
    display: flex;
    flex-direction: row;
    gap: 8px;
`;

export default function DefaultFiltersRenderer({ filters }: FiltersRendererProps) {
    const {
        fieldFacets,
        fieldToFacetStateMap,
        updateFieldAppliedFilters: applyFilter,
        fieldToAppliedFiltersMap,
    } = useSearchFiltersContext();

    return (
        <Container>
            <TestField
                fieldName="domains"
                appliedFilters={fieldToAppliedFiltersMap.get('domains')}
                onUpdate={(values) => applyFilter('domains', values)}
                facetState={fieldToFacetStateMap.get('domains')}
            />
            <PlatformEntityFilter
                fieldName="platform"
                appliedFilters={fieldToAppliedFiltersMap.get('platform')}
                onUpdate={(values) => applyFilter('platform', values)}
                facetState={fieldToFacetStateMap.get('platform')}
            />

            {filters.map((filter) => (
                <React.Fragment key={filter.fieldName}>
                    {filter.render({
                        fieldName: filter.fieldName,
                        facetState: fieldFacets?.get(filter.fieldName),

                        // values:
                    })}
                </React.Fragment>
            ))}
        </Container>
    );
}
