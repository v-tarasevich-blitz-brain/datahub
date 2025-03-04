import { FacetMetadata } from '@src/types.generated';
import React from 'react';
import { FieldName, FilterRenderer } from './types';


// type FieldName = string;
// type FieldFilterRenderer = (props: RendererProps) => React.ReactNode;

class FilterRegistry {
    registry: Map<string, FilterRenderer> = new Map<FieldName, FilterRenderer>();

    registerRenderer(fieldName: FieldName, renderer: FilterRenderer) {
        this.registry.set(fieldName, renderer);
    }

    hasRenderer(fieldName: FieldName): boolean {
        return this.registry.has(fieldName)
    }

    getRenderer(fieldName: FieldName): FilterRenderer | undefined {
        return this.registry.get(fieldName)
    }
}

const filterRegistry = new FilterRegistry();
export default filterRegistry;
