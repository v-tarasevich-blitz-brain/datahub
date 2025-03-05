import { useEntityRegistryV2 } from '@src/app/useEntityRegistry';
import { Entity } from '@src/types.generated';
import React, { useCallback } from 'react';
import { EntitySelectOption } from '../types';

export default function useConvertEntitiesToOptions() {
    const entityRegistry = useEntityRegistryV2();

    return useCallback(
        (entities: Entity[], renderLabel: (entity: Entity) => React.ReactNode): EntitySelectOption[] => {
            return entities.map((entity) => {
                const displayName = entityRegistry.getDisplayName(entity.type, entity);

                return {
                    value: entity.urn,
                    label: renderLabel(entity),
                    displayName,
                    entity,
                };
            });
        },
        [entityRegistry],
    );
}
