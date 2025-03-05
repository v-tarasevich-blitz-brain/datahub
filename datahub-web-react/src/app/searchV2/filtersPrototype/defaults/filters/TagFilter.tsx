import TagLink from '@src/app/sharedV2/tags/TagLink';
import { Entity, Tag } from '@src/types.generated';
import { FieldFilterComponentProps } from '../../types';
import GenericEntityFilter from './entityFilters/GenericEntityFilter';
import { memo, useCallback } from 'react';

interface PlatformLabelProps {
    entity: Entity;
}

function TagLabel({ entity }: PlatformLabelProps) {
    const tag = entity as Tag;

    return <TagLink tag={tag} enableTooltip={false} enableDrawer={false} />;
}

export default function TagFilter(props: FieldFilterComponentProps) {
    const renderEntity = useCallback((entity: Entity) => <TagLabel entity={entity} />, []);

    return <GenericEntityFilter {...props} renderEntity={renderEntity} />;
}
