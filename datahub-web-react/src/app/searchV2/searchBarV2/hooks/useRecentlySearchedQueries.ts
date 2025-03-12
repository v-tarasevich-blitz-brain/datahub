import { useUserContext } from '@src/app/context/useUserContext';
import { useListRecommendationsQuery } from '@src/graphql/recommendations.generated';
import { ScenarioType } from '@src/types.generated';

export default function useRecentlySearchedQueries(skip: boolean) {
    const { user, loaded } = useUserContext();

    const { data, loading } = useListRecommendationsQuery({
        variables: {
            input: {
                userUrn: user?.urn as string,
                requestContext: {
                    scenario: ScenarioType.SearchBar,
                },
                limit: 1,
            },
        },
        skip: skip || !user?.urn,
    });

    return { data, loading: loading || loaded };
}
