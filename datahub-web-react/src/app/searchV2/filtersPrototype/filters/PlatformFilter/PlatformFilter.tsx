import { Entity, EntityType } from '@src/types.generated';
import { useCallback } from 'react';
import { FieldFilterComponentProps } from '../../types';
import BaseEntityFilter from '../BaseEntityFilter/BaseEntityFilter';
import { EntityIconWithName } from '../BaseEntityFilter/components/EntityIconWithName';

export default function PlatformEntityFilter(props: FieldFilterComponentProps) {
    const renderEntity = useCallback((entity: Entity) => <EntityIconWithName entity={entity} />, []);

    return (
        <BaseEntityFilter
            {...props}
            renderEntity={renderEntity}
            entityTypes={[EntityType.DataPlatform]}
            filterName="Platforms"
        />
    );
}
