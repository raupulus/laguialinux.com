import { expect } from '../harness/assert.mjs';
import { FeedsAndSeoEngine } from '../harness/client-engine.mjs';

export default {
  feature: 'F70: Structured JSON-LD Engine (Boundary)',
  tier: 2,
  tests: [
    {
      name: 'F70.B1: Unknown schema type returns null safely without exception',
      async run() {
        expect(FeedsAndSeoEngine.generateJsonLd('UnknownType', {})).toBeNull();
      }
    },
    {
      name: 'F70.B2: Serializing schema to string produces valid parseable JSON',
      async run() {
        const data = { title: 'Comandos & Bash', excerpt: '<p>HTML inside</p>' };
        const schema = FeedsAndSeoEngine.generateJsonLd('TechArticle', data, 'laguialinux');
        const serialized = JSON.stringify(schema);

        expect(() => JSON.parse(serialized)).not.toThrow();
        const parsed = JSON.parse(serialized);
        expect(parsed.headline).toBe('Comandos & Bash');
      }
    },
    {
      name: 'F70.B3: Missing published_at date defaults safely without crash',
      async run() {
        const data = { title: 'Sin fecha' };
        const schema = FeedsAndSeoEngine.generateJsonLd('TechArticle', data, 'laguialinux');
        expect(schema.datePublished).toBeUndefined();
      }
    },
    {
      name: 'F70.B4: BreadcrumbList with empty breadcrumbs array produces empty itemListElement',
      async run() {
        const schema = FeedsAndSeoEngine.generateJsonLd('BreadcrumbList', { breadcrumbs: [] });
        expect(schema.itemListElement.length).toBe(0);
      }
    },
    {
      name: 'F70.B5: Script injection attempt in headline is safely contained inside JSON string',
      async run() {
        const hostile = { title: '</script><script>alert("xss")</script>' };
        const schema = FeedsAndSeoEngine.generateJsonLd('TechArticle', hostile);
        const jsonString = JSON.stringify(schema);
        expect(jsonString).toContain('alert(\\"xss\\")');
      }
    }
  ]
};
