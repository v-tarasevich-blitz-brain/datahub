import { isItTagEntity } from '@src/app/entityV2/tag/utils';
import TagLink from '@src/app/sharedV2/tags/TagLink';
import { Entity, EntityType } from '@src/types.generated';
import { useCallback } from 'react';
import { FieldFilterComponentProps } from '../../types';
import BaseEntityFilter from '../BaseEntityFilter/BaseEntityFilter';

interface PlatformLabelProps {
    entity: Entity;
}

function TagLabel({ entity }: PlatformLabelProps) {
    const tag = (isItTagEntity(entity) && entity) || undefined;

    if (tag === undefined) return null;

    return <TagLink tag={tag} enableTooltip={false} enableDrawer={false} />;
}

export default function TagFilter(props: FieldFilterComponentProps) {
    const renderEntity = useCallback((entity: Entity) => <TagLabel entity={entity} />, []);

    return <BaseEntityFilter {...props} renderEntity={renderEntity} entityTypes={[EntityType.Tag]} filterName="Tags" />;
}
