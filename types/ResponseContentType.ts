import { type ContentType } from '@/types/ContentType';
import { type PaginationType } from '@/types/PaginationType';
import { type SearchParamsType } from '@/types/SearchParamsType';

export type ResponseContentType = {
    status?: string|number,
    pagination?: PaginationType,
    search_params?: SearchParamsType,
    contents?: ContentType[],
}
