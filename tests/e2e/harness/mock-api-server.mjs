import http from 'node:http';
import crypto from 'node:crypto';

/**
 * Mock API V2 Server for autonomous E2E testing
 * Implements strict contracts defined in nueva-apps/docs/contracts/content.md and MOD-00 / MOD-02
 */
export class MockApiServer {
  constructor() {
    this.server = null;
    this.port = 0;
    this.baseUrl = '';
    this.requestHistory = [];
    this.customHandlers = new Map();
    this.rateLimitRemaining = 300;
    this.forceRateLimit = false;
    this.rateLimitRetryAfter = 60;
  }

  /**
   * Start mock server on available system port
   */
  async start() {
    return new Promise((resolve, reject) => {
      this.server = http.createServer((req, res) => this.handleRequest(req, res));
      this.server.listen(0, '127.0.0.1', () => {
        this.port = this.server.address().port;
        this.baseUrl = `http://127.0.0.1:${this.port}/api/v2`;
        resolve(this.baseUrl);
      });
      this.server.on('error', reject);
    });
  }

  /**
   * Stop mock server
   */
  async stop() {
    return new Promise((resolve) => {
      if (this.server) {
        this.server.close(() => {
          this.server = null;
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  /**
   * Clear recorded requests and custom handlers
   */
  reset() {
    this.requestHistory = [];
    this.customHandlers.clear();
    this.forceRateLimit = false;
    this.rateLimitRetryAfter = 60;
    this.contactRequestCount = 0;
  }

  /**
   * Register a custom handler for a specific path/method
   */
  registerHandler(method, path, handler) {
    this.customHandlers.set(`${method.toUpperCase()}:${path}`, handler);
  }

  /**
   * Main HTTP request router
   */
  async handleRequest(req, res) {
    const urlObj = new URL(req.url, `http://127.0.0.1:${this.port}`);
    const method = req.method.toUpperCase();
    const pathname = urlObj.pathname;
    const ifNoneMatch = req.headers['if-none-match'];

    // Record request for inspection
    const recordedReq = {
      method,
      pathname,
      searchParams: Object.fromEntries(urlObj.searchParams.entries()),
      headers: req.headers,
      timestamp: Date.now(),
    };
    this.requestHistory.push(recordedReq);

    // Read body if POST/PUT
    let body = null;
    if (method === 'POST' || method === 'PUT') {
      const chunks = [];
      for await (const chunk of req) {
        chunks.push(chunk);
      }
      const raw = Buffer.concat(chunks).toString('utf-8');
      try {
        body = JSON.parse(raw);
      } catch {
        body = raw;
      }
      recordedReq.body = body;
    }

    // Check custom handler override
    const customKey = `${method}:${pathname}`;
    if (this.customHandlers.has(customKey)) {
      return this.customHandlers.get(customKey)(req, res, { urlObj, body });
    }

    // Forced Rate Limit (HTTP 429) simulation
    if (this.forceRateLimit) {
      res.writeHead(429, {
        'Content-Type': 'application/json',
        'Retry-After': String(this.rateLimitRetryAfter),
      });
      res.end(JSON.stringify({
        success: false,
        message: 'Demasiadas peticiones. Por favor, inténtelo de nuevo más tarde.',
        errors: {
          rate_limit: ['Ha superado el límite de peticiones por minuto.']
        }
      }));
      return;
    }

    // Platform Info route: GET /api/v2/platforms/:slug
    const platformMatch = pathname.match(/^\/api\/v2\/platforms\/([a-zA-Z0-9_-]+)$/);
    if (platformMatch && method === 'GET') {
      const slug = platformMatch[1];
      if (slug === 'laguialinux' || slug === 'news') {
        const payload = this.getPlatformFixture(slug);
        return this.sendJsonResponse(res, 200, payload);
      } else {
        return this.sendJsonResponse(res, 404, {
          success: false,
          message: 'Plataforma no encontrada'
        });
      }
    }

    // Platform Categories: GET /api/v2/platforms/:slug/categories
    const catMatch = pathname.match(/^\/api\/v2\/platforms\/([a-zA-Z0-9_-]+)\/categories$/);
    if (catMatch && method === 'GET') {
      const slug = catMatch[1];
      if (slug !== 'laguialinux' && slug !== 'news') {
        return this.sendJsonResponse(res, 404, {
          success: false,
          message: 'Plataforma no encontrada'
        });
      }

      const categoriesData = this.getCategoriesFixture(slug);
      const envelope = {
        success: true,
        message: 'Operación exitosa',
        data: categoriesData
      };

      const etag = `"${crypto.createHash('md5').update(JSON.stringify(envelope)).digest('hex')}"`;

      // Check conditional If-None-Match header
      if (ifNoneMatch && (ifNoneMatch === etag || ifNoneMatch === `W/${etag}`)) {
        res.writeHead(304, {
          'ETag': etag,
          'Cache-Control': 'max-age=60, public',
        });
        res.end();
        return;
      }

      res.writeHead(200, {
        'Content-Type': 'application/json',
        'ETag': etag,
        'Cache-Control': 'max-age=60, public',
      });
      res.end(JSON.stringify(envelope));
      return;
    }

    // Platform Tags: GET /api/v2/platforms/:slug/tags
    const tagsMatch = pathname.match(/^\/api\/v2\/platforms\/([a-zA-Z0-9_-]+)\/tags$/);
    if (tagsMatch && method === 'GET') {
      const slug = tagsMatch[1];
      if (slug !== 'laguialinux' && slug !== 'news') {
        return this.sendJsonResponse(res, 404, {
          success: false,
          message: 'Plataforma no encontrada'
        });
      }

      const tagsData = this.getTagsFixture(slug);
      const envelope = {
        success: true,
        message: 'Operación exitosa',
        data: tagsData
      };
      const etag = `"${crypto.createHash('md5').update(JSON.stringify(envelope)).digest('hex')}"`;

      if (ifNoneMatch && ifNoneMatch === etag) {
        res.writeHead(304, { 'ETag': etag, 'Cache-Control': 'max-age=60, public' });
        res.end();
        return;
      }

      res.writeHead(200, {
        'Content-Type': 'application/json',
        'ETag': etag,
        'Cache-Control': 'max-age=60, public',
      });
      res.end(JSON.stringify(envelope));
      return;
    }

    // Platform Contents: GET /api/v2/platforms/:slug/contents
    const contentsMatch = pathname.match(/^\/api\/v2\/platforms\/([a-zA-Z0-9_-]+)\/contents$/);
    if (contentsMatch && method === 'GET') {
      const slug = contentsMatch[1];
      if (slug !== 'laguialinux' && slug !== 'news') {
        return this.sendJsonResponse(res, 404, {
          success: false,
          message: 'Plataforma no encontrada'
        });
      }

      const page = parseInt(urlObj.searchParams.get('page') || '1', 10);
      const perPage = Math.min(100, Math.max(1, parseInt(urlObj.searchParams.get('per_page') || '15', 10)));
      const categoryFilter = urlObj.searchParams.get('category');
      const tagFilter = urlObj.searchParams.get('tag');
      const typeFilter = urlObj.searchParams.get('type');
      const q = urlObj.searchParams.get('q');

      // Check if invalid type requested
      if (typeFilter && !['guide', 'blog', 'project', 'page', 'news'].includes(typeFilter)) {
        return this.sendJsonResponse(res, 404, {
          success: false,
          message: 'Tipo de contenido no reconocido'
        });
      }

      const contents = this.getContentsFixture(slug, { categoryFilter, tagFilter, typeFilter, q });
      const total = contents.length;
      const lastPage = Math.max(1, Math.ceil(total / perPage));
      const from = total > 0 ? (page - 1) * perPage + 1 : null;
      const to = total > 0 ? Math.min(page * perPage, total) : null;
      const pagedData = contents.slice((page - 1) * perPage, page * perPage);

      const envelope = {
        success: true,
        message: 'Operación exitosa',
        data: pagedData,
        meta: {
          total,
          per_page: perPage,
          current_page: page,
          last_page: lastPage,
          from,
          to,
        }
      };

      const etag = `"${crypto.createHash('md5').update(JSON.stringify(envelope)).digest('hex')}"`;

      if (ifNoneMatch && ifNoneMatch === etag) {
        res.writeHead(304, { 'ETag': etag, 'Cache-Control': 'max-age=60, public' });
        res.end();
        return;
      }

      res.writeHead(200, {
        'Content-Type': 'application/json',
        'ETag': etag,
        'Cache-Control': 'max-age=60, public',
      });
      res.end(JSON.stringify(envelope));
      return;
    }

    // Content Files: GET /api/v2/platforms/:slug/contents/:contentSlug/files
    const filesMatch = pathname.match(/^\/api\/v2\/platforms\/([a-zA-Z0-9_-]+)\/contents\/([a-zA-Z0-9_-]+)\/files$/);
    if (filesMatch && method === 'GET') {
      const [, platformSlug, contentSlug] = filesMatch;
      const files = this.getContentFilesFixture(platformSlug, contentSlug);
      return this.sendJsonResponse(res, 200, {
        success: true,
        message: 'Operación exitosa',
        data: files
      });
    }

    // Content Detail: GET /api/v2/platforms/:slug/contents/:contentSlug
    const contentDetailMatch = pathname.match(/^\/api\/v2\/platforms\/([a-zA-Z0-9_-]+)\/contents\/([a-zA-Z0-9_-]+)$/);
    if (contentDetailMatch && method === 'GET') {
      const [, platformSlug, contentSlug] = contentDetailMatch;
      const content = this.getContentDetailFixture(platformSlug, contentSlug);
      if (!content) {
        return this.sendJsonResponse(res, 404, {
          success: false,
          message: 'Contenido no encontrado'
        });
      }

      const envelope = {
        success: true,
        message: 'Operación exitosa',
        data: content
      };
      const etag = `"${crypto.createHash('md5').update(JSON.stringify(envelope)).digest('hex')}"`;

      if (ifNoneMatch && (ifNoneMatch === etag || ifNoneMatch === `W/${etag}`)) {
        res.writeHead(304, { 'ETag': etag, 'Cache-Control': 'max-age=60, public' });
        res.end();
        return;
      }

      res.writeHead(200, {
        'Content-Type': 'application/json',
        'ETag': etag,
        'Cache-Control': 'max-age=60, public'
      });
      res.end(JSON.stringify(envelope));
      return;
    }

    // Kernel Releases Nitro Proxy: GET /api/kernel-releases or /api/v2/kernel-releases
    if ((pathname === '/api/kernel-releases' || pathname === '/api/v2/kernel-releases') && method === 'GET') {
      const kernelData = this.getKernelReleasesFixture();
      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Cache-Control': 'max-age=86400, s-maxage=86400, stale-while-revalidate=86400'
      });
      res.end(JSON.stringify(kernelData));
      return;
    }

    // Contact Messages: POST /api/v2/contact-messages
    if (pathname === '/api/v2/contact-messages' && method === 'POST') {
      if (this.forceRateLimit || this.contactRequestCount >= 5) {
        return this.sendJsonResponse(res, 429, {
          success: false,
          message: 'Demasiadas solicitudes. Límite de 5 mensajes por hora excedido.'
        }, { 'Retry-After': String(this.rateLimitRetryAfter || 3600) });
      }

      const { name, email, subject, message, website_url_check, website_check } = body || {};

      // Honeypot detection
      if (website_url_check || website_check) {
        // Silently accept or reject bot spam
        return this.sendJsonResponse(res, 201, {
          success: true,
          message: 'Mensaje recibido correctamente',
          data: null
        });
      }

      const errors = {};
      if (!name || typeof name !== 'string' || !name.trim()) errors.name = ['El nombre es obligatorio.'];
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = ['El formato del correo electrónico es inválido.'];
      if (!subject || typeof subject !== 'string' || !subject.trim()) errors.subject = ['El asunto es obligatorio.'];
      if (!message || typeof message !== 'string' || message.trim().length < 10) errors.message = ['El mensaje debe contener al menos 10 caracteres.'];

      if (Object.keys(errors).length > 0) {
        return this.sendJsonResponse(res, 422, {
          success: false,
          message: 'Errores de validación en el formulario.',
          errors
        });
      }

      this.contactRequestCount = (this.contactRequestCount || 0) + 1;
      return this.sendJsonResponse(res, 201, {
        success: true,
        message: 'Mensaje recibido correctamente',
        data: null
      });
    }

    // Newsletter Subscription: POST /api/v2/newsletter/subscriptions
    if (pathname === '/api/v2/newsletter/subscriptions' && method === 'POST') {
      if (this.forceRateLimit) {
        return this.sendJsonResponse(res, 429, {
          success: false,
          message: 'Demasiadas solicitudes al módulo de newsletter.'
        }, { 'Retry-After': '60' });
      }

      const { email, platform_id } = body || {};
      const errors = {};
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = ['El correo electrónico es obligatorio y debe ser válido.'];
      if (!platform_id || typeof platform_id !== 'number') errors.platform_id = ['No se ha podido determinar la plataforma de la suscripción.'];

      if (Object.keys(errors).length > 0) {
        return this.sendJsonResponse(res, 422, {
          success: false,
          message: 'Datos de suscripción inválidos.',
          errors
        });
      }

      return this.sendJsonResponse(res, 201, {
        success: true,
        message: 'Suscripcion creada. Revisa tu email para verificar.',
        data: null
      });
    }

    // Newsletter Verification Resend: POST /api/v2/newsletter/subscriptions/verification
    if (pathname === '/api/v2/newsletter/subscriptions/verification' && method === 'POST') {
      const { email, platform_id } = body || {};
      const cleanEmail = typeof email === 'string' ? email.trim() : '';
      if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail) || !platform_id) {
        return this.sendJsonResponse(res, 422, {
          success: false,
          message: 'Parámetros inválidos para reenvío.',
          errors: { email: ['Email inválido'] }
        });
      }
      return this.sendJsonResponse(res, 200, {
        success: true,
        message: 'Si la dirección está suscrita y pendiente de verificar, se ha enviado el correo.',
        data: null
      });
    }

    // Newsletter Confirmation: POST /api/v2/newsletter/subscriptions/:token/confirmation
    const confirmMatch = pathname.match(/^\/api\/v2\/newsletter\/subscriptions\/([a-zA-Z0-9_-]+)\/confirmation$/);
    if (confirmMatch && method === 'POST') {
      const token = confirmMatch[1];
      if (token === 'invalid-token' || token === 'expired-token') {
        return this.sendJsonResponse(res, 404, {
          success: false,
          message: 'Token inválido'
        });
      }
      return this.sendJsonResponse(res, 200, {
        success: true,
        message: 'Email verificado correctamente',
        data: null
      });
    }

    // Newsletter RFC 8058 One-Click Unsubscribe: POST /api/v2/newsletter/subscriptions/:token/unsubscription
    const rfcUnsubMatch = pathname.match(/^\/api\/v2\/newsletter\/subscriptions\/([a-zA-Z0-9_-]+)\/unsubscription$/);
    if (rfcUnsubMatch && method === 'POST') {
      const token = rfcUnsubMatch[1];
      if (token === 'invalid-token' || token === 'expired-token') {
        return this.sendJsonResponse(res, 404, {
          success: false,
          message: 'Token inválido'
        });
      }
      return this.sendJsonResponse(res, 200, {
        success: true,
        message: 'Suscripcion cancelada correctamente',
        data: null
      });
    }

    // Newsletter Explicit DELETE Unsubscribe: DELETE /api/v2/newsletter/subscriptions/:token
    const deleteUnsubMatch = pathname.match(/^\/api\/v2\/newsletter\/subscriptions\/([a-zA-Z0-9_-]+)$/);
    if (deleteUnsubMatch && method === 'DELETE') {
      const token = deleteUnsubMatch[1];
      if (token === 'invalid-token' || token === 'expired-token') {
        return this.sendJsonResponse(res, 404, {
          success: false,
          message: 'Token inválido'
        });
      }
      res.writeHead(204);
      res.end();
      return;
    }

    // Fallback 404 for unknown endpoints
    this.sendJsonResponse(res, 404, {
      success: false,
      message: 'API V2 - Endpoint no encontrado'
    });
  }

  sendJsonResponse(res, status, obj, headers = {}) {
    res.writeHead(status, {
      'Content-Type': 'application/json',
      ...headers
    });
    res.end(JSON.stringify(obj));
  }

  // --- Fixtures ---

  getPlatformFixture(slug) {
    if (slug === 'laguialinux') {
      return {
        success: true,
        message: 'Operación exitosa',
        data: {
          id: 1,
          slug: 'laguialinux',
          name: 'La Guía Linux',
          title: 'La Guía Linux — Manuales, tutoriales y referencia sysadmin',
          description: 'Portal de guías y documentación técnica de GNU/Linux y software libre',
          domain: 'laguialinux.com',
          url_about: '/sobre-nosotros',
          created_at: '2026-01-01T00:00:00.000000Z'
        }
      };
    }
    return {
      success: true,
      message: 'Operación exitosa',
      data: {
        id: 2,
        slug: 'news',
        name: 'Noticias Linux',
        title: 'Noticias Linux — Actualidad, Kernel y Ciberseguridad',
        description: 'Actualidad sobre el ecosistema Linux, ciberdefensa y distribuciones',
        domain: 'news.laguialinux.com',
        url_about: '/sobre-nosotros',
        created_at: '2026-01-01T00:00:00.000000Z'
      }
    };
  }

  getCategoriesFixture(slug) {
    if (slug === 'laguialinux') {
      return [
        {
          slug: 'comandos',
          name: 'Comandos y Chuletas',
          description: 'Sintaxis y ejemplos esenciales de terminal GNU/Linux.',
          icon: 'terminal',
          color: '#059669',
          urlImageMicro: 'https://api.raupulus.dev/file/cat-micro.webp',
          urlImageSmall: 'https://api.raupulus.dev/file/cat-small.webp',
          contents_count: 52,
          subcategories: [
            {
              slug: 'archivos-directorios',
              name: 'Archivos y Directorios',
              description: 'Operaciones de ficheros, find, tar, rsync.',
              icon: 'folder',
              color: '#059669',
              urlImageMicro: 'https://api.raupulus.dev/file/sub-micro.webp',
              urlImageSmall: 'https://api.raupulus.dev/file/sub-small.webp',
              contents_count: 14,
              parent: 'comandos'
            },
            {
              slug: 'administracion-usuarios',
              name: 'Usuarios y Permisos',
              description: 'Gestión de usuarios, sudoers, ACLs.',
              icon: 'users',
              color: '#059669',
              urlImageMicro: 'https://api.raupulus.dev/file/sub-micro.webp',
              urlImageSmall: 'https://api.raupulus.dev/file/sub-small.webp',
              contents_count: 11,
              parent: 'comandos'
            },
            {
              slug: 'gestion-paquetes',
              name: 'Gestión de Paquetes',
              description: 'APT, DPKG, RPM, Flatpak.',
              icon: 'package',
              color: '#059669',
              urlImageMicro: 'https://api.raupulus.dev/file/sub-micro.webp',
              urlImageSmall: 'https://api.raupulus.dev/file/sub-small.webp',
              contents_count: 12,
              parent: 'comandos'
            }
          ]
        },
        {
          slug: 'almacenamiento',
          name: 'Discos y Almacenamiento',
          description: 'Particionado, formateo y reparación.',
          icon: 'hard-drive',
          color: '#0d9488',
          urlImageMicro: 'https://api.raupulus.dev/file/cat-micro.webp',
          urlImageSmall: 'https://api.raupulus.dev/file/cat-small.webp',
          contents_count: 22,
          subcategories: [
            {
              slug: 'particionado-formateo',
              name: 'Particionado y Formateo',
              description: 'fdisk, gdisk, parted, mkfs.',
              icon: 'disc',
              color: '#0d9488',
              urlImageMicro: 'https://api.raupulus.dev/file/sub-micro.webp',
              urlImageSmall: 'https://api.raupulus.dev/file/sub-small.webp',
              contents_count: 8,
              parent: 'almacenamiento'
            }
          ]
        },
        {
          slug: 'redes',
          name: 'Redes y Servidores',
          description: 'Configuración de interfaces y cortafuegos.',
          icon: 'network',
          color: '#0284c7',
          urlImageMicro: 'https://api.raupulus.dev/file/cat-micro.webp',
          urlImageSmall: 'https://api.raupulus.dev/file/cat-small.webp',
          contents_count: 18,
          subcategories: []
        }
      ];
    }

    return [
      {
        slug: 'distribuciones',
        name: 'Distribuciones GNU/Linux',
        description: 'Lanzamientos y novedades de distros.',
        icon: 'disc',
        color: '#ea580c',
        urlImageMicro: 'https://api.raupulus.dev/file/cat-micro.webp',
        urlImageSmall: 'https://api.raupulus.dev/file/cat-small.webp',
        contents_count: 38,
        subcategories: []
      },
      {
        slug: 'ciberseguridad',
        name: 'Ciberseguridad y Privacidad',
        description: 'Vulnerabilidades críticas y parches.',
        icon: 'shield-alert',
        color: '#dc2626',
        urlImageMicro: 'https://api.raupulus.dev/file/cat-micro.webp',
        urlImageSmall: 'https://api.raupulus.dev/file/cat-small.webp',
        contents_count: 24,
        subcategories: []
      }
    ];
  }

  getTagsFixture(slug) {
    return [
      { id: 1, slug: 'debian', name: 'Debian', color: '#d70a53', contents_count: 45 },
      { id: 2, slug: 'systemd', name: 'Systemd', color: '#000000', contents_count: 30 },
      { id: 3, slug: 'btrfs', name: 'Btrfs', color: '#008080', contents_count: 18 },
      { id: 4, slug: 'arch-linux', name: 'Arch Linux', color: '#1793d1', contents_count: 12 },
      { id: 5, slug: 'seguridad', name: 'Seguridad', color: '#e11d48', contents_count: 8 },
      { id: 6, slug: 'kernel', name: 'Kernel', color: '#f59e0b', contents_count: 5 },
      { id: 7, slug: 'umask', name: 'Umask', color: '#6366f1', contents_count: 1 },
      { id: 8, slug: 'empty-tag', name: 'Sin Artículos', color: '#94a3b8', contents_count: 0 }
    ];
  }

  getContentsFixture(slug, filters = {}) {
    const list = [
      {
        id: 101,
        title: 'Guía completa de comandos find y xargs',
        slug: 'guia-comandos-find-xargs',
        excerpt: 'Aprende a buscar ficheros con criterios complejos y ejecutar acciones en lote.',
        type: { id: 1, slug: 'guide', name: 'Guía' },
        status: { id: 3, slug: 'published', name: 'Publicado' },
        is_featured: true,
        category_slug: 'comandos',
        subcategory_slug: 'archivos-directorios',
        tag_slugs: ['debian', 'systemd'],
        pages_count: 4,
        views_count: 1250,
        published_at: '2026-09-01T10:00:00Z',
        created_at: '2026-08-20T10:00:00Z',
        updated_at: '2026-09-01T10:00:00Z'
      },
      {
        id: 102,
        title: 'Gestión de usuarios y grupos con useradd y usermod',
        slug: 'gestion-usuarios-useradd-usermod',
        excerpt: 'Configuración segura de cuentas de usuario, shells y pertenencia a grupos secundarios.',
        type: { id: 1, slug: 'guide', name: 'Guía' },
        status: { id: 3, slug: 'published', name: 'Publicado' },
        is_featured: false,
        category_slug: 'comandos',
        subcategory_slug: 'administracion-usuarios',
        tag_slugs: ['debian', 'seguridad'],
        pages_count: 3,
        views_count: 840,
        published_at: '2026-09-05T12:00:00Z',
        created_at: '2026-09-01T10:00:00Z',
        updated_at: '2026-09-05T12:00:00Z'
      },
      {
        id: 103,
        title: 'Formateo y particionado avanzado con fdisk y mkfs',
        slug: 'formateo-particionado-fdisk-mkfs',
        excerpt: 'Cómo crear tablas de particiones GPT y formatear en ext4 y btrfs paso a paso.',
        type: { id: 1, slug: 'guide', name: 'Guía' },
        status: { id: 3, slug: 'published', name: 'Publicado' },
        is_featured: true,
        category_slug: 'almacenamiento',
        subcategory_slug: 'particionado-formateo',
        tag_slugs: ['btrfs', 'arch-linux'],
        pages_count: 5,
        views_count: 2100,
        published_at: '2026-09-10T14:00:00Z',
        created_at: '2026-09-05T10:00:00Z',
        updated_at: '2026-09-10T14:00:00Z'
      },
      {
        id: 104,
        title: 'Gestión de paquetes nativos con APT en Debian y Ubuntu',
        slug: 'gestion-paquetes-apt-debian',
        excerpt: 'Chuleta exhaustiva de comandos apt, apt-cache, dpkg y resolución de bloqueos.',
        type: { id: 1, slug: 'guide', name: 'Guía' },
        status: { id: 3, slug: 'published', name: 'Publicado' },
        is_featured: false,
        category_slug: 'comandos',
        subcategory_slug: 'gestion-paquetes',
        tag_slugs: ['debian'],
        pages_count: 2,
        views_count: 670,
        published_at: '2026-09-12T08:00:00Z',
        created_at: '2026-09-10T10:00:00Z',
        updated_at: '2026-09-12T08:00:00Z'
      },
      {
        id: 105,
        title: 'Optimización de Swappiness y memoria en Debian',
        slug: 'optimizacion-swappiness-memoria',
        excerpt: 'Ajuste del uso de espacio de intercambio y caching en memoria RAM.',
        type: { id: 2, slug: 'blog', name: 'Artículo' },
        status: { id: 3, slug: 'published', name: 'Publicado' },
        is_featured: false,
        category_slug: 'comandos',
        subcategory_slug: 'archivos-directorios',
        tag_slugs: ['debian', 'systemd'],
        pages_count: 1,
        views_count: 430,
        published_at: '2026-09-15T09:00:00Z',
        created_at: '2026-09-12T10:00:00Z',
        updated_at: '2026-09-15T09:00:00Z'
      }
    ];

    return list.filter(item => {
      if (filters.categoryFilter) {
        const matchesCategory = item.category_slug === filters.categoryFilter || item.subcategory_slug === filters.categoryFilter;
        if (!matchesCategory) return false;
      }
      if (filters.tagFilter) {
        if (!item.tag_slugs || !item.tag_slugs.includes(filters.tagFilter)) return false;
      }
      if (filters.typeFilter) {
        if (item.type.slug !== filters.typeFilter) return false;
      }
      if (filters.q) {
        const term = filters.q.trim().toLowerCase();
        const matchesQ = item.title.toLowerCase().includes(term) || item.excerpt.toLowerCase().includes(term);
        if (!matchesQ) return false;
      }
      return true;
    });
  }

  getContentFilesFixture(platformSlug, contentSlug) {
    if (contentSlug === 'optimizacion-swap-swappiness-debian') {
      return [
        {
          id: 44,
          filename: 'tune-swap.sh',
          mime_type: 'text/x-shellscript',
          size_human: '2.4 KB',
          download_url: 'https://api.raupulus.dev/file/download/content/105/tune-swap.sh'
        }
      ];
    }
    return [];
  }

  getContentDetailFixture(platformSlug, contentSlug) {
    const details = {
      'optimizacion-swap-swappiness-debian': {
        id: 105,
        title: 'Optimización extrema de memoria Swap y Swappiness en Debian',
        slug: 'optimizacion-swap-swappiness-debian',
        type: { id: 1, slug: 'guide', name: 'Guía', plural_name: 'Guías' },
        excerpt: 'Aprende a ajustar vm.swappiness, crear zram y prevenir congelamientos en entornos de alta carga.',
        published_at: '2026-10-05T09:00:00Z',
        updated_at: '2026-10-11T12:00:00Z',
        views_count: 1420,
        author: {
          name: 'Raúl Caro Pastorino',
          nickname: '@raupulus',
          website: 'https://raupulus.dev',
          email: 'public@raupulus.dev'
        },
        category: {
          slug: 'comandos',
          name: 'Comandos y Chuletas',
          color: '#10b981'
        },
        image: {
          url: 'https://api.raupulus.dev/file/get/content/105/cover.png',
          thumbnails: {
            large: 'https://api.raupulus.dev/file/thumbnail/get/content/105/cover.webp'
          }
        },
        metadata: {
          reading_time_minutes: 8,
          difficulty: 'Intermedio',
          distros_tested: ['Debian 12', 'Ubuntu 24.04 LTS'],
          youtube_video_id: 'dQw4w9WgXcQ',
          github_repo: 'https://github.com/raupulus/linux-sysadmin-scripts',
          official_docs_url: 'https://www.kernel.org/doc/Documentation/vm/'
        },
        pages_count: 3,
        pages: [
          {
            id: 201,
            order: 1,
            title: 'Diagnóstico del uso actual de Swap',
            slug: 'diagnostico-swap',
            reading_time_minutes: 2,
            format: 'html',
            body: '<h2>1. Diagnóstico del sistema</h2><p>Antes de modificar parámetros de kernel:</p><pre><code class="language-bash">$ free -h\n$ swapon --show</code></pre>'
          },
          {
            id: 202,
            order: 2,
            title: 'Configuración de zram y sysctl.conf',
            slug: 'configuracion-zram-sysctl',
            reading_time_minutes: 4,
            format: 'html',
            body: '<h2>2. Ajuste de sysctl</h2><pre><code class="language-bash">$ sudo sysctl vm.swappiness=10\n# Guardar en sysctl.conf</code></pre>'
          },
          {
            id: 203,
            order: 3,
            title: 'Verificación de rendimiento y pruebas de estrés',
            slug: 'pruebas-estres',
            reading_time_minutes: 2,
            format: 'html',
            body: '<h2>3. Pruebas de carga</h2><pre><code class="language-bash"># apt install stress-ng\n$ stress-ng --vm 2 --vm-bytes 1G --timeout 60s</code></pre>'
          }
        ]
      },
      'guia-comandos-find-xargs': {
        id: 101,
        title: 'Guía completa de comandos find y xargs',
        slug: 'guia-comandos-find-xargs',
        type: { id: 1, slug: 'guide', name: 'Guía' },
        excerpt: 'Aprende a buscar ficheros con criterios complejos y ejecutar acciones en lote.',
        published_at: '2026-09-01T10:00:00Z',
        updated_at: '2026-09-01T10:00:00Z',
        views_count: 1250,
        author: {
          name: 'Raúl Caro Pastorino',
          nickname: '@raupulus',
          email: 'public@raupulus.dev'
        },
        category: {
          slug: 'comandos',
          name: 'Comandos y Chuletas',
          color: '#059669'
        },
        metadata: {
          reading_time_minutes: 6,
          difficulty: 'Principiante',
          distros_tested: ['Debian 12', 'Arch Linux']
        },
        pages_count: 4,
        pages: [
          { id: 301, order: 1, title: 'Búsqueda por nombre y tipo', slug: 'busqueda-nombre-tipo', reading_time_minutes: 1, format: 'html', body: '<pre><code>$ find . -name "*.log"</code></pre>' },
          { id: 302, order: 2, title: 'Filtros por tamaño y fechas', slug: 'filtros-tamano-fechas', reading_time_minutes: 2, format: 'html', body: '<pre><code>$ find /var/log -size +100M</code></pre>' },
          { id: 303, order: 3, title: 'Piping hacia xargs', slug: 'piping-hacia-xargs', reading_time_minutes: 2, format: 'html', body: '<pre><code>$ find . -type f -print0 | xargs -0 grep "error"</code></pre>' },
          { id: 304, order: 4, title: 'Buenas prácticas y riesgos', slug: 'buenas-practicas-riesgos', reading_time_minutes: 1, format: 'html', body: '<p>Revisión final de seguridad.</p>' }
        ]
      },
      'formateo-particionado-fdisk-mkfs': {
        id: 103,
        title: 'Formateo y particionado avanzado con fdisk y mkfs',
        slug: 'formateo-particionado-fdisk-mkfs',
        type: { id: 1, slug: 'guide', name: 'Guía' },
        excerpt: 'Cómo crear tablas de particiones GPT y formatear en ext4 y btrfs paso a paso.',
        published_at: '2026-09-10T14:00:00Z',
        updated_at: '2026-09-10T14:00:00Z',
        views_count: 2100,
        author: {
          name: 'Raúl Caro Pastorino',
          nickname: '@raupulus',
          email: 'public@raupulus.dev'
        },
        category: {
          slug: 'almacenamiento',
          name: 'Discos y Almacenamiento',
          color: '#0d9488'
        },
        metadata: {
          reading_time_minutes: 10,
          difficulty: 'Avanzado',
          distros_tested: ['Debian 12', 'Fedora 40', 'Arch Linux']
        },
        pages_count: 5,
        pages: [
          { id: 401, order: 1, title: 'Identificación de unidades con lsblk', slug: 'identificacion-unidades', reading_time_minutes: 2, format: 'html', body: '<pre><code>$ lsblk -f</code></pre>' },
          { id: 402, order: 2, title: 'Creación de tabla GPT con fdisk', slug: 'creacion-tabla-gpt', reading_time_minutes: 2, format: 'html', body: '<pre><code># fdisk /dev/sdb</code></pre>' },
          { id: 403, order: 3, title: 'Formateo con mkfs.ext4', slug: 'formateo-mkfs-ext4', reading_time_minutes: 2, format: 'html', body: '<pre><code># mkfs.ext4 -L Datos /dev/sdb1</code></pre>' },
          { id: 404, order: 4, title: 'Montaje en /etc/fstab', slug: 'montaje-etc-fstab', reading_time_minutes: 2, format: 'html', body: '<pre><code>$ sudo blkid /dev/sdb1</code></pre>' },
          { id: 405, order: 5, title: 'Comprobación y salud del disco', slug: 'comprobacion-salud', reading_time_minutes: 2, format: 'html', body: '<p>Guía completada con éxito.</p>' }
        ]
      },
      'linux-kernel-6-13-publicado': {
        id: 88,
        title: 'Linux Kernel 6.13 publicado oficialmente con soporte mejorado para ARM64 y Bcachefs',
        slug: 'linux-kernel-6-13-publicado',
        type: { id: 4, slug: 'news', name: 'Noticia' },
        excerpt: 'Linus Torvalds ha anunciado la disponibilidad de la versión final del kernel 6.13 con mejoras en rendimiento.',
        published_at: '2026-10-11T14:30:00.000000Z',
        updated_at: '2026-10-11T15:00:00.000000Z',
        views_count: 890,
        author: {
          name: 'Raúl Caro Pastorino',
          nickname: '@raupulus',
          email: 'public@raupulus.dev'
        },
        category: {
          slug: 'kernel',
          name: 'Kernel y Núcleo Linux',
          color: '#ea580c'
        },
        image: {
          url: 'https://api.raupulus.dev/file/get/content/88/cover.png',
          caption: 'Mascota Tux sobre arquitectura de microprocesador',
          credits: 'La Guía Linux',
          thumbnails: {
            large: 'https://api.raupulus.dev/file/thumbnail/get/content/88/cover.webp'
          }
        },
        metadata: {
          reading_time_minutes: 3,
          sources: [
            { title: 'Anuncio oficial en Linux Kernel Mailing List (LKML)', url: 'https://lore.kernel.org/lkml/2026-10-11-kernel-release' },
            { title: 'Árbol Git de Linus Torvalds', url: 'https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git' }
          ]
        },
        pages_count: 2,
        pages: [
          {
            id: 150,
            order: 1,
            title: 'Novedades principales en el planificador y CPU',
            slug: 'novedades-cpu',
            format: 'html',
            body: '<p>El planificador EEVDF recibe importantes mejoras de latencia en compilación...</p>'
          },
          {
            id: 151,
            order: 2,
            title: 'Controladores gráficos y sistemas de ficheros',
            slug: 'drivers-fs',
            format: 'html',
            body: '<p>Bcachefs incorpora parches de estabilización para recuperación de metadatos...</p>'
          }
        ]
      },
      'cve-2024-6387-regresshion': {
        id: 92,
        title: 'RegreSSHion: Ejecución remota de código sin autenticación en OpenSSH Server',
        slug: 'cve-2024-6387-regresshion',
        type: { id: 4, slug: 'news', name: 'Noticia' },
        excerpt: 'Vulnerabilidad crítica en sshd basada en condición de carrera de señales que permite a atacantes remotos obtener privilegios de root.',
        published_at: '2026-10-08T08:00:00.000000Z',
        updated_at: '2026-10-08T10:00:00.000000Z',
        views_count: 3200,
        author: {
          name: 'Raúl Caro Pastorino',
          nickname: '@raupulus',
          email: 'public@raupulus.dev'
        },
        category: {
          slug: 'ciberseguridad',
          name: 'Ciberseguridad y Privacidad',
          color: '#dc2626'
        },
        metadata: {
          reading_time_minutes: 4,
          cve_id: 'CVE-2024-6387',
          cvss_score: 9.8,
          severity: 'critical',
          affected_package: 'openssh-server (glibc)',
          sources: [
            { title: 'Aviso de Seguridad de Qualys Security Advisory', url: 'https://www.qualys.com/2024/07/01/cve-2024-6387/regresshion.txt' }
          ]
        },
        pages_count: 1,
        pages: [
          {
            id: 160,
            order: 1,
            title: 'Análisis técnico y mitigación inmediata',
            slug: 'analisis-mitigacion',
            format: 'html',
            body: '<p>Actualiza de inmediato mediante apt update && apt install openssh-server.</p>'
          }
        ]
      }
    };

    return details[contentSlug] || null;
  }

  getKernelReleasesFixture() {
    return {
      releases: [
        { version: '6.14-rc1', moniker: 'mainline', date: '2026-10-10', iseol: false, giturl: 'https://git.kernel.org/torvalds/t/linux-6.14-rc1.tar.gz' },
        { version: '6.13.2', moniker: 'stable', date: '2026-10-08', iseol: false, giturl: 'https://git.kernel.org/pub/scm/linux/kernel/git/stable/linux.git' },
        { version: '6.6.77', moniker: 'longterm', date: '2026-10-06', iseol: false },
        { version: '6.1.128', moniker: 'longterm', date: '2026-10-05', iseol: false },
        { version: '5.15.178', moniker: 'longterm', date: '2026-10-01', iseol: true }
      ]
    };
  }
}

