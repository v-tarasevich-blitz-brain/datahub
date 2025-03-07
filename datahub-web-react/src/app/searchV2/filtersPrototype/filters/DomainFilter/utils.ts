import { Domain, Entity, EntityType } from '@src/types.generated';

export function isDomain(entity?: Entity | null | undefined): entity is Domain {
    return !!entity && entity.type === EntityType.Domain;
}
