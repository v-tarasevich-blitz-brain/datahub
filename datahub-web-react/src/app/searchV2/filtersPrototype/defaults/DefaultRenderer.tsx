import styled from "styled-components";
import { FiltersRendererProps } from "../types";
import { useSearchFiltersContext } from "../SearchFiltersContext";

const Container = styled.div`
    display: flex;
    flex-direction: row;
    gap: 8px;
`

// const FilterContainer 

export default function DefaultFiltersRenderer({filters}: FiltersRendererProps) {
    const {getFacetForField} = useSearchFiltersContext();

    return <Container>
        {filters.map(filter => filter.render())}
    </Container>
}
