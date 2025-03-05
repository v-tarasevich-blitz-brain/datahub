import { FacetMetadata } from '@src/types.generated';
import React from 'react';
import { FieldName, FieldFilterComponent } from './types';


// type FieldName = string;
// type FieldFilterRenderer = (props: RendererProps) => React.ReactNode;

class FilterRegistry {
    registry: Map<string, FieldFilterComponent> = new Map<FieldName, FieldFilterComponent>();

    registerRenderer(fieldName: FieldName, component: FieldFilterComponent) {
        this.registry.set(fieldName, component);
    }

    hasRenderer(fieldName: FieldName): boolean {
        return this.registry.has(fieldName)
    }

    getRenderer(fieldName: FieldName): FieldFilterComponent | undefined {
        return this.registry.get(fieldName)
    }
}

const filterRegistry = new FilterRegistry();
export default filterRegistry;
