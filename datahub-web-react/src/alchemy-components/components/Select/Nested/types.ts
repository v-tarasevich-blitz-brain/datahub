import { Entity } from '@src/types.generated';
import React from 'react';

export interface SelectOption {
    value: string;
    label: React.ReactNode;
    parentValue?: string;
    isParent?: boolean;
    entity?: Entity;
}

export type FilteringPredicate<Option extends SelectOption = SelectOption> = (option: Option, query: string) => boolean;
