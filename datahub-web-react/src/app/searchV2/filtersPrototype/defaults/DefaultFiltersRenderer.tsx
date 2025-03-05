import React, { memo } from 'react';
import styled from 'styled-components';
import { FiltersRendererProps } from '../types';

const Container = styled.div`
    display: flex;
    flex-direction: row;
    gap: 8px;
`;

export default function DefaultFiltersRenderer({ filters }: FiltersRendererProps) {
    // console.log('>>> filters', filters)

    console.log('>>> RENDER DefaultFiltersRenderer');

    return (
        <Container>
            {filters.map((filter) => {
                const FilterComponent = filter.component;
                return <FilterComponent {...filter.props} />;
            })}
        </Container>
    );
}
