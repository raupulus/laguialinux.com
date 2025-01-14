import type { TechnologyType } from '@/types/TechnologyType';

export const getTechnologyBySlug = (slug: string) => {
  return getPlatformData()
    .value
    ?.technologies
    ?.find((t: TechnologyType) => t.slug === slug)
}
