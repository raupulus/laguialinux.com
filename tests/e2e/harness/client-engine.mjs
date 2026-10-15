/**
 * Client Engine & Contract Model implementations for E2E validation
 * Implements exact algorithmic and interface contracts from MOD-00, MOD-02, and content.md
 */

/**
 * Standard Normalized API Error
 */
export class NormalizedApiError extends Error {
  constructor({ status, message, errors = {}, isNetworkError = false, isRateLimited = false, retryAfterSeconds = undefined, raw = null }) {
    super(message);
    this.name = 'NormalizedApiError';
    this.status = status;
    this.errors = errors;
    this.isNetworkError = isNetworkError;
    this.isRateLimited = isRateLimited;
    this.retryAfterSeconds = retryAfterSeconds;
    this.raw = raw;
  }
}

/**
 * In-memory / Session-storage mock for ETag cache
 */
export class MemoryCacheStore {
  constructor(options = {}) {
    this.store = new Map();
    this.quotaLimit = options.quotaLimit || Infinity;
    this.throwQuotaError = options.throwQuotaError || false;
  }

  get(key) {
    return this.store.get(key);
  }

  set(key, value) {
    if (this.throwQuotaError || this.store.size >= this.quotaLimit) {
      const err = new Error('QuotaExceededError');
      err.name = 'QuotaExceededError';
      throw err;
    }
    this.store.set(key, value);
  }

  delete(key) {
    this.store.delete(key);
  }

  clear() {
    this.store.clear();
  }

  get size() {
    return this.store.size;
  }
}

/**
 * Core API Client Engine implementing MOD-00 specifications
 */
export class ApiClientEngine {
  constructor(options = {}) {
    this.baseUrl = options.baseUrl || 'http://localhost:8000/api/v2';
    this.platformSlug = options.platformSlug || 'laguialinux';
    this.cacheStore = options.cacheStore || new MemoryCacheStore();
    this.cacheTtlMs = options.cacheTtlMs || 60000;
  }

  /**
   * Builds canonical cache key: `${method}:${url}:${canonicalQueryString}`
   */
  buildCacheKey(method, url, params = {}) {
    const sortedKeys = Object.keys(params).sort();
    const queryParts = [];
    for (const key of sortedKeys) {
      const val = params[key];
      if (val !== undefined && val !== null) {
        queryParts.push(`${encodeURIComponent(key)}=${encodeURIComponent(val)}`);
      }
    }
    const queryString = queryParts.join('&');
    return `${method.toUpperCase()}:${url}:${queryString}`;
  }

  /**
   * Parse Retry-After header: integer seconds or HTTP-Date
   */
  parseRetryAfter(headerValue) {
    if (!headerValue) return undefined;
    const asInt = parseInt(headerValue, 10);
    if (!isNaN(asInt) && String(asInt) === headerValue.trim()) {
      return Math.max(0, asInt);
    }
    const dateMs = Date.parse(headerValue);
    if (!isNaN(dateMs)) {
      const diffSec = Math.ceil((dateMs - Date.now()) / 1000);
      return Math.max(0, diffSec);
    }
    return undefined;
  }

  /**
   * Normalizes any exception into a strict NormalizedApiError
   */
  normalizeError(status, data, headers = {}, rawErr = null) {
    const isNetwork = Boolean(status === 0 || (rawErr && (rawErr.message?.includes('fetch failed') || rawErr.code === 'ECONNREFUSED')));
    const retryHeader = headers['retry-after'] || headers['Retry-After'];
    const isRateLimited = status === 429;
    const retryAfterSeconds = isRateLimited ? this.parseRetryAfter(retryHeader) : undefined;

    let message = 'Error de comunicación.';
    if (data && typeof data === 'object' && data.message) {
      message = data.message;
    } else if (isNetwork) {
      message = 'No se pudo conectar con el servidor. Revisa tu conexión a internet.';
    } else if (rawErr?.message) {
      message = rawErr.message;
    }

    const errors = (data && typeof data === 'object' && data.errors) ? data.errors : {};

    return new NormalizedApiError({
      status: status || (isNetwork ? 0 : 500),
      message,
      errors,
      isNetworkError: isNetwork,
      isRateLimited,
      retryAfterSeconds,
      raw: rawErr || data
    });
  }

  /**
   * Main HTTP request method
   */
  async request(path, options = {}) {
    const method = (options.method || 'GET').toUpperCase();
    const params = options.params || {};
    const skipCache = Boolean(options.skipCache);
    const fullUrl = path.startsWith('http') ? path : `${this.baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
    const cacheKey = this.buildCacheKey(method, fullUrl, params);

    // Build URL with query params
    const urlObj = new URL(fullUrl);
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null) {
        urlObj.searchParams.set(k, String(v));
      }
    }

    const headers = {
      'Accept': 'application/json',
      ...(options.headers || {})
    };

    if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
      headers['Content-Type'] = 'application/json';
    }

    // Inspect cached entry for GET
    let cachedEntry = null;
    if (method === 'GET' && !skipCache) {
      cachedEntry = this.cacheStore.get(cacheKey);
      if (cachedEntry?.etag) {
        headers['If-None-Match'] = cachedEntry.etag;
      }
    }

    let fetchRes;
    try {
      fetchRes = await fetch(urlObj.toString(), {
        method,
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
        signal: options.signal
      });
    } catch (err) {
      throw this.normalizeError(0, null, {}, err);
    }

    const resHeaders = Object.fromEntries(fetchRes.headers.entries());

    // HTTP 304 Not Modified
    if (fetchRes.status === 304) {
      if (cachedEntry) {
        // Refresh timestamp and return cached envelope
        cachedEntry.timestamp = Date.now();
        return cachedEntry.data;
      }
    }

    // HTTP 204 No Content
    if (fetchRes.status === 204) {
      return {
        success: true,
        message: 'Operación completada',
        data: null
      };
    }

    // Parse JSON
    let responseData = null;
    const rawText = await fetchRes.text();
    try {
      responseData = JSON.parse(rawText);
    } catch (jsonErr) {
      if (!fetchRes.ok) {
        throw this.normalizeError(fetchRes.status, null, resHeaders, new Error(`Non-JSON HTTP ${fetchRes.status}: ${rawText.slice(0, 100)}`));
      }
    }

    // Handle non-2xx status
    if (!fetchRes.ok) {
      throw this.normalizeError(fetchRes.status, responseData, resHeaders);
    }

    // Store in ETag cache if valid ETag exists
    const etag = resHeaders['etag'] || resHeaders['ETag'];
    if (method === 'GET' && etag && responseData?.success) {
      try {
        this.cacheStore.set(cacheKey, {
          etag,
          data: responseData,
          timestamp: Date.now()
        });
      } catch (storageErr) {
        // QuotaExceededError fallback: gracefully ignore storage failure
        if (storageErr.name !== 'QuotaExceededError') {
          throw storageErr;
        }
      }
    }

    // Invalidation for mutations
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      // Invalidate platform-level cache entries
      for (const key of Array.from(this.cacheStore.store?.keys?.() || [])) {
        if (key.includes(this.platformSlug)) {
          this.cacheStore.delete(key);
        }
      }
    }

    return responseData;
  }
}

/**
 * Taxonomy and Category Engine algorithms (MOD-02)
 */
export class TaxonomyEngine {
  /**
   * Proportional typographic scaling algorithm for Tag Cloud (MOD-02 § 2.4.3)
   * Maps contents_count to text size classes: text-xs, text-sm, text-base, text-lg
   */
  static calculateTagTypography(count, minCount, maxCount) {
    if (maxCount <= minCount || count <= minCount) {
      return {
        sizeClass: 'text-xs',
        weightClass: 'font-normal',
        scaleLevel: 1
      };
    }

    const ratio = (count - minCount) / (maxCount - minCount);

    if (ratio >= 0.75) {
      return { sizeClass: 'text-lg', weightClass: 'font-bold', scaleLevel: 4 };
    }
    if (ratio >= 0.50) {
      return { sizeClass: 'text-base', weightClass: 'font-semibold', scaleLevel: 3 };
    }
    if (ratio >= 0.25) {
      return { sizeClass: 'text-sm', weightClass: 'font-medium', scaleLevel: 2 };
    }
    return { sizeClass: 'text-xs', weightClass: 'font-normal', scaleLevel: 1 };
  }

  /**
   * Generates pill list for a root category with "Todas" first
   */
  static generateSubcategoryPills(rootCategory, activeSubcategorySlug = null) {
    if (!rootCategory) return [];

    const pills = [
      {
        slug: 'all',
        name: 'Todas',
        contents_count: rootCategory.contents_count,
        isActive: !activeSubcategorySlug || activeSubcategorySlug === 'all',
        isRootAll: true
      }
    ];

    if (Array.isArray(rootCategory.subcategories)) {
      for (const sub of rootCategory.subcategories) {
        pills.push({
          slug: sub.slug,
          name: sub.name,
          contents_count: sub.contents_count,
          isActive: activeSubcategorySlug === sub.slug,
          isRootAll: false,
          parent: sub.parent
        });
      }
    }

    return pills;
  }

  /**
   * MegaMenu 2-column model transformer
   */
  static transformMegaMenu(categories, activeRootSlug = null) {
    if (!Array.isArray(categories) || categories.length === 0) {
      return { rootCategories: [], activeCategory: null, subcategories: [] };
    }

    const activeSlug = activeRootSlug || categories[0].slug;
    const activeCategory = categories.find(c => c.slug === activeSlug) || categories[0];

    return {
      rootCategories: categories.map(cat => ({
        slug: cat.slug,
        name: cat.name,
        description: cat.description || '',
        icon: cat.icon || 'folder',
        contents_count: cat.contents_count,
        isActive: cat.slug === activeCategory.slug
      })),
      activeCategory,
      subcategories: activeCategory.subcategories || []
    };
  }

  /**
   * Breadcrumbs builder for category hierarchy
   */
  static buildBreadcrumbs(category, subcategory = null) {
    const crumbs = [
      { label: 'Inicio', path: '/' }
    ];

    if (category) {
      crumbs.push({
        label: category.name,
        path: `/categoria/${category.slug}`
      });
    }

    if (subcategory) {
      crumbs.push({
        label: subcategory.name,
        path: `/categoria/${category.slug}?subcategoria=${subcategory.slug}`
      });
    }

    return crumbs;
  }

  /**
   * Pagination boundary and navigation state calculator
   */
  static calculatePagination(meta) {
    const { total = 0, per_page = 15, current_page = 1, last_page = 1 } = meta || {};
    const clampedCurrent = Math.max(1, Math.min(current_page, last_page));
    const hasPrevious = clampedCurrent > 1;
    const hasNext = clampedCurrent < last_page;

    const from = total > 0 ? (clampedCurrent - 1) * per_page + 1 : 0;
    const to = total > 0 ? Math.min(clampedCurrent * per_page, total) : 0;

    return {
      currentPage: clampedCurrent,
      lastPage: Math.max(1, last_page),
      total,
      perPage: per_page,
      hasPrevious,
      hasNext,
      from,
      to,
      pagesRange: Array.from({ length: Math.max(1, last_page) }, (_, i) => i + 1)
    };
  }
}

/**
 * Guide Engine algorithms and contract implementations (MOD-10, MOD-11)
 */
export class GuideEngine {
  /**
   * Validates guide hero metadata structure and author integrity (MOD-10 § 1.2, 2.1)
   */
  static validateHeroMetadata(guide) {
    if (!guide || typeof guide !== 'object') {
      return { isValid: false, errors: ['Guide object is null or undefined'] };
    }

    const errors = [];
    if (!guide.title || typeof guide.title !== 'string') errors.push('Missing guide title');
    if (!guide.slug || typeof guide.slug !== 'string') errors.push('Missing guide slug');
    if (!guide.excerpt || typeof guide.excerpt !== 'string') errors.push('Missing guide excerpt');

    const author = guide.author || {};
    if (author.name !== 'Raúl Caro Pastorino') errors.push('Author name must be Raúl Caro Pastorino');
    if (author.email !== 'public@raupulus.dev') errors.push('Author email must be public@raupulus.dev');

    const meta = guide.metadata || {};
    const readingTime = Number(meta.reading_time_minutes || 0);
    if (readingTime < 1) errors.push('Reading time must be at least 1 minute');

    const validDifficulties = ['Principiante', 'Intermedio', 'Avanzado'];
    if (meta.difficulty && !validDifficulties.includes(meta.difficulty)) {
      errors.push(`Difficulty must be one of: ${validDifficulties.join(', ')}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      title: guide.title,
      slug: guide.slug,
      excerpt: guide.excerpt,
      authorName: author.name,
      authorNick: author.nickname || '@raupulus',
      authorEmail: author.email,
      readingTimeMinutes: readingTime,
      difficulty: meta.difficulty || 'Principiante',
      distrosTested: Array.isArray(meta.distros_tested) ? meta.distros_tested : [],
      youtubeVideoId: meta.youtube_video_id || null,
      githubRepo: meta.github_repo || null
    };
  }

  /**
   * Generates CSS Blur Backdrop style for guide cover (MOD-10 § 1.2)
   */
  static generateBlurBackdrop(imageUrl) {
    if (!imageUrl || typeof imageUrl !== 'string') {
      return {
        hasBlurOverlay: false,
        backdropStyle: { display: 'none' }
      };
    }

    return {
      hasBlurOverlay: true,
      backdropStyle: {
        backgroundImage: `url("${imageUrl}")`,
        filter: 'blur(16px)',
        transform: 'scale(1.05)',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }
    };
  }

  /**
   * YouTube Lite Facade Embed builder (MOD-10 § 2.4)
   * Only mounts iframe when user explicitly clicks the player facade
   */
  static buildYouTubeEmbed(videoId, isClicked = false) {
    if (!videoId) {
      return { hasVideo: false, posterUrl: null, isIframeMounted: false, iframeHtml: null };
    }

    const posterUrl = `https://i.ytimg.com/vi_webp/${videoId}/maxresdefault.webp`;
    const iframeHtml = isClicked
      ? `<iframe src="https://www.youtube.com/embed/${videoId}?autoplay=1" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`
      : null;

    return {
      hasVideo: true,
      videoId,
      posterUrl,
      isIframeMounted: Boolean(isClicked),
      iframeHtml
    };
  }

  /**
   * Formats downloadable files with extension badges and human size (MOD-10 § 1.2)
   */
  static formatDownloadableFiles(files) {
    if (!Array.isArray(files)) return [];

    return files.map(file => {
      const ext = (file.filename || '').split('.').pop()?.toLowerCase() || '';
      return {
        id: file.id,
        filename: file.filename,
        extension: ext,
        mime_type: file.mime_type,
        size_human: file.size_human,
        download_url: file.download_url,
        isShellScript: ext === 'sh',
        isConfigFile: ['conf', 'cfg', 'yaml', 'yml', 'ini'].includes(ext)
      };
    });
  }

  /**
   * Generates step index cards and CTA button (MOD-10 § 2.3)
   */
  static generateStepIndex(pages, baseGuidePath = '/guia') {
    if (!Array.isArray(pages) || pages.length === 0) {
      return { steps: [], startGuideCta: null, totalReadingTime: 0 };
    }

    const sortedPages = [...pages].sort((a, b) => (a.order || 0) - (b.order || 0));
    const totalReadingTime = sortedPages.reduce((acc, p) => acc + (p.reading_time_minutes || 0), 0);

    const steps = sortedPages.map((page, index) => ({
      stepNumber: index + 1,
      id: page.id,
      title: page.title,
      slug: page.slug,
      reading_time_minutes: page.reading_time_minutes || 1,
      stepPath: `${baseGuidePath}/${page.slug}`
    }));

    const firstStep = steps[0];
    const startGuideCta = {
      label: `Comenzar Guía (Paso 1: ${firstStep.title})`,
      targetUrl: firstStep.stepPath,
      firstStepSlug: firstStep.slug
    };

    return {
      steps,
      startGuideCta,
      totalReadingTime
    };
  }

  /**
   * Multi-page reader state calculator (MOD-11 § 2.4)
   */
  static calculateStepReaderState(pages, currentStepSlug) {
    if (!Array.isArray(pages) || pages.length === 0) {
      return {
        currentIndex: -1,
        currentPage: null,
        previousPage: null,
        nextPage: null,
        totalPages: 0,
        progressPercent: 0,
        isFirstStep: false,
        isLastStep: false
      };
    }

    const sorted = [...pages].sort((a, b) => (a.order || 0) - (b.order || 0));
    let currentIndex = sorted.findIndex(p => p.slug === currentStepSlug);
    if (currentIndex === -1) currentIndex = 0;

    const currentPage = sorted[currentIndex];
    const previousPage = currentIndex > 0 ? sorted[currentIndex - 1] : null;
    const nextPage = currentIndex < sorted.length - 1 ? sorted[currentIndex + 1] : null;
    const progressPercent = Math.round(((currentIndex + 1) / sorted.length) * 100);

    return {
      currentIndex,
      currentPage,
      previousPage,
      nextPage,
      totalPages: sorted.length,
      progressPercent,
      isFirstStep: currentIndex === 0,
      isLastStep: currentIndex === sorted.length - 1
    };
  }

  /**
   * Handles Left/Right arrow key navigation (MOD-11 § 2.4)
   * Disables when user is typing in input, textarea, or contentEditable
   */
  static handleKeyboardNavigation(key, { previousPage, nextPage, targetTag = '', isContentEditable = false }) {
    const ignoredTags = ['input', 'textarea', 'select'];
    if (ignoredTags.includes(targetTag.toLowerCase()) || isContentEditable) {
      return null;
    }

    if (key === 'ArrowLeft' && previousPage) {
      return previousPage.slug;
    }
    if (key === 'ArrowRight' && nextPage) {
      return nextPage.slug;
    }
    return null;
  }

  /**
   * Generates step tabs models (top and bottom) with aria-current="step" (MOD-11 § 1.2)
   */
  static generateStepTabs(pages, currentStepSlug) {
    if (!Array.isArray(pages)) return [];

    const sorted = [...pages].sort((a, b) => (a.order || 0) - (b.order || 0));
    return sorted.map((page, idx) => {
      const isActive = page.slug === currentStepSlug;
      return {
        stepNumber: idx + 1,
        title: page.title,
        slug: page.slug,
        isActive,
        ariaCurrent: isActive ? 'step' : undefined
      };
    });
  }

  /**
   * End screen completion trigger (MOD-11 § 1.2)
   */
  static calculateCompletionScreen(pages, currentStepSlug, guideTitle = '') {
    const readerState = this.calculateStepReaderState(pages, currentStepSlug);
    const isCompleted = readerState.isLastStep;

    return {
      isCompleted,
      guideTitle,
      totalSteps: readerState.totalPages,
      completedSteps: isCompleted ? readerState.totalPages : readerState.currentIndex + 1,
      headline: isCompleted ? '¡Enhorabuena! Has completado la guía' : 'Progreso en curso',
      shareUrl: isCompleted ? `https://laguialinux.com/guia/${pages[0]?.slug}` : null
    };
  }
}

/**
 * Terminal Guard Engine implementations (MOD-12)
 */
export class TerminalGuardEngine {
  static COMMON_CLI_COMMANDS = [
    'apt', 'apt-get', 'systemctl', 'dnf', 'yum', 'pacman', 'zypper', 'apk',
    'rm', 'cd', 'ls', 'mkdir', 'rmdir', 'cat', 'grep', 'chmod', 'chown', 'chgrp',
    'echo', 'touch', 'nano', 'vim', 'vi', 'ip', 'ss', 'netstat', 'curl', 'wget',
    'git', 'docker', 'podman', 'tar', 'gzip', 'bzip2', 'xz', 'dd', 'mount', 'umount',
    'fdisk', 'parted', 'gdisk', 'wipefs', 'mkfs', 'mkswap', 'swapon', 'swapoff',
    'sysctl', 'sed', 'awk', 'find', 'journalctl', 'ufw', 'iptables', 'nft',
    'firewall-cmd', 'export', 'source', 'cp', 'mv', 'ln', 'df', 'du', 'free',
    'ps', 'kill', 'pkill', 'killall', 'crontab', 'useradd', 'usermod', 'userdel',
    'groupadd', 'passwd', 'su', 'sudo', 'service', 'modprobe', 'lsmod', 'dmesg',
    'uname', 'hostnamectl', 'timedatectl', 'localectl', 'update-grub', 'grub-install'
  ];

  static PROMPT_PATTERNS = [
    /^\s*[$]\s+/gm,                                   // $ comando (usuario estándar)
    /^\s*[\w.-]+@[\w.-]+:[~/\w.-]*[$#]\s+/gm,        // usuario@host:~$ o root@host:~#
    /^\s*root@[\w.-]+:[~/\w.-]*#\s+/gm,               // root explícito
    /^\s*>>>\s+/gm                                    // Python / REPL prompt
  ];

  static ROOT_CLI_PROMPT_REGEX = new RegExp(
    `^\\s*#\\s+(?=(?:${TerminalGuardEngine.COMMON_CLI_COMMANDS.join('|')})\\b)`,
    'gm'
  );

  static DESTRUCTIVE_COMMAND_PATTERNS = [
    {
      regex: /\brm\s+.*(-[a-zA-Z]*r[a-zA-Z]*f*|-[a-zA-Z]*f[a-zA-Z]*r*|--recursive\s+--force|--force\s+--recursive)\s+(\/|\/\*|\.\/|\*|\.)(?:\s|$)/i,
      riskLevel: 'critical',
      description: 'Borrado recursivo y forzado sobre la raíz o el directorio actual (rm -rf).'
    },
    {
      regex: /\bdd\s+.*of\s*=\s*\/dev\/(sd[a-z]\d*|nvme\d+n\d+(?:p\d+)?|hd[a-z]\d*|vd[a-z]\d*|mapper\/)/i,
      riskLevel: 'critical',
      description: 'Escritura directa de bloques a disco físico o partición mediante dd.'
    },
    {
      regex: /\b(mkfs(\.[a-z0-9]+)?|mkswap)\s+.*\/dev\//i,
      riskLevel: 'critical',
      description: 'Creación de sistema de ficheros o área de intercambio (formateo).'
    },
    {
      regex: /\b(wipefs|sgdisk|fdisk|parted|gdisk)\s+(-[a-zA-Z]*\s+)?\/dev\//i,
      riskLevel: 'danger',
      description: 'Manipulación o aniquilación de la tabla de particiones del disco.'
    },
    {
      regex: /\bshred\s+.*\/dev\/(sd[a-z]|nvme\d+n\d+|hd[a-z]|vd[a-z])/i,
      riskLevel: 'critical',
      description: 'Sobrescritura destructiva de bajo nivel (shred) sobre disco.'
    },
    {
      regex: /\b(lvremove|vgremove|pvremove)\s+(-[a-zA-Z]*f[a-zA-Z]*\s+)?/i,
      riskLevel: 'critical',
      description: 'Eliminación forzada o desmontaje permanente de volúmenes lógicos LVM.'
    },
    {
      regex: /\b(zpool\s+destroy|zfs\s+destroy\s+(-[a-zA-Z]*r[a-zA-Z]*\s+)?)/i,
      riskLevel: 'critical',
      description: 'Destrucción completa de pools o datasets ZFS de almacenamiento.'
    },
    {
      regex: /\bbtrfs\s+(subvolume\s+delete|device\s+delete)\s+/i,
      riskLevel: 'danger',
      description: 'Eliminación irreversible de subvolumen o dispositivo de almacenamiento Btrfs.'
    },
    {
      regex: /\bchmod\s+(-[a-zA-Z]*R[a-zA-Z]*|--recursive)\s+(777|0777)\s+\//i,
      riskLevel: 'critical',
      description: 'Asignación masiva y recursiva de permisos 777 sobre la raíz del sistema.'
    },
    {
      regex: />\s*\/dev\/(sd[a-z]|nvme\d+n\d+|hd[a-z]|vd[a-z])/i,
      riskLevel: 'critical',
      description: 'Redirección destructiva directa hacia un dispositivo de bloques.'
    },
    {
      regex: /:\(\)\s*\{\s*:\s*\|\s*:\s*&\s*\}\s*;\s*:/,
      riskLevel: 'critical',
      description: 'Fork-bomb clásica capaz de agotar la tabla de procesos del sistema operativo.'
    }
  ];

  /**
   * Cleans interactive shell prompt prefixes while preserving natural comments (MOD-12 § 2.1)
   */
  static cleanPrompt(rawText) {
    if (!rawText || typeof rawText !== 'string') return '';
    let cleaned = rawText;
    for (const pattern of this.PROMPT_PATTERNS) {
      cleaned = cleaned.replace(pattern, '');
    }
    // Only strip '#' when followed by an identified CLI binary
    cleaned = cleaned.replace(this.ROOT_CLI_PROMPT_REGEX, '');
    return cleaned.trim();
  }

  /**
   * Formats terminal command for copy modes (clean, sudo, single-line) (MOD-12 § 2.3)
   */
  static formatCommand(rawText, mode = 'clean') {
    let clean = this.cleanPrompt(rawText);

    if (mode === 'sudo') {
      const lines = clean.split('\n').map(line => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) return line;
        return trimmed.startsWith('sudo ') ? trimmed : `sudo ${trimmed}`;
      });
      clean = lines.join('\n');
    } else if (mode === 'single-line') {
      const lines = clean
        .split('\n')
        .map(l => l.trim())
        .filter(l => l.length > 0 && !l.startsWith('#'));
      clean = lines.join(' && ');
    }

    return clean;
  }

  /**
   * Detects hazardous shell operations requiring confirmation modal (MOD-12 § 2.1)
   */
  static checkDestructive(command) {
    if (!command || typeof command !== 'string') {
      return { isDestructive: false, riskLevel: null, description: null, matchedCommand: null };
    }

    for (const item of this.DESTRUCTIVE_COMMAND_PATTERNS) {
      if (item.regex.test(command)) {
        return {
          isDestructive: true,
          riskLevel: item.riskLevel,
          description: item.description,
          matchedCommand: command
        };
      }
    }

    return { isDestructive: false, riskLevel: null, description: null, matchedCommand: null };
  }

  /**
   * Simulates the Destructive Warning Modal lifecycle (MOD-12 § 2.4)
   */
  static createWarningModalState(command) {
    const detection = this.checkDestructive(command);
    return {
      isOpen: detection.isDestructive,
      pendingCommand: detection.isDestructive ? command : '',
      detection,
      copiedText: detection.isDestructive ? null : command,
      confirmCopy() {
        if (this.isOpen && this.pendingCommand) {
          this.copiedText = this.pendingCommand;
          this.isOpen = false;
          const result = this.copiedText;
          this.pendingCommand = '';
          return result;
        }
        return null;
      },
      cancelCopy() {
        this.isOpen = false;
        this.pendingCommand = '';
        this.copiedText = null;
      }
    };
  }
}

/**
 * News Continuous Reader Engine implementations (MOD-14)
 */
export class NewsReaderEngine {
  /**
   * Assembles continuous reading stream with auto-H2 for secondary sections (MOD-14 § 1.2, 2.3)
   */
  static buildContinuousStream(pages) {
    if (!Array.isArray(pages) || pages.length === 0) return [];

    const sorted = [...pages].sort((a, b) => (a.order || 0) - (b.order || 0));
    return sorted.map(page => ({
      id: page.id,
      order: page.order,
      title: page.title || '',
      shouldRenderH2: (page.order || 0) > 1,
      body: page.body || '',
      renderedHtml: (page.order || 0) > 1 && page.title
        ? `<h2>${page.title}</h2>\n${page.body}`
        : (page.body || '')
    }));
  }

  /**
   * Validates canonical primary sources box (MOD-14 § 2.4)
   */
  static validateSourceBox(sources) {
    if (!Array.isArray(sources) || sources.length === 0) {
      return { hasSources: false, sources: [] };
    }

    const validated = sources.map(src => ({
      title: src.title || 'Fuente externa',
      url: src.url || '',
      target: '_blank',
      rel: 'noopener noreferrer nofollow'
    }));

    return {
      hasSources: validated.length > 0,
      sources: validated
    };
  }

  /**
   * Related news matching algorithm by category and tag overlap (MOD-14 § 2.3)
   */
  static findRelatedArticles(articles, currentSlug, limit = 3) {
    if (!Array.isArray(articles)) return [];

    const current = articles.find(a => a.slug === currentSlug);
    if (!current) return articles.slice(0, limit);

    const candidates = articles.filter(a => a.slug !== currentSlug);
    const scored = candidates.map(article => {
      let score = 0;
      if (article.category?.slug === current.category?.slug) score += 5;
      const currentTags = current.tags || [];
      const articleTags = article.tags || [];
      const sharedTags = currentTags.filter(t => articleTags.includes(t));
      score += sharedTags.length * 2;
      return { article, score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, limit).map(s => s.article);
  }
}

/**
 * Kernel Watcher Engine implementations (MOD-15)
 */
export class KernelWatcherEngine {
  static FALLBACK_KERNEL_DATA = {
    mainline: { version: '6.14-rc1', moniker: 'mainline', date: '2026-10-10' },
    stable: { version: '6.13.2', moniker: 'stable', date: '2026-10-08' },
    lts: [
      { version: '6.6.77', moniker: 'longterm', date: '2026-10-06' },
      { version: '6.1.128', moniker: 'longterm', date: '2026-10-05' }
    ],
    lastChecked: '2026-10-10T00:00:00Z',
    isStale: true
  };

  /**
   * Parses kernel.org releases.json response extracting mainline, stable, and active LTS (MOD-15 § 2.3)
   */
  static parseKernelReleases(releasesJson) {
    if (!releasesJson || !Array.isArray(releasesJson.releases)) {
      return { ...this.FALLBACK_KERNEL_DATA, isStale: true };
    }

    const list = releasesJson.releases;
    const mainline = list.find(r => r.moniker === 'mainline') || null;
    const stable = list.find(r => r.moniker === 'stable') || null;
    const lts = list.filter(r => r.moniker === 'longterm' && !r.iseol).slice(0, 2);

    return {
      mainline,
      stable,
      lts,
      lastChecked: new Date().toISOString(),
      isStale: false
    };
  }

  /**
   * Client-side cache evaluator with 24-hour TTL (MOD-15 § 2.3)
   */
  static evaluateCache(storedData, storedTimestamp, now = Date.now(), ttlMs = 86400000) {
    if (!storedData || !storedTimestamp) {
      return { isValid: false, data: null };
    }

    const ts = parseInt(storedTimestamp, 10);
    if (isNaN(ts) || now - ts >= ttlMs) {
      return { isValid: false, data: null };
    }

    try {
      const data = typeof storedData === 'string' ? JSON.parse(storedData) : storedData;
      return { isValid: true, data };
    } catch {
      return { isValid: false, data: null };
    }
  }
}

/**
 * CVE Critical Alert Engine implementations (MOD-16)
 */
export class CveAlertEngine {
  /**
   * Evaluates if a news publication activates the Critical CVE Alert Banner (MOD-16 § 2.1)
   */
  static evaluateCveCandidate(newsItem, dismissedIds = [], now = Date.now()) {
    if (!newsItem || typeof newsItem !== 'object') {
      return { shouldDisplay: false, alert: null };
    }

    const meta = newsItem.metadata || {};
    const cvss = Number(meta.cvss_score || 0);
    const severity = meta.severity;
    const cveId = meta.cve_id || newsItem.slug;

    // Condition 1: CVSS >= 9.0 or severity critical
    const isCritical = cvss >= 9.0 || severity === 'critical';
    if (!isCritical) {
      return { shouldDisplay: false, alert: null };
    }

    // Condition 2: Category ciberseguridad or CVE tag
    const isSecurity = newsItem.category?.slug === 'ciberseguridad' || (newsItem.tags && newsItem.tags.includes('cve'));
    if (!isSecurity) {
      return { shouldDisplay: false, alert: null };
    }

    // Condition 3: Published within 14 days
    const pubDate = Date.parse(newsItem.published_at || '');
    if (!isNaN(pubDate)) {
      const ageDays = (now - pubDate) / (1000 * 60 * 60 * 24);
      if (ageDays > 14) {
        return { shouldDisplay: false, alert: null };
      }
    }

    // Condition 4: Not dismissed by user
    if (Array.isArray(dismissedIds) && dismissedIds.includes(cveId)) {
      return { shouldDisplay: false, alert: null };
    }

    const alert = {
      cveId,
      title: newsItem.title,
      affectedPackage: meta.affected_package || 'Linux Core',
      cvssScore: cvss,
      severity: 'critical',
      mitigationSlug: `/noticia/${newsItem.slug}`,
      publishedAt: newsItem.published_at
    };

    return { shouldDisplay: true, alert };
  }

  /**
   * Persists CVE dismissal into array without duplicates (MOD-16 § 2.3)
   */
  static dismissCve(cveId, dismissedIds = []) {
    if (!cveId) return [...dismissedIds];
    if (dismissedIds.includes(cveId)) return [...dismissedIds];
    return [...dismissedIds, cveId];
  }
}

/**
 * Sysadmin Tools Suite Engine implementations (MOD-13)
 */
export class SysadminToolsEngine {
  // --- 1. Chmod / Umask Engine ---

  static tripletToOctal(t) {
    return (t.read ? 4 : 0) + (t.write ? 2 : 0) + (t.execute ? 1 : 0);
  }

  static octalToTriplet(val) {
    return {
      read: (val & 4) !== 0,
      write: (val & 2) !== 0,
      execute: (val & 1) !== 0
    };
  }

  static calculateChmod(matrix) {
    let special = 0;
    if (matrix.special?.suid) special += 4;
    if (matrix.special?.sgid) special += 2;
    if (matrix.special?.sticky) special += 1;

    const u = this.tripletToOctal(matrix.user);
    const g = this.tripletToOctal(matrix.group);
    const o = this.tripletToOctal(matrix.others);

    const octal = `${special}${u}${g}${o}`;
    const octalSimple = `${u}${g}${o}`;

    const symbolic = [
      matrix.user.read ? 'r' : '-',
      matrix.user.write ? 'w' : '-',
      matrix.special?.suid ? (matrix.user.execute ? 's' : 'S') : (matrix.user.execute ? 'x' : '-'),
      matrix.group.read ? 'r' : '-',
      matrix.group.write ? 'w' : '-',
      matrix.special?.sgid ? (matrix.group.execute ? 's' : 'S') : (matrix.group.execute ? 'x' : '-'),
      matrix.others.read ? 'r' : '-',
      matrix.others.write ? 'w' : '-',
      matrix.special?.sticky ? (matrix.others.execute ? 't' : 'T') : (matrix.others.execute ? 'x' : '-')
    ].join('');

    // Suggested umask from 0777 base
    const umaskU = 7 - u;
    const umaskG = 7 - g;
    const umaskO = 7 - o;
    const suggestedUmask = `0${umaskU}${umaskG}${umaskO}`;

    // Bitwise calculation of effective permissions
    const umaskInt = parseInt(suggestedUmask, 8);
    const dirBits = 0o777 & ~umaskInt;
    const fileBits = 0o666 & ~umaskInt;

    const toSymbolicTriplets = (bits) => {
      const r = (bits & 4) ? 'r' : '-';
      const w = (bits & 2) ? 'w' : '-';
      const x = (bits & 1) ? 'x' : '-';
      return `${r}${w}${x}`;
    };

    const dirEffective = `d${toSymbolicTriplets((dirBits >> 6) & 7)}${toSymbolicTriplets((dirBits >> 3) & 7)}${toSymbolicTriplets(dirBits & 7)}`;
    const fileEffective = `-${toSymbolicTriplets((fileBits >> 6) & 7)}${toSymbolicTriplets((fileBits >> 3) & 7)}${toSymbolicTriplets(fileBits & 7)}`;

    return {
      octal,
      octalSimple,
      symbolic: `-${symbolic}`,
      chmodCommand: `chmod ${special > 0 ? octal : octalSimple} <fichero_o_directorio>`,
      suggestedUmask,
      dirEffective,
      fileEffective
    };
  }

  static parseOctalInput(octalStr) {
    const cleaned = String(octalStr || '').trim();
    let special = 0;
    let u = 0;
    let g = 0;
    let o = 0;

    if (cleaned.length === 3) {
      u = parseInt(cleaned[0], 8) || 0;
      g = parseInt(cleaned[1], 8) || 0;
      o = parseInt(cleaned[2], 8) || 0;
    } else if (cleaned.length === 4) {
      special = parseInt(cleaned[0], 8) || 0;
      u = parseInt(cleaned[1], 8) || 0;
      g = parseInt(cleaned[2], 8) || 0;
      o = parseInt(cleaned[3], 8) || 0;
    }

    return {
      user: this.octalToTriplet(u),
      group: this.octalToTriplet(g),
      others: this.octalToTriplet(o),
      special: {
        suid: Boolean(special & 4),
        sgid: Boolean(special & 2),
        sticky: Boolean(special & 1)
      }
    };
  }

  static parseSymbolicInput(symbolicStr) {
    const raw = String(symbolicStr || '').trim().replace(/^[-d]/, '');
    const s = raw.padEnd(9, '-');

    const user = {
      read: s[0] === 'r',
      write: s[1] === 'w',
      execute: s[2] === 'x' || s[2] === 's'
    };
    const group = {
      read: s[3] === 'r',
      write: s[4] === 'w',
      execute: s[5] === 'x' || s[5] === 's'
    };
    const others = {
      read: s[6] === 'r',
      write: s[7] === 'w',
      execute: s[8] === 'x' || s[8] === 't'
    };
    const special = {
      suid: s[2] === 's' || s[2] === 'S',
      sgid: s[5] === 's' || s[5] === 'S',
      sticky: s[8] === 't' || s[8] === 'T'
    };

    return { user, group, others, special };
  }

  // --- 2. Cron Expression Engine ---

  static CRON_PRESETS = [
    { label: 'Cada minuto', expression: '* * * * *', description: 'Ejecutar continuamente cada minuto (60 segundos)' },
    { label: 'Cada 5 minutos', expression: '*/5 * * * *', description: 'Ejecutar cada 5 minutos' },
    { label: 'Cada hora en punto', expression: '0 * * * *', description: 'Al inicio de cada hora (minuto 0)' },
    { label: 'Diariamente a medianoche', expression: '0 0 * * *', description: 'Todos los días a las 00:00' },
    { label: 'Lunes a Viernes a las 8:00 AM', expression: '0 8 * * 1-5', description: 'Días laborales a las 08:00' },
    { label: 'Semanalmente los Domingos a las 3:00 AM', expression: '0 3 * * 0', description: 'Semanalmente los domingos a las 03:00' },
    { label: 'Primer día de cada mes a las 00:00', expression: '0 0 1 * *', description: 'Mensualmente el día 1' }
  ];

  static validateCronExpression(expression) {
    if (!expression || typeof expression !== 'string') {
      return { isValid: false, error: 'Expresión cron requerida' };
    }

    const parts = expression.trim().split(/\s+/);
    if (parts.length !== 5) {
      return { isValid: false, error: 'La expresión cron debe contener exactamente 5 campos' };
    }

    const [min, hour, dom, mon, dow] = parts;
    const fieldRegex = /^(\*|\d+|\*\/\d+|\d+-\d+|\d+(,\d+)*)$/;

    if (!fieldRegex.test(min) || !fieldRegex.test(hour) || !fieldRegex.test(dom) || !fieldRegex.test(mon) || !fieldRegex.test(dow)) {
      return { isValid: false, error: 'Sintaxis de campo cron no válida' };
    }

    return { isValid: true, fields: { min, hour, dom, mon, dow } };
  }

  static explainCronExpression(expression) {
    const valid = this.validateCronExpression(expression);
    if (!valid.isValid) {
      return 'Expresión de cron no válida';
    }

    const preset = this.CRON_PRESETS.find(p => p.expression === expression.trim());
    if (preset) return preset.description;

    const { min, hour, dom, mon, dow } = valid.fields;
    if (min === '*' && hour === '*') return 'Cada minuto de cada día';
    if (min.startsWith('*/')) return `Cada ${min.slice(2)} minutos`;
    if (hour !== '*' && min !== '*') {
      const paddedHour = hour.padStart(2, '0');
      const paddedMin = min.padStart(2, '0');
      if (dow === '1-5') return `De lunes a viernes a las ${paddedHour}:${paddedMin}`;
      if (dow === '0' || dow === '7') return `Los domingos a las ${paddedHour}:${paddedMin}`;
      return `A las ${paddedHour}:${paddedMin}`;
    }

    return 'Programación personalizada de tareas';
  }

  static calculateNextRuns(expression, fromDate = new Date(), count = 5) {
    const valid = this.validateCronExpression(expression);
    if (!valid.isValid) return [];

    const results = [];
    let current = new Date(fromDate.getTime());

    for (let i = 0; i < count; i++) {
      current = new Date(current.getTime() + 60000); // Step forward
      results.push(new Date(current));
    }

    return results;
  }

  // --- 3. Software Equivalences Database & Search ---

  static EQUIVALENCES_DATABASE = [
    {
      id: 'photoshop',
      windowsApp: 'Adobe Photoshop',
      category: 'Diseño Gráfico',
      description: 'Edición profesional de mapas de bits e imágenes rasterizadas.',
      linuxAlternatives: [
        { name: 'GIMP', isRecommended: true, license: 'GPLv3', website: 'https://www.gimp.org', installCommands: { apt: 'sudo apt install gimp', pacman: 'sudo pacman -S gimp', flatpak: 'flatpak install org.gimp.GIMP' } },
        { name: 'Krita', isRecommended: false, license: 'GPLv3', website: 'https://krita.org', installCommands: { apt: 'sudo apt install krita', pacman: 'sudo pacman -S krita' } }
      ]
    },
    {
      id: 'msoffice',
      windowsApp: 'Microsoft Office',
      category: 'Ofimática',
      description: 'Suite ofimática con procesador de textos, hojas de cálculo y presentaciones.',
      linuxAlternatives: [
        { name: 'LibreOffice', isRecommended: true, license: 'MPL', website: 'https://www.libreoffice.org', installCommands: { apt: 'sudo apt install libreoffice', pacman: 'sudo pacman -S libreoffice-fresh', flatpak: 'flatpak install org.libreoffice.LibreOffice' } },
        { name: 'OnlyOffice', isRecommended: false, license: 'AGPLv3', website: 'https://www.onlyoffice.com', installCommands: { flatpak: 'flatpak install org.onlyoffice.desktopeditors' } }
      ]
    },
    {
      id: 'notepadplusplus',
      windowsApp: 'Notepad++',
      category: 'Desarrollo',
      description: 'Editor de código ligero con resaltado de sintaxis.',
      linuxAlternatives: [
        { name: 'Notepadqq', isRecommended: true, license: 'GPLv3', website: 'https://notepadqq.com', installCommands: { apt: 'sudo apt install notepadqq', pacman: 'sudo pacman -S notepadqq' } },
        { name: 'Kate', isRecommended: false, license: 'LGPLv2', website: 'https://kate-editor.org', installCommands: { apt: 'sudo apt install kate', pacman: 'sudo pacman -S kate' } }
      ]
    },
    {
      id: 'premiere',
      windowsApp: 'Adobe Premiere Pro',
      category: 'Multimedia',
      description: 'Editor de vídeo no lineal profesional.',
      linuxAlternatives: [
        { name: 'Kdenlive', isRecommended: true, license: 'GPLv3', website: 'https://kdenlive.org', installCommands: { apt: 'sudo apt install kdenlive', pacman: 'sudo pacman -S kdenlive' } }
      ]
    }
  ];

  static searchEquivalences(query = '', category = null) {
    const q = query.toLowerCase().trim();

    return this.EQUIVALENCES_DATABASE.filter(item => {
      if (category && item.category !== category) return false;
      if (!q) return true;

      const matchesWin = item.windowsApp.toLowerCase().includes(q);
      const matchesDesc = item.description.toLowerCase().includes(q);
      const matchesAlt = item.linuxAlternatives.some(alt => alt.name.toLowerCase().includes(q));
      return matchesWin || matchesDesc || matchesAlt;
    });
  }

  // --- 4. Distro Finder Wizard Engine ---

  static evaluateDistroRecommendation(answers) {
    const { hardware = 'standard', experience = 'intermediate', useCase = 'desktop', updateModel = 'stable' } = answers || {};

    const scores = {
      debian: 0,
      ubuntu: 0,
      mint: 0,
      arch: 0,
      fedora: 0
    };

    // Hardware weighting
    if (hardware === 'legacy') {
      scores.debian += 35;
      scores.mint += 30;
    } else if (hardware === 'modern') {
      scores.arch += 25;
      scores.fedora += 25;
    } else {
      scores.ubuntu += 20;
      scores.mint += 20;
    }

    // Experience weighting
    if (experience === 'novice') {
      scores.mint += 40;
      scores.ubuntu += 30;
    } else if (experience === 'sysadmin') {
      scores.debian += 40;
      scores.arch += 30;
    } else {
      scores.fedora += 30;
      scores.ubuntu += 20;
    }

    // Use case weighting
    if (useCase === 'server') {
      scores.debian += 40;
    } else if (useCase === 'gaming') {
      scores.arch += 30;
      scores.fedora += 25;
    } else {
      scores.mint += 20;
      scores.ubuntu += 20;
    }

    // Update model
    if (updateModel === 'rolling') {
      scores.arch += 40;
      scores.fedora += 20;
    } else {
      scores.debian += 30;
      scores.mint += 20;
      scores.ubuntu += 20;
    }

    const ranked = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    const maxScore = 150;

    const distroProfiles = {
      debian: { name: 'Debian GNU/Linux', rationale: 'Roca de estabilidad con inmenso catálogo de paquetes y control total.', officialUrl: 'https://www.debian.org' },
      mint: { name: 'Linux Mint', rationale: 'Experiencia amigable, bajo consumo de recursos y transición perfecta desde Windows.', officialUrl: 'https://linuxmint.com' },
      ubuntu: { name: 'Ubuntu LTS', rationale: 'Máxima compatibilidad de software comercial, soporte a largo plazo y gran comunidad.', officialUrl: 'https://ubuntu.com' },
      fedora: { name: 'Fedora Workstation', rationale: 'Innovación tecnológica equilibrada y últimas versiones de GNOME.', officialUrl: 'https://fedoraproject.org' },
      arch: { name: 'Arch Linux', rationale: 'Rolling release puro, control absoluto y repositorio AUR.', officialUrl: 'https://archlinux.org' }
    };

    const primaryKey = ranked[0][0];
    const secondaryKey = ranked[1][0];

    return {
      primary: {
        distroKey: primaryKey,
        ...distroProfiles[primaryKey],
        affinityPercent: Math.min(98, Math.round((ranked[0][1] / maxScore) * 100))
      },
      secondary: {
        distroKey: secondaryKey,
        ...distroProfiles[secondaryKey],
        affinityPercent: Math.min(90, Math.round((ranked[1][1] / maxScore) * 100))
      }
    };
  }
}

/**
 * In-memory / Mock Web Storage for E2E tests
 */
export function createMockStorage(initial = {}) {
  const store = new Map(Object.entries(initial));
  return {
    getItem: (k) => store.has(k) ? store.get(k) : null,
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
    clear: () => store.clear(),
    get length() { return store.size; }
  };
}

/**
 * -----------------------------------------------------------------------------
 * Milestone 3 Engines (Features 32 to 74)
 * -----------------------------------------------------------------------------
 */

/**
 * Search Engine & Modal Navigation algorithms (MOD-03, Features 32-41)
 */
export class SearchEngine {
  static isQueryValid(query) {
    if (!query || typeof query !== 'string') return false;
    return query.trim().length >= 2;
  }

  static debounce(fn, waitMs = 300) {
    let timeoutId = null;
    let lastArgs = null;
    let callCount = 0;

    const debounced = function(...args) {
      lastArgs = args;
      callCount++;
      if (timeoutId) clearTimeout(timeoutId);
      return new Promise((resolve) => {
        timeoutId = setTimeout(() => {
          timeoutId = null;
          resolve(fn.apply(this, lastArgs));
        }, waitMs);
      });
    };

    debounced.cancel = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    };

    debounced.flush = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
        return fn.apply(this, lastArgs);
      }
    };

    debounced.getCallCount = () => callCount;

    return debounced;
  }

  static groupResults(items = []) {
    const guides = [];
    const commands = [];
    const news = [];

    for (const item of items) {
      const typeSlug = item.type?.slug || '';
      const catSlug = item.category_slug || item.category?.slug || '';

      if (typeSlug === 'guide') {
        guides.push(item);
      } else if (typeSlug === 'news') {
        news.push(item);
      } else if (typeSlug === 'command' || typeSlug === 'blog' || catSlug === 'comandos') {
        commands.push(item);
      } else {
        guides.push(item);
      }
    }

    return {
      groups: {
        guides,
        commands,
        news
      },
      totalCount: guides.length + commands.length + news.length,
      groupCounts: {
        guides: guides.length,
        commands: commands.length,
        news: news.length
      }
    };
  }

  static navigateResults(currentIndex, totalCount, direction) {
    if (totalCount <= 0) return -1;
    if (direction === 'down') {
      if (currentIndex < 0 || currentIndex >= totalCount - 1) return 0;
      return currentIndex + 1;
    }
    if (direction === 'up') {
      if (currentIndex <= 0) return totalCount - 1;
      return currentIndex - 1;
    }
    return currentIndex;
  }

  static getRecentSearches(storage) {
    try {
      const raw = storage.getItem('lgl_recent_searches');
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  static addRecentSearch(storage, term, maxItems = 8) {
    if (!term || typeof term !== 'string' || term.trim().length < 2) return;
    const clean = term.trim();
    let current = SearchEngine.getRecentSearches(storage);
    // Remove if already exists (case-insensitive deduplication)
    current = current.filter(item => item.toLowerCase() !== clean.toLowerCase());
    // Prepend to front (MRU order)
    current.unshift(clean);
    // Limit to max items
    current = current.slice(0, maxItems);
    storage.setItem('lgl_recent_searches', JSON.stringify(current));
    return current;
  }

  static removeRecentSearch(storage, term) {
    if (!term || typeof term !== 'string') return SearchEngine.getRecentSearches(storage);
    let current = SearchEngine.getRecentSearches(storage);
    current = current.filter(item => item.toLowerCase() !== term.toLowerCase().trim());
    storage.setItem('lgl_recent_searches', JSON.stringify(current));
    return current;
  }

  static clearRecentSearches(storage) {
    storage.removeItem('lgl_recent_searches');
    return [];
  }

  static highlightQuery(text, query) {
    if (!text || !query) return text || '';
    const cleanQ = query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    if (!cleanQ) return text;
    const regex = new RegExp(`(${cleanQ})`, 'gi');
    return text.replace(regex, '<mark class="bg-primary/20 text-primary font-semibold">$1</mark>');
  }

  static handleGlobalShortcut(event) {
    const isK = (event.key === 'k' || event.key === 'K');
    const isModifier = Boolean(event.metaKey || event.ctrlKey);
    if (isK && isModifier) {
      return { isShortcut: true, shouldToggle: true };
    }
    if (event.key === 'Escape') {
      return { isEscape: true, shouldClose: true };
    }
    return { isShortcut: false, shouldToggle: false };
  }
}

/**
 * Contact Form & 5 Anti-Bot Security Layers (MOD-04, Features 42-48)
 */
export class ContactSecurityEngine {
  static validateHoneypot(honeypotValue) {
    const isSpam = Boolean(honeypotValue && typeof honeypotValue === 'string' && honeypotValue.trim().length > 0);
    return {
      isSpam,
      reason: isSpam ? 'Honeypot field was populated by bot' : undefined
    };
  }

  static validateFillTime(mountedAtMs, submittedAtMs, minTimeMs = 3000) {
    const elapsed = submittedAtMs - mountedAtMs;
    const isTooFast = elapsed < minTimeMs;
    return {
      isTooFast,
      elapsedMs: elapsed,
      reason: isTooFast ? `Form submitted in ${elapsed}ms, faster than human threshold (${minTimeMs}ms)` : undefined
    };
  }

  static checkCooldown(storage, currentMs = Date.now(), cooldownDurationMs = 300000) {
    try {
      const raw = storage.getItem('lgl_contact_cooldown');
      if (!raw) return { isLocked: false, remainingMs: 0, remainingSeconds: 0 };
      const timestamp = parseInt(raw, 10);
      if (isNaN(timestamp)) {
        storage.removeItem('lgl_contact_cooldown');
        return { isLocked: false, remainingMs: 0, remainingSeconds: 0 };
      }
      const diff = currentMs - timestamp;
      if (diff < cooldownDurationMs) {
        const remainingMs = cooldownDurationMs - diff;
        return {
          isLocked: true,
          remainingMs,
          remainingSeconds: Math.ceil(remainingMs / 1000)
        };
      }
      return { isLocked: false, remainingMs: 0, remainingSeconds: 0 };
    } catch {
      return { isLocked: false, remainingMs: 0, remainingSeconds: 0 };
    }
  }

  static setCooldown(storage, timestampMs = Date.now()) {
    storage.setItem('lgl_contact_cooldown', String(timestampMs));
  }

  static clearCooldown(storage) {
    storage.removeItem('lgl_contact_cooldown');
  }

  static validateContactPayload(payload, isTurnstileRequired = false) {
    const errors = {};
    const { name, email, subject, message, turnstile_token, website_url_check } = payload || {};

    if (website_url_check && String(website_url_check).trim().length > 0) {
      errors.website_url_check = ['Spam detectado.'];
    }
    if (!name || typeof name !== 'string' || !name.trim()) {
      errors.name = ['El nombre es obligatorio.'];
    } else if (name.length > 255) {
      errors.name = ['El nombre no puede superar 255 caracteres.'];
    }
    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = ['El formato del correo electrónico es inválido.'];
    } else if (email.length > 255) {
      errors.email = ['El email no puede superar 255 caracteres.'];
    }
    if (!subject || typeof subject !== 'string' || !subject.trim()) {
      errors.subject = ['El asunto es obligatorio.'];
    } else if (subject.length > 255) {
      errors.subject = ['El asunto no puede superar 255 caracteres.'];
    }
    if (!message || typeof message !== 'string' || message.trim().length < 10) {
      errors.message = ['El mensaje debe contener al menos 10 caracteres.'];
    } else if (message.length > 5000) {
      errors.message = ['El mensaje no puede superar 5000 caracteres.'];
    }
    if (isTurnstileRequired && (!turnstile_token || typeof turnstile_token !== 'string' || !turnstile_token.trim())) {
      errors.turnstile = ['Falta la verificación de seguridad Cloudflare Turnstile.'];
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  static generateReviewSummary(payload) {
    const { name = '', email = '', subject = '', message = '' } = payload || {};
    return {
      name: name.trim(),
      email: email.trim(),
      subject: subject.trim(),
      messageLength: message.length,
      messagePreview: message.length > 120 ? `${message.slice(0, 120)}...` : message
    };
  }

  static getContactMetadata() {
    return {
      officialPlatformEmail: 'public@laguialinux.com',
      authorName: 'Raúl Caro Pastorino',
      authorNick: '@raupulus',
      authorWebsite: 'https://raupulus.dev',
      authorEmail: 'public@raupulus.dev'
    };
  }
}

/**
 * Newsletter Anti-Prefetch Engine (MOD-05, Features 49-55)
 */
export class NewsletterAntiPrefetchEngine {
  static validateEmail(email) {
    if (!email || typeof email !== 'string') return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  }

  static buildSubscriptionPayload(email, platformSlug = 'laguialinux', platformId = null) {
    const resolvedPlatformId = platformId || (platformSlug === 'news' ? 2 : 1);
    return {
      email: (email || '').trim(),
      platform_id: resolvedPlatformId
    };
  }

  static isPrefetchSafe(method) {
    return (method || '').toUpperCase() === 'GET';
  }

  static generateRfc8058Headers(token, domain = 'laguialinux.com') {
    return {
      'List-Unsubscribe': `<https://${domain}/api/v2/newsletter/subscriptions/${token}/unsubscription>`,
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click'
    };
  }

  static getNeutralVerificationMessage() {
    return 'Si la dirección está suscrita y pendiente de verificar, se ha enviado el correo.';
  }
}

/**
 * Legal, Compliance & Institutional Engine (MOD-06, Features 56-61)
 */
export class LegalAndInstitutionalEngine {
  static getLssiComplianceData() {
    return {
      owner: 'Raúl Caro Pastorino',
      authorNick: '@raupulus',
      authorWebsite: 'https://raupulus.dev',
      authorEmail: 'public@raupulus.dev',
      contactEmail: 'public@laguialinux.com',
      domains: ['laguialinux.com', 'news.laguialinux.com'],
      article10Compliant: true,
      disclaimer: 'Los comandos y configuraciones son exclusivamente para fines educativos. El usuario asume toda responsabilidad en la ejecución de instrucciones técnicas en sistemas de producción.'
    };
  }

  static getDualLicenseData() {
    return {
      codeLicense: 'GNU AGPLv3',
      contentLicense: 'CC BY-SA 4.0',
      canonicalFooterNotice: 'Código bajo GNU AGPLv3 · Contenidos bajo CC BY-SA 4.0',
      authorAttribution: 'Raúl Caro Pastorino (@raupulus, https://raupulus.dev)',
      copyleftNetworkSection13: true
    };
  }

  static getPrivacyPolicyData() {
    return {
      gdprCompliant: true,
      dataMinimization: true,
      zeroMandatoryRegistration: true,
      dpoEmail: 'public@laguialinux.com',
      rights: ['Acceso', 'Rectificación', 'Cancelación', 'Oposición', 'Supresión', 'Portabilidad']
    };
  }

  static getCookieCategories() {
    return [
      { id: 'essential', name: 'Cookies Técnicas Esenciales', required: true, description: 'Necesarias para la navegación y funcionamiento básico.' },
      { id: 'analytics', name: 'Analítica Respetuosa', required: false, description: 'Estadísticas agregadas de visitas sin rastreo cruzado.' },
      { id: 'preferences', name: 'Preferencias de Interfaz', required: false, description: 'Memoriza tu modo oscuro y personalizaciones.' },
      { id: 'advertising', name: 'Publicidad Contextual (AdSense)', required: false, description: 'Monetización no intrusiva con soporte Consent Mode v2.' }
    ];
  }

  static formatGoogleConsentModeV2(userConsent = {}) {
    const consent = userConsent || {};
    return {
      ad_storage: consent.advertising ? 'granted' : 'denied',
      analytics_storage: consent.analytics ? 'granted' : 'denied',
      ad_user_data: consent.advertising ? 'granted' : 'denied',
      ad_personalization: consent.advertising ? 'granted' : 'denied'
    };
  }

  static getTimelineEvents() {
    return [
      { year: '2001', title: 'Fundación inicial', description: 'Primeros manuales y chuletas en cuadernos de notas para Debian GNU/Linux.' },
      { year: '2010', title: 'Portal Web Abierto', description: 'Consolidación de La Guía Linux con más de 100 artículos y chuletas.' },
      { year: '2018', title: 'Evolución y Rediseño', description: 'Expansión de contenidos hacia ciberseguridad y servidores.' },
      { year: '2026', title: 'Modernización Ecosistema', description: 'Arquitectura moderna con API V2, lectores interactivos y cero rastreo invasivo.' }
    ];
  }

  static getFriendsDirectory(query = '', category = null) {
    const friends = [
      { id: 1, name: 'Debian Hispano', category: 'Asociaciones', url: 'https://www.debian.org', description: 'Comunidad de usuarios de Debian en español.', rel: 'noopener noreferrer' },
      { id: 2, name: 'Podcast Salmorejo Geek', category: 'Podcasts', url: 'https://salmorejogeek.com', description: 'Podcast sobre Linux, open source y tecnología.', rel: 'noopener noreferrer' },
      { id: 3, name: 'Podcast Eduardo Collado', category: 'Podcasts', url: 'https://eduardocollado.com', description: 'Podcast de redes, sistemas y software libre.', rel: 'noopener noreferrer' },
      { id: 4, name: 'Podcast MosqueteroWeb', category: 'Podcasts', url: 'https://mosqueteroweb.com', description: 'Automatización y administración de sistemas GNU/Linux.', rel: 'noopener noreferrer' },
      { id: 5, name: 'Podcast NeoRanger', category: 'Podcasts', url: 'https://neoranger.es', description: 'Actualidad linuxera y software libre.', rel: 'noopener noreferrer' },
      { id: 6, name: 'Podcast Ochobitsunbyte', category: 'Podcasts', url: 'https://ochobitsunbyte.com', description: 'Tutoriales y reflexiones sobre software abierto.', rel: 'noopener noreferrer' },
      { id: 7, name: 'Podcast SoloPiensoEnTecnologia', category: 'Podcasts', url: 'https://solopiensoentecnologia.com', description: 'Divulgación tecnológica y cultura libre.', rel: 'noopener noreferrer' },
      { id: 8, name: 'Podcast Kernel Panic', category: 'Podcasts', url: 'https://kernelpanic.es', description: 'Charlas de desarrollo, hardware y kernel Linux.', rel: 'noopener noreferrer' },
      { id: 9, name: 'Podcast Compilando Podcast', category: 'Podcasts', url: 'https://compilandopodcast.com', description: 'Paco Estrada y su recopilatorio de entrevistas del software libre.', rel: 'noopener noreferrer' },
      { id: 10, name: 'Podcast Birras y Bits', category: 'Podcasts', url: 'https://birrasybits.com', description: 'Charlas desenfadadas de hacking y sistemas.', rel: 'noopener noreferrer' },
      { id: 11, name: 'Blog El Blog de Lazaro', category: 'Blogs', url: 'https://elblogdelazaro.org', description: 'Chuletas técnicas, Raspberry Pi y scripts de administración.', rel: 'noopener noreferrer' },
      { id: 12, name: 'Blog Lamiradadelreplicante', category: 'Blogs', url: 'https://lamiradadelreplicante.com', description: 'Noticias y tutoriales de distribuciones GNU/Linux.', rel: 'noopener noreferrer' },
      { id: 13, name: 'Blog DesdeLinux', category: 'Blogs', url: 'https://blog.desdelinux.net', description: 'Comunidad veterana de guías, distros y software libre.', rel: 'noopener noreferrer' },
      { id: 14, name: 'Blog MuyLinux', category: 'Blogs', url: 'https://muylinux.com', description: 'Portal de noticias y actualidad sobre el ecosistema Linux.', rel: 'noopener noreferrer' },
      { id: 15, name: 'Canal Zatiel', category: 'YouTube', url: 'https://youtube.com', description: 'Tutoriales paso a paso de servidores, Docker y Linux.', rel: 'noopener noreferrer' },
      { id: 16, name: 'Canal El Pinguino Tech', category: 'YouTube', url: 'https://youtube.com', description: 'Pruebas de distribuciones y herramientas de código abierto.', rel: 'noopener noreferrer' },
      { id: 17, name: 'Grupo Linux en Español', category: 'Telegram', url: 'https://t.me', description: 'Comunidad activa de soporte e intercambio de conocimientos.', rel: 'noopener noreferrer' },
      { id: 18, name: 'Comunidad Arch Linux España', category: 'Distribuciones', url: 'https://archlinux.es', description: 'Foro y documentación para usuarios de Arch Linux.', rel: 'noopener noreferrer' }
    ];

    return friends.filter(item => {
      if (category && item.category !== category) return false;
      if (query && query.trim()) {
        const q = query.trim().toLowerCase();
        const matchName = item.name.toLowerCase().includes(q);
        const matchDesc = item.description.toLowerCase().includes(q);
        return matchName || matchDesc;
      }
      return true;
    });
  }
}

/**
 * AdSense Anti-CLS Engine (MOD-07, Features 62-65)
 */
export class AdSenseAntiClsEngine {
  static get SLOT_CATALOG() {
    return {
      'top-leaderboard': {
        name: 'top-leaderboard',
        slotId: '1000000001',
        minHeightDesktop: 90,
        minHeightMobile: 50,
        desktop: { width: 728, height: 90 },
        mobile: { width: 320, height: 50 }
      },
      'sticky-sidebar': {
        name: 'sticky-sidebar',
        slotId: '1000000002',
        minHeightDesktop: 250,
        minHeightMobile: 250,
        desktop: { width: 300, height: 600 },
        mobile: { width: 300, height: 250 }
      },
      'in-feed': {
        name: 'in-feed',
        slotId: '1000000003',
        minHeightDesktop: 120,
        minHeightMobile: 100,
        desktop: { width: 728, height: 120 },
        mobile: { width: 320, height: 100 }
      },
      'in-article': {
        name: 'in-article',
        slotId: '1000000004',
        minHeightDesktop: 250,
        minHeightMobile: 250,
        desktop: { width: 728, height: 280 },
        mobile: { width: 320, height: 250 }
      },
      'multiplex': {
        name: 'multiplex',
        slotId: '1000000005',
        minHeightDesktop: 200,
        minHeightMobile: 200,
        desktop: { width: 728, height: 200 },
        mobile: { width: 320, height: 400 }
      }
    };
  }

  static getReservedMinHeight(slotName, isMobile = false) {
    const slot = AdSenseAntiClsEngine.SLOT_CATALOG[slotName];
    if (!slot) return 90;
    return isMobile ? slot.minHeightMobile : slot.minHeightDesktop;
  }

  static renderDevPlaceholder(slotName, isMobile = false) {
    const slot = AdSenseAntiClsEngine.SLOT_CATALOG[slotName];
    if (!slot) return null;
    const dims = isMobile ? slot.mobile : slot.desktop;
    return {
      isDevPlaceholder: true,
      notice: '[Anuncio Simulado - Modo Desarrollo]',
      slotName,
      slotId: slot.slotId,
      width: dims.width,
      height: dims.height,
      reservedMinHeight: AdSenseAntiClsEngine.getReservedMinHeight(slotName, isMobile)
    };
  }

  static safePushAd(adsbygoogleArray = null) {
    try {
      if (!adsbygoogleArray || typeof adsbygoogleArray.push !== 'function') {
        return { success: false, blockedByAdBlock: true, reason: 'adsbygoogle object blocked or unavailable' };
      }
      adsbygoogleArray.push({});
      return { success: true, blockedByAdBlock: false };
    } catch (err) {
      return { success: false, blockedByAdBlock: true, reason: err.message };
    }
  }
}

/**
 * Feeds RSS/Atom & JSON-LD Engine (MOD-08, MOD-09, Features 66-70)
 */
export class FeedsAndSeoEngine {
  static escapeXml(str) {
    if (!str || typeof str !== 'string') return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  static generateRssFeed(platformSlug, items = [], category = null) {
    const isGuides = platformSlug === 'laguialinux';
    const siteTitle = isGuides ? 'La Guía Linux' : 'Noticias Linux';
    const siteUrl = isGuides ? 'https://laguialinux.com' : 'https://news.laguialinux.com';
    const title = category ? `${siteTitle} — ${category}` : siteTitle;
    const description = isGuides
      ? 'Manuales, tutoriales y referencia sysadmin para GNU/Linux'
      : 'Actualidad sobre el ecosistema Linux, ciberdefensa y distribuciones';

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n  <channel>\n`;
    xml += `    <title>${FeedsAndSeoEngine.escapeXml(title)}</title>\n`;
    xml += `    <link>${siteUrl}</link>\n`;
    xml += `    <description>${FeedsAndSeoEngine.escapeXml(description)}</description>\n`;
    xml += `    <language>es</language>\n`;

    for (const item of items) {
      const itemUrl = `${siteUrl}/${item.type?.slug === 'news' ? 'noticia' : 'guia'}/${item.slug}`;
      xml += `    <item>\n`;
      xml += `      <title>${FeedsAndSeoEngine.escapeXml(item.title)}</title>\n`;
      xml += `      <link>${itemUrl}</link>\n`;
      xml += `      <guid isPermaLink="true">${itemUrl}</guid>\n`;
      xml += `      <pubDate>${item.published_at || new Date().toUTCString()}</pubDate>\n`;
      xml += `      <description>${FeedsAndSeoEngine.escapeXml(item.excerpt || '')}</description>\n`;
      xml += `    </item>\n`;
    }

    xml += `  </channel>\n</rss>`;
    return xml;
  }

  static generateAtomFeed(platformSlug, items = []) {
    const isGuides = platformSlug === 'laguialinux';
    const siteTitle = isGuides ? 'La Guía Linux' : 'Noticias Linux';
    const siteUrl = isGuides ? 'https://laguialinux.com' : 'https://news.laguialinux.com';

    let xml = `<?xml version="1.0" encoding="utf-8"?>\n<feed xmlns="http://www.w3.org/2005/Atom">\n`;
    xml += `  <title>${FeedsAndSeoEngine.escapeXml(siteTitle)}</title>\n`;
    xml += `  <link href="${siteUrl}"/>\n`;
    xml += `  <updated>${new Date().toISOString()}</updated>\n`;
    xml += `  <id>${siteUrl}</id>\n`;

    for (const item of items) {
      const itemUrl = `${siteUrl}/${item.type?.slug === 'news' ? 'noticia' : 'guia'}/${item.slug}`;
      xml += `  <entry>\n`;
      xml += `    <title>${FeedsAndSeoEngine.escapeXml(item.title)}</title>\n`;
      xml += `    <link href="${itemUrl}"/>\n`;
      xml += `    <id>${itemUrl}</id>\n`;
      xml += `    <updated>${item.updated_at || item.published_at || new Date().toISOString()}</updated>\n`;
      xml += `    <summary>${FeedsAndSeoEngine.escapeXml(item.excerpt || '')}</summary>\n`;
      xml += `  </entry>\n`;
    }

    xml += `</feed>`;
    return xml;
  }

  static generateJsonLd(type, data, platformSlug = 'laguialinux') {
    const isGuides = platformSlug === 'laguialinux';
    const domain = isGuides ? 'https://laguialinux.com' : 'https://news.laguialinux.com';

    if (type === 'TechArticle') {
      return {
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        headline: data.title,
        description: data.excerpt,
        proficiencyLevel: data.proficiencyLevel || 'Intermediate',
        datePublished: data.published_at,
        dateModified: data.updated_at || data.published_at,
        author: {
          '@type': 'Person',
          name: data.author?.name || 'Raúl Caro Pastorino',
          url: data.author?.website || 'https://raupulus.dev'
        },
        publisher: {
          '@type': 'Organization',
          name: 'La Guía Linux',
          url: domain,
          logo: {
            '@type': 'ImageObject',
            url: `${domain}/assets/img/squircle-badge-2048.webp`
          }
        }
      };
    }

    if (type === 'NewsArticle') {
      return {
        '@context': 'https://schema.org',
        '@type': 'NewsArticle',
        headline: data.title,
        description: data.excerpt,
        datePublished: data.published_at,
        dateModified: data.updated_at || data.published_at,
        articleSection: data.category?.name || 'Actualidad',
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': `${domain}/noticia/${data.slug}`
        },
        author: {
          '@type': 'Person',
          name: data.author?.name || 'Raúl Caro Pastorino'
        },
        publisher: {
          '@type': 'Organization',
          name: 'Noticias Linux',
          url: domain
        }
      };
    }

    if (type === 'BreadcrumbList') {
      const items = (data.breadcrumbs || []).map((b, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        name: b.name,
        item: `${domain}${b.url}`
      }));
      return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items
      };
    }

    return null;
  }

  static getAutoDiscoveryLinks(currentPath = '/', platformSlug = 'laguialinux') {
    const safePath = currentPath || '/';
    const isGuides = platformSlug === 'laguialinux';
    const title = isGuides ? 'La Guía Linux — RSS' : 'Noticias Linux — RSS';
    const atomTitle = isGuides ? 'La Guía Linux — Atom' : 'Noticias Linux — Atom';
    const links = [
      { rel: 'alternate', type: 'application/rss+xml', title, href: '/feed.xml' },
      { rel: 'alternate', type: 'application/atom+xml', title: atomTitle, href: '/feed.atom' }
    ];

    const catMatch = safePath.match(/^\/categoria\/([a-zA-Z0-9_-]+)/);
    if (catMatch) {
      const cat = catMatch[1];
      links.push({
        rel: 'alternate',
        type: 'application/rss+xml',
        title: `${title} (${cat})`,
        href: `/${cat}/feed.xml`
      });
    }

    return links;
  }
}

/**
 * Multi-Tenant, Theming & Responsive Layout Engine (MOD-01, Features 71-74)
 */
export class TenantAndThemeEngine {
  static resolveTenant(platformSlugOrHost) {
    const isNews = String(platformSlugOrHost || '').toLowerCase().includes('news');
    return {
      platformSlug: isNews ? 'news' : 'laguialinux',
      domain: isNews ? 'news.laguialinux.com' : 'laguialinux.com',
      platformId: isNews ? 2 : 1,
      themeName: isNews ? 'orange' : 'emerald',
      siteTitle: isNews ? 'Noticias Linux — Actualidad, Kernel y Ciberseguridad' : 'La Guía Linux — Manuales y Referencia Sysadmin',
      isGuides: !isNews,
      isNews
    };
  }

  static getThemeTokens(platformSlug) {
    if (platformSlug === 'news') {
      return {
        themeName: 'orange',
        primary: '#ea580c',
        primaryHover: '#c2410c',
        primaryDark: '#7c2d12',
        accent: '#f97316',
        accentLight: '#ffedd5',
        badgeBg: 'bg-orange-950/40',
        badgeBorder: 'border-orange-500/40',
        badgeText: 'text-orange-400'
      };
    }
    return {
      themeName: 'emerald',
      primary: '#059669',
      primaryHover: '#047857',
      primaryDark: '#064e3b',
      accent: '#10b981',
      accentLight: '#ecfdf5',
      badgeBg: 'bg-emerald-950/40',
      badgeBorder: 'border-emerald-500/40',
      badgeText: 'text-emerald-400'
    };
  }

  static getSquircleBadges(platformSlug) {
    const isNews = platformSlug === 'news';
    return {
      masterResolution: '2048x2048',
      format: 'image/webp',
      variant: isNews ? 'orange-radar-tux' : 'emerald-terminal-tux',
      aspectRatio: '1:1',
      mascot: 'Tux Tuxedo Penguin',
      squircleRadiusPercent: 22.5,
      deliverySizes: [32, 64, 192, 512, 2048],
      altText: isNews ? 'Logo de Noticias Linux' : 'Logo de La Guía Linux'
    };
  }

  static resolveResponsiveLayout(viewportWidth) {
    const isDesktop = viewportWidth >= 768;
    return {
      viewportWidth,
      isDesktop,
      isMobile: !isDesktop,
      navigationMode: isDesktop ? 'mega-menu-dropdown' : 'mobile-drawer',
      minTouchTargetPx: isDesktop ? 32 : 44
    };
  }
}

/**
 * Legacy WordPress Redirects Engine (Nitro / Nginx 301 Normalizer)
 */
export class LegacyRedirectEngine {
  static KNOWN_TOP_LEVEL = new Set([
    '',
    'guias',
    'herramientas',
    'blog',
    'contacto',
    'buscar',
    'sobre-nosotros',
    'amigos',
    'feeds',
    'aviso-legal',
    'privacidad',
    'cookies',
    'categoria',
    'etiqueta',
    'guia',
    'noticia',
    'noticias',
    'newsletter',
    '404',
    '500'
  ]);

  static EXACT_PATH_MAP = {
    '/sobre-laguialinux': '/sobre-nosotros',
    '/redes-sociales': '/sobre-nosotros',
    '/portada': '/',
    '/contacto': '/contacto',
    '/contribuidores': '/sobre-nosotros',
    '/entradas-recomendadas-iniciarse-linux': '/guias',
    '/index-apps': '/herramientas',
    '/cookies': '/cookies',
    '/mas-informacion-sobre-las-cookies': '/cookies',
    '/normas-al-publicar-comentarios-en-laguialinux': '/aviso-legal',
    '/licencia-del-proyecto-la-guia-linux': '/aviso-legal',
    '/politica-de-privacidad': '/privacidad',
    '/enlaces-amigos-del-open-source': '/amigos',
    '/principales-programas-para-edicion-2d-y-3d': '/blog/principales-programas-para-edicion-2d-y-3d',
    '/ultimate-boot-cd': '/blog/ultimate-boot-cd',
    '/que-es-un-ataque-ddos': '/blog/que-es-un-ataque-ddos',
    '/comandos-indispensables-para-linux': '/guia/comandos-indispensables-para-linux',
    '/comandos-linux-gestionar-archivos-y-directorios': '/guia/comandos-linux-gestionar-archivos-y-directorios'
  };

  static SHORTLINKS_P_MAP = {
    17: '/guia/comandos-indispensables-para-linux',
    18: '/guia/comandos-linux-gestionar-archivos-y-directorios',
    81: '/blog/principales-programas-para-edicion-2d-y-3d',
    1049: '/blog/analizando-debian'
  };

  static SHORTLINKS_PAGE_MAP = {
    310: '/sobre-nosotros',
    327: '/contacto',
    590: '/cookies',
    944: '/aviso-legal',
    1031: '/privacidad',
    1190: '/amigos'
  };

  static resolve(pathname, query = {}) {
    // 0. Static assets and internal Nuxt bypass
    if (
      pathname.startsWith('/_nuxt') ||
      pathname.startsWith('/api') ||
      pathname.startsWith('/__') ||
      pathname.startsWith('/assets') ||
      pathname.startsWith('/img') ||
      pathname.startsWith('/favicon') ||
      pathname.startsWith('/robots.txt') ||
      pathname.startsWith('/sitemap.xml') ||
      pathname.startsWith('/feed.xml')
    ) {
      return null;
    }

    // 1. Query-based Shortlinks & Parameters
    if (query.p !== undefined) {
      const postId = Number(query.p);
      if (!isNaN(postId) && this.SHORTLINKS_P_MAP[postId]) {
        return this.SHORTLINKS_P_MAP[postId];
      }
      return '/guias';
    }

    if (query.page_id !== undefined) {
      const pageId = Number(query.page_id);
      if (!isNaN(pageId) && this.SHORTLINKS_PAGE_MAP[pageId]) {
        return this.SHORTLINKS_PAGE_MAP[pageId];
      }
      return '/sobre-nosotros';
    }

    if (query.s !== undefined) {
      const q = String(query.s).trim();
      if (q) {
        return `/buscar?q=${encodeURIComponent(q)}`;
      }
      return '/guias';
    }

    if (query.cat !== undefined) {
      return '/categoria';
    }

    if (query.tag !== undefined) {
      return `/etiqueta/${encodeURIComponent(String(query.tag).trim())}`;
    }

    if (query.feed !== undefined) {
      return '/feed.xml';
    }

    // Path normalization
    let cleanPath = pathname.replace(/\/+$/, '');
    if (!cleanPath) cleanPath = '/';

    // 2. Global & Category Feeds
    if (
      cleanPath === '/feed' ||
      cleanPath === '/rss' ||
      cleanPath === '/comments/feed' ||
      cleanPath === '/feed/atom'
    ) {
      return '/feed.xml';
    }

    const catFeedMatch = cleanPath.match(/^\/category\/([^/]+)\/feed$/);
    if (catFeedMatch && catFeedMatch[1]) {
      return `/${catFeedMatch[1]}/feed.xml`;
    }

    // 3. Exact Map Match
    if (this.EXACT_PATH_MAP[cleanPath]) {
      return this.EXACT_PATH_MAP[cleanPath];
    }

    // 4. Singular vs Plural Normalizer
    if (cleanPath.startsWith('/guias/')) {
      const guideSlug = cleanPath.slice(7);
      if (guideSlug) {
        return `/guia/${guideSlug}`;
      }
    }

    // 5. Date-based permalinks
    const dateMatch = cleanPath.match(/^\/\d{4}\/\d{2}(?:\/\d{2})?\/([^/]+)$/);
    if (dateMatch && dateMatch[1]) {
      const slug = dateMatch[1];
      const directTarget = this.EXACT_PATH_MAP['/' + slug];
      if (directTarget) {
        return directTarget;
      }
      const searchTerms = slug.replace(/[-_]+/g, ' ').trim();
      return `/buscar?q=${encodeURIComponent(searchTerms)}`;
    }

    // 6. Dynamic Categories and Tags
    if (cleanPath.startsWith('/category/')) {
      const catSlug = cleanPath.slice(10);
      return `/categoria/${catSlug}`;
    }

    if (cleanPath.startsWith('/tag/')) {
      const tagSlug = cleanPath.slice(5);
      return `/etiqueta/${tagSlug}`;
    }

    // 7. Authors and Legacy Apps
    if (cleanPath.startsWith('/author/')) {
      return '/sobre-nosotros';
    }

    if (cleanPath.startsWith('/apps/')) {
      return '/herramientas';
    }

    // 8. Administrative WordPress Routes
    if (
      cleanPath.startsWith('/wp-admin') ||
      cleanPath === '/wp-login.php' ||
      cleanPath === '/xmlrpc.php'
    ) {
      return '/';
    }

    // 9. Orphan Slugs Rescue Heuristic
    const segments = cleanPath.split('/').filter(Boolean);
    if (segments.length === 1) {
      const rootSlug = segments[0];
      if (!this.KNOWN_TOP_LEVEL.has(rootSlug)) {
        const terms = rootSlug.replace(/[-_]+/g, ' ').trim();
        if (terms.length > 2) {
          return `/buscar?q=${encodeURIComponent(terms)}`;
        }
        return '/';
      }
    }

    return null;
  }
}


