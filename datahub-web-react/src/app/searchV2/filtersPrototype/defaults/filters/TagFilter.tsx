import TagLink from '@src/app/sharedV2/tags/TagLink';
import { AggregationMetadata, Tag } from '@src/types.generated';
import { FilterRendererProps } from '../../types';
import GenericEntityFilter from './GenericEntityFilter';

interface PlatformLabelProps {
    aggregation: AggregationMetadata;
}

function TagLabel({ aggregation }: PlatformLabelProps) {
    if (!aggregation.entity) return null;
    const tag = aggregation.entity as Tag;

    return <TagLink tag={tag} enableTooltip={false} enableDrawer={false} />;
}

export default function TagFilter(props: FilterRendererProps) {
    const aggregationMetadataToLabel = (aggregation: AggregationMetadata) => <TagLabel aggregation={aggregation} />;

    return <GenericEntityFilter {...props} aggregationMetadataToLabel={aggregationMetadataToLabel} />;
}
