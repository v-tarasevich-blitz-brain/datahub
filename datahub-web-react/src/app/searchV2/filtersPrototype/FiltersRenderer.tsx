import { useSearchFiltersContext } from './SearchFiltersContext';

export default function FiltersRenderer() {
    const { filtersRenderer } = useSearchFiltersContext();

    // TODO: >>> pass filters
    return <>{filtersRenderer({ filters: [] })}</>;
}
