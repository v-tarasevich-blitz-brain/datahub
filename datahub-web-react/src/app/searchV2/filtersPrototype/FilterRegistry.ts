import { FacetMetadata } from '@src/types.generated';
import React from 'react';

export interface RendererProps {
    

}

type FieldName = string;
type FieldFilterRenderer = (props: RendererProps) => React.ReactNode;

class FilterRegistry {
    registry: Map<string, FieldFilterRenderer> = new Map<string, FieldFilterRenderer>();

    registerRenderer(fieldName: string, renderer: FieldFilterRenderer) {
        this.registry.set(fieldName, renderer);
    }

    hasRenderer(fieldName: string): boolean {
        return this.registry.has(fieldName)
    }

    getRenderer(fieldName: string): FieldFilterRenderer | undefined {
        return this.registry.get(fieldName)
    }
}

const filterRegistry = new FilterRegistry();
export default filterRegistry;
