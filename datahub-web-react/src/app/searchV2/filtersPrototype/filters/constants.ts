import { DOMAINS_FILTER_NAME } from '@src/app/search/utils/constants';
import {
    TAGS_FILTER_NAME,
    OWNERS_FILTER_NAME,
    PLATFORM_FILTER_NAME,
    ENTITY_SUB_TYPE_FILTER_NAME,
} from '@src/app/searchV2/utils/constants';
import { FieldName } from '../types';

export const FIELD_TO_FILTER_NAME_MAP: Map<FieldName, string> = new Map([
    [PLATFORM_FILTER_NAME, 'Platforms'],
    [ENTITY_SUB_TYPE_FILTER_NAME, 'Types'],
    [OWNERS_FILTER_NAME, 'Owner'],
    [TAGS_FILTER_NAME, 'Tags'],
    [DOMAINS_FILTER_NAME, 'Domains'],
]);
