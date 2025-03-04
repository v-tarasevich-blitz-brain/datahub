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
    console.log('>>> filters', filters)

    return (
        <Container>
            {filters.map((filter) => (
                <React.Fragment key={filter.fieldName}>
                    {filter.render(filter.props)}
                </React.Fragment>
            ))}
        </Container>
    );
}
