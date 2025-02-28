import { Select, SelectOption, SimpleSelect } from '@src/alchemy-components';
import { useSearchFiltersContext } from './SearchFiltersContext';
import { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';

const Container = styled.div`
    width: fit-content;
`;

interface TestFieldProps {
    fieldName: string;
    values?: string[];
    onUpdate: (values: string[]) => void;
}

export default function TestField({fieldName, values, onUpdate}: TestFieldProps) {
    const { getFacets } = useSearchFiltersContext();

    const [options, setOptions] = useState<SelectOption[]>([]);

    const facet = useMemo(() => getFacets([fieldName])?.facets?.[0], [getFacets]);

    useEffect(() => {
        const aggregations = facet?.aggregations;
        if (aggregations) {
            setOptions(
                aggregations.map((aggregation) => ({
                    value: aggregation.value,
                    label: aggregation.displayName ?? aggregation.entity?.properties?.name ?? aggregation.entity?.properties?.displayName,
                })),
            );
        }
    }, [facet]);

    console.log('>>> TestFIeld', { domainFacet: facet, options });

    return (
        // <Container>
            <SimpleSelect
                // values={values}
                onUpdate={onUpdate}
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
