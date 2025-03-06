import { Entity } from '@src/types.generated';
import React from 'react';

export interface SelectOption {
    value: string;
    label: React.ReactNode;
    parentValue?: string;
    isParent?: boolean;
    entity?: Entity;
}
