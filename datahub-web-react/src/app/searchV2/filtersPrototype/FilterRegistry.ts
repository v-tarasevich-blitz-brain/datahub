import { FieldFilterComponent, FieldName } from './types';

class FieldFilterRegistry {
    registry: Map<string, FieldFilterComponent> = new Map<FieldName, FieldFilterComponent>();

    registerFieldFilterComponent(fieldName: FieldName, component: FieldFilterComponent) {
        this.registry.set(fieldName, component);
    }

    hasFieldFilterComponent(fieldName: FieldName): boolean {
        return this.registry.has(fieldName);
    }

    getRenderer(fieldName: FieldName): FieldFilterComponent | undefined {
        return this.registry.get(fieldName);
    }
}

const filterRegistry = new FieldFilterRegistry();
export default filterRegistry;
