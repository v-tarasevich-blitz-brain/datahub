import { AppliedFieldFilterValue, FeildFacetState } from '@src/app/searchV2/filtersPrototype/types';
import { EntitySelectOption } from '../types';
import { useMemo } from 'react';
import useSearch from './useSearch';
import { Entity, EntityType } from '@src/types.generated';
import { SuggestionContainer } from '@src/app/search/autoComplete/AutoCompleteItem';
import useConvertEntitiesToOptions from './useEntitiesToOptions';

const mergeEntityArrays = (arrayA: Entity[], arrayB: Entity[]): Entity[] => {
    const urnsFromArrayB = arrayB.map((entity) => entity.urn);

    return [...arrayA.filter((entity) => !urnsFromArrayB.includes(entity.urn)), ...arrayB];
};

export default function useOptions(
    appliedFilters: AppliedFieldFilterValue | undefined,
    facetState: FeildFacetState | undefined,
    query: string,
    entityTypes: EntityType[],
    entityRender: (entity: Entity) => React.ReactNode,
): EntitySelectOption[] {
    const convertEntiteisToOptions = useConvertEntitiesToOptions();

    const { data: searchResponse, loading: searchResponseLoading } = useSearch(query, entityTypes);

    const entitiesFromAppliedFilters = useMemo(() => appliedFilters?.entities ?? [], [appliedFilters]);
    const entitiesFromFacetState = useMemo(
        () =>
            (facetState?.facet?.aggregations ?? [])
                .filter((aggregation) => aggregation.count > 0)
                .map((aggregation) => aggregation.entity)
                .filter((entity): entity is Entity => !!entity),
        [facetState],
    );
    const entitiesFromSearchResponse = useMemo(
        () =>
            searchResponse?.autoCompleteForMultiple?.suggestions.map((suggestion) => suggestion.entities).flat() ?? [],
        [searchResponse],
    );

    const mergedEntities = useMemo(() => {
        let entities: Entity[] = mergeEntityArrays(entitiesFromAppliedFilters, entitiesFromFacetState);

        if (query !== '' && !searchResponseLoading) {
            entities = mergeEntityArrays(entities, entitiesFromSearchResponse);
        }

        return entities;
    }, [entitiesFromAppliedFilters, entitiesFromFacetState, entitiesFromSearchResponse, searchResponseLoading, query]);

    const options = useMemo(() => {
        return convertEntiteisToOptions(mergedEntities, entityRender);
    }, [mergedEntities, convertEntiteisToOptions, entityRender]);

    return options;
}
