import { AppliedFieldFilterValue } from '@src/app/searchV2/filtersPrototype/types';
import { useMemo } from 'react';

export default function useValues(appliedFilters: AppliedFieldFilterValue | undefined): string[] {
    const values = useMemo(
        () =>
            appliedFilters?.filters
                ?.map((filter) => filter.values)
                .flat()
                .filter((value): value is string => !!value) ?? [],
        [appliedFilters],
    );

    return values;
}
