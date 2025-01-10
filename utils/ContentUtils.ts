import type { MetadataType } from "@/types/MetadataType";
import type { CategoryType } from "@/types/CategoryType";
import type { ContentType } from "@/types/ContentType";
import { prepareDataCategory } from '@/utils/CategoryUtils';

function prepareContentDataMetadata(metadata: MetadataType) {
  return metadata;

  // TODO: Adaptar la lógica para no descartar todo lo demás, si no para poner en orden y así
  // poder tomar los primeros según la cantidad que necesite

  /*
  const priority: (keyof MetadataType)[] = [
      'web', 'youtube_channel', 'youtube_video', 'youtube', 'gitlab', 'github',
      'twitter', 'linkedin', 'mastodon', 'twitch',
      'telegram_channel',
  ];

  let results: MetadataType = {};
  let counter = 0;

  if (metadata) {
      priority.forEach(p => {
          if ((p === 'youtube_channel') || (p === 'youtube_video')) {
              if (metadata[p] && counter < 4) {
                  if (!results.youtube) {
                      counter++;
                  }
                  results.youtube = metadata[p];
              }
          } else if (counter < 4 && metadata[p]) {
              counter++;
              results[p] = metadata[p];
          }
      });
  }

  return results;
  */
}


export function prepareContentData(content: ContentType, contentType: string) {
  if (content.metadata) {
      content.metadata = prepareContentDataMetadata(content.metadata as MetadataType);
  }

  const contentCategorySlug = content.categories?.length ? content.categories[0].slug : 'general';
  let contentSubcategoryMain = content.subcategories?.find(sub => sub.is_main);

  if (!contentSubcategoryMain) {
      contentSubcategoryMain = content.categories?.length ? content.categories[0] : undefined;
  }

  const contentSubcategorySlug = contentSubcategoryMain ? contentSubcategoryMain.slug : 'misc';

  const config = useRuntimeConfig();

  content.url = `${config.public.app.url}/${contentType}/${contentCategorySlug}/${contentSubcategorySlug}/${content.slug}`;
  content.path = `${contentCategorySlug}/${contentSubcategorySlug}/${content.slug}`;

  content.categories = content.categories?.map((cat: CategoryType) => {
      return prepareDataCategory(cat);
  });

  content.subcategories = content.subcategories?.map((cat: CategoryType) => {
      return prepareDataCategory(cat);
  })

  return content;
}
