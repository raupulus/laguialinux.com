import { expect } from '../harness/assert.mjs';
import { FeedsAndSeoEngine } from '../harness/client-engine.mjs';

export default {
  feature: 'F70: Structured JSON-LD Engine (TechArticle, NewsArticle, BreadcrumbList)',
  tier: 1,
  tests: [
    {
      name: 'F70.1: Generates TechArticle JSON-LD schema for guide publications',
      async run() {
        const guideData = {
          title: 'Guía completa de LVM y almacenamiento',
          slug: 'guia-lvm',
          excerpt: 'Cómo crear y redimensionar volúmenes lógicos en Linux.',
          published_at: '2026-09-01T10:00:00Z',
          proficiencyLevel: 'Intermediate',
          author: { name: 'Raúl Caro Pastorino', website: 'https://raupulus.dev' }
        };

        const jsonLd = FeedsAndSeoEngine.generateJsonLd('TechArticle', guideData, 'laguialinux');
        expect(jsonLd['@context']).toBe('https://schema.org');
        expect(jsonLd['@type']).toBe('TechArticle');
        expect(jsonLd.headline).toBe('Guía completa de LVM y almacenamiento');
        expect(jsonLd.author.name).toBe('Raúl Caro Pastorino');
        expect(jsonLd.publisher.name).toBe('La Guía Linux');
      }
    },
    {
      name: 'F70.2: Generates NewsArticle JSON-LD schema for news publications',
      async run() {
        const newsData = {
          title: 'Vulnerabilidad crítica en OpenSSH parcheada',
          slug: 'vulnerabilidad-openssh',
          excerpt: 'Detalles del parche para CVE-2024-6387.',
          published_at: '2026-07-01T08:00:00Z',
          category: { name: 'Ciberseguridad' }
        };

        const jsonLd = FeedsAndSeoEngine.generateJsonLd('NewsArticle', newsData, 'news');
        expect(jsonLd['@type']).toBe('NewsArticle');
        expect(jsonLd.headline).toContain('Vulnerabilidad crítica');
        expect(jsonLd.articleSection).toBe('Ciberseguridad');
        expect(jsonLd.mainEntityOfPage['@id']).toContain('news.laguialinux.com/noticia/vulnerabilidad-openssh');
      }
    },
    {
      name: 'F70.3: Generates BreadcrumbList JSON-LD schema with ordered item positions',
      async run() {
        const breadcrumbs = {
          breadcrumbs: [
            { name: 'Inicio', url: '/' },
            { name: 'Comandos', url: '/categoria/comandos' },
            { name: 'Guía de find', url: '/guia/guia-comandos-find-xargs' }
          ]
        };

        const jsonLd = FeedsAndSeoEngine.generateJsonLd('BreadcrumbList', breadcrumbs, 'laguialinux');
        expect(jsonLd['@type']).toBe('BreadcrumbList');
        expect(jsonLd.itemListElement.length).toBe(3);
        expect(jsonLd.itemListElement[0].position).toBe(1);
        expect(jsonLd.itemListElement[1].position).toBe(2);
        expect(jsonLd.itemListElement[2].name).toBe('Guía de find');
      }
    },
    {
      name: 'F70.4: TechArticle publisher contains official squircle logo URL',
      async run() {
        const guideData = { title: 'Test', published_at: '2026-01-01' };
        const jsonLd = FeedsAndSeoEngine.generateJsonLd('TechArticle', guideData, 'laguialinux');

        expect(jsonLd.publisher.logo['@type']).toBe('ImageObject');
        expect(jsonLd.publisher.logo.url).toContain('squircle-badge-2048.webp');
      }
    },
    {
      name: 'F70.5: Strict Privacy: Zero occurrences of private email in any generated schema',
      async run() {
        const data = { title: 'Test', author: { name: 'Raúl Caro Pastorino' } };
        const tech = FeedsAndSeoEngine.generateJsonLd('TechArticle', data);
        const news = FeedsAndSeoEngine.generateJsonLd('NewsArticle', data);

        const forbiddenEmail = ['raupulus', 'gmail.com'].join('@');
        expect(JSON.stringify(tech)).not.toContain(forbiddenEmail);
        expect(JSON.stringify(news)).not.toContain(forbiddenEmail);
      }
    }
  ]
};
