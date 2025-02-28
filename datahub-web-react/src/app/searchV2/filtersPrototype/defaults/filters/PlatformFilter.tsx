import { AggregationMetadata } from '@src/types.generated';
import { FilterRendererProps } from '../../types';
import GenericEntityFilter from './GenericEntityFilter';
import React from 'react';

interface PlatformLabelProps {
    aggregation: AggregationMetadata;
}

function PlatformLabel({ aggregation }: PlatformLabelProps) {
    const displayName =
        aggregation.displayName ?? aggregation.entity?.properties?.name ?? aggregation.entity?.properties?.displayName;

    // debugger;

    // return displayName;
    return (
        <>
            {displayName}123
        </>
    );
}

export default function PlatformEntityFilter(props: FilterRendererProps) {
    const aggregationMetadataToLabel = (aggregation: AggregationMetadata): React.ReactNode => {
        // return '123';
        return <PlatformLabel aggregation={aggregation} />;
    };
    console.log('>>> PlatformEntityFilter', props)

    return <GenericEntityFilter {...props} aggregationMetadataToLabel={aggregationMetadataToLabel} />;
}
