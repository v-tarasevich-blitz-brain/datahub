import { Select, SelectOption, SimpleSelect } from '@src/alchemy-components';
import { useSearchFiltersContext } from './SearchFiltersContext';
import { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';

const Container = styled.div`
    width: fit-content;
`;

export default function TestField({fieldName}: {fieldName: string}) {
    const { getFacetForField } = useSearchFiltersContext();

    const [options, setOptions] = useState<SelectOption[]>([]);

    const domainFacet = useMemo(() => getFacetForField(fieldName), [getFacetForField]);

    useEffect(() => {
        const aggregations = domainFacet?.facet?.aggregations;
        if (aggregations) {
            setOptions(
                aggregations.map((aggregation) => ({
                    value: aggregation.value,
                    label: aggregation.displayName ?? aggregation.entity?.properties?.name ?? aggregation.entity?.properties?.displayName,
                })),
            );
        }
    }, [domainFacet]);

    console.log('>>> TestFIeld', { domainFacet, options });

    return (
        // <Container>
            <SimpleSelect
                options={options}
                isMultiSelect
                showSearch
                selectLabelProps={{ variant: 'labeled', label: fieldName }}
                width={'fit-content'}
                // width={150}
            />
        // </Container>
    );
}
