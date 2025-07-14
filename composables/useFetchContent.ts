import { type ContentType } from '@/types/ContentType';
import { type ResponseContentType } from '@/types/ResponseContentType'
import { prepareContentData } from '@/utils/ContentUtils';
import type { ContentPageType } from '@/types/ContentPageType';

/**
 * Plataforma para la que se obtienen los contenidos.
 * He definido esta constante para facilitar el cambio de plataforma en caso de necesidad.
 */
const PLATFORM: string = 'laguialinux';

/**
 * Mecanismo de bloqueo que implementé para evitar múltiples peticiones simultáneas.
 * Esto mejora el rendimiento y evita condiciones de carrera en la aplicación.
 */
let fetchLocked = ref<boolean>(false);

/**
 * Tipo de contenido que se está consultando (news, blog, guides, etc.).
 * Por defecto he establecido 'news' como valor inicial.
 */
let contentType = ref<string>('news');

/**
 * Categoría para filtrar el contenido.
 * Se utiliza en las peticiones a la API para obtener contenido específico.
 */
let contentCategory = ref('');

/**
 * Subcategoría para filtrar el contenido.
 * Permite un filtrado más específico junto con la categoría principal.
 */
let contentSubcategory = ref('');

/**
 * Cantidad de elementos a mostrar por página.
 * He establecido 10 como valor predeterminado para equilibrar rendimiento y usabilidad.
 */
let quantityForPage = ref<number>(10);

/**
 * Página actual que se está visualizando.
 * Se utiliza para la paginación de resultados.
 */
const currentPage = ref<number>(1);

/**
 * Resultados de la consulta a la API.
 * Contiene tanto los datos de paginación como los contenidos obtenidos.
 */
const results = ref<ResponseContentType>({
    status: 'ok',
    pagination: undefined,
    search_params: undefined,
    contents: [],
});

/**
 * Contenido actual que se está visualizando en detalle.
 * Normalmente se utiliza cuando se accede a un contenido específico por su slug.
 */
const currentContent = ref<ContentType>();

/**
 * Páginas asociadas al contenido actual.
 * Algunos contenidos pueden tener múltiples páginas que se cargan dinámicamente.
 */
const currentContentPages = ref<ContentPageType[]>([]);

/**
 * Indica si está actualmente preparando el contenido o descargándolo.
 * Lo utilizo para mostrar estados de carga en la interfaz de usuario.
 */
const loadingContents = ref<boolean>(true);

/**
 * Función principal para obtener resultados de contenido desde la API.
 * 
 * He diseñado esta función como el núcleo del composable, encargándose de realizar
 * las peticiones a la API para obtener listas de contenido según los filtros establecidos.
 * Implementé un enfoque isomórfico que funciona tanto en el cliente como en el servidor.
 * 
 * @param {number} page - Número de página a consultar (por defecto: 1)
 * @param {boolean} reset - Si es true, limpia los resultados anteriores antes de añadir los nuevos (por defecto: false)
 * @returns {Promise<void>}
 */
const fetchResults = async (page: number = 1, reset: boolean = false) => {
    // Si ya hay una petición en curso, no hacemos nada para evitar condiciones de carrera
    if (fetchLocked.value) {
        return;
    }

    // Solo mostramos el indicador de carga cuando estamos en la primera página
    // para evitar interrupciones visuales durante la paginación
    if (page === 1) {
        loadingContents.value = true;
    }

    // Activamos el bloqueo para evitar peticiones simultáneas
    fetchLocked.value = true;

    // Actualizamos la página actual
    currentPage.value = page;

    // Detectamos si estamos en el cliente o en el servidor
    const isClient = process.client;

    let API_BASE: string = '';
    let dataResponse: ResponseContentType | null = null;

    // Preparamos los parámetros para la petición
    const paramsDict = {
        page: page.toString(),
        quantity: quantityForPage.value.toString(),
        category: contentCategory.value,
        subcategory: contentSubcategory.value,
    }

    // Lógica específica para el cliente (navegador)
    if (isClient) {
        const runtimeConfig = useRuntimeConfig();
        API_BASE = runtimeConfig.public.api.base;
        const API_URL = `${API_BASE}/platform/${PLATFORM}/content/type/${contentType.value}`;

        const params = new URLSearchParams(paramsDict);
        const response = await fetch(`${API_URL}?${params}`);

        if (response.ok) {
            dataResponse = await response.json();
        }
    } 
    // Lógica específica para el servidor (SSR)
    else {
        API_BASE = process.env.API_BASE_URL || '';
        const API_URL = `${API_BASE}/platform/${PLATFORM}/content/type/${contentType.value}`;

        // En el servidor usamos useAsyncData y $fetch para aprovechar el sistema de caché de Nuxt
        const { data, error } = await useAsyncData<ResponseContentType>('content',
            () => $fetch(`${API_BASE}/platform/${PLATFORM}/content/type/${contentType.value}`, {
                params: paramsDict,
            }), {
            watch: [currentPage]
        }
        );

        if (!error.value) {
            dataResponse = data.value;
        }
    }

    // Si se solicita reset, limpiamos los resultados anteriores
    if (reset) {
        results.value.contents = [];
    }

    // Procesamos la respuesta si existe
    if (dataResponse) {
        // Actualizamos la información de paginación y parámetros de búsqueda
        results.value.pagination = dataResponse.pagination ?? undefined;
        results.value.search_params = dataResponse.search_params ?? undefined;

        // Procesamos cada contenido y lo añadimos a los resultados
        dataResponse.contents?.forEach((content: ContentType) => {
            // Preparamos el contenido con URLs y datos adicionales
            content = prepareContentData(content, contentType.value);

            results.value.contents?.push(content);
        })

        // Actualizamos el estado de la respuesta
        results.value.status = dataResponse.status ?? 'ok';
    }

    // Liberamos el bloqueo y ocultamos el indicador de carga
    fetchLocked.value = false;
    loadingContents.value = false;
};

/**
 * Función principal del composable que inicializa y configura la obtención de contenido.
 * 
 * He diseñado esta función como punto de entrada principal para que los componentes
 * puedan consumir el composable. Configura los filtros necesarios y realiza una
 * petición inicial para obtener los datos.
 * 
 * @param {string} type - Tipo de contenido a obtener (news, blog, guides, etc.)
 * @param {string} category - Categoría para filtrar (opcional, por defecto: '')
 * @param {string} subcategory - Subcategoría para filtrar (opcional, por defecto: '')
 * @returns {Object} - Objeto con resultados, acciones y estado de carga
 */
export const useFetchContent = (type: string, category: string = '', subcategory: string = '') => {
    // Configuramos los filtros con los valores proporcionados
    contentType.value = type;
    contentCategory.value = category;
    contentSubcategory.value = subcategory;

    // Realizamos una petición inicial para obtener los datos
    // El segundo parámetro (true) indica que se deben resetear los resultados anteriores
    fetchResults(1, true);

    // Devolvemos un objeto con los resultados, acciones disponibles y estado de carga
    return { results, contentActions, loadingContents };
}

/**
 * Establece la categoría para filtrar el contenido.
 * 
 * Esta función la utilizo para actualizar el filtro de categoría y preparar
 * futuras peticiones con este filtro aplicado.
 * 
 * @param {string} cat - Slug de la categoría a establecer
 */
const setFilterCategory = (cat: string) => {
    // Asignamos el valor de la categoría, o cadena vacía si es null/undefined
    contentCategory.value = cat ?? '';
}

/**
 * Establece la subcategoría para filtrar el contenido.
 * 
 * Esta función la utilizo para actualizar el filtro de subcategoría y,
 * opcionalmente, también actualizar la categoría padre asociada.
 * 
 * @param {string} subcat - Slug de la subcategoría a establecer
 * @param {string|null} parent - Slug de la categoría padre (opcional)
 */
const setFilterSubCategory = (subcat: string, parent: string | null = null) => {
    // Asignamos el valor de la subcategoría, o cadena vacía si es null/undefined
    contentSubcategory.value = subcat ?? '';

    // Si se proporciona una categoría padre, también la establecemos
    if (parent) {
        setFilterCategory(parent);
    }
}

/**
 * Objeto que contiene las acciones disponibles para manipular el contenido.
 * 
 * He agrupado estas funciones en un objeto para facilitar su uso desde los componentes
 * y mantener una interfaz limpia y organizada.
 */
const contentActions = {
    setFilterCategory,
    setFilterSubCategory,
    fetchResults,
}


/**
 * Obtiene la siguiente página de resultados y la añade a la lista de contenido existente.
 * 
 * He implementado esta función para facilitar la implementación de características como
 * el "scroll infinito" o botones de "cargar más". Verifica si hay más páginas disponibles
 * y, en caso afirmativo, carga la siguiente página sin eliminar los resultados actuales.
 * 
 * @returns {void}
 */
export const useFetchContentNext = () => {
    // Verificamos si hay una página siguiente disponible según la información de paginación
    if (results.value.pagination?.hasNextPage) {
        // Obtenemos la página actual y la incrementamos para obtener la siguiente
        let currentPage = results.value.pagination.currentPage;

        // Llamamos a fetchResults con la siguiente página
        // El segundo parámetro (false) indica que NO se deben resetear los resultados anteriores
        fetchResults(++currentPage, false);
    }
}


/**
 * Obtiene un contenido específico mediante su slug.
 * 
 * He implementado esta función para obtener el detalle completo de un contenido específico
 * a partir de su slug. Incluye un manejo robusto de errores para diferentes escenarios
 * y la capacidad de cargar también las páginas asociadas al contenido.
 * 
 * @param {string} type - Tipo de contenido (news, blog, guides, etc.)
 * @param {string} slug - Identificador único del contenido
 * @param {boolean} withPages - Si es true, también carga las páginas asociadas al contenido (por defecto: false)
 * @returns {Promise<void>}
 */
async function fetchContentBySlug(type: string, slug: string, withPages = false) {
    // Activamos el bloqueo para evitar peticiones simultáneas
    fetchLocked.value = true;

    // Establecemos el tipo de contenido y activamos el indicador de carga
    contentType.value = type;
    loadingContents.value = true;

    // Limpiamos el array de páginas antes de obtener nuevo contenido
    // para evitar mezclar contenido de diferentes artículos
    currentContentPages.value = [];

    // Detectamos si estamos en el cliente o en el servidor
    const isClient = process.client;
    let API_BASE: string = '';

    // Obtenemos la URL base de la API según el entorno
    if (isClient) {
        const runtimeConfig = useRuntimeConfig();
        API_BASE = runtimeConfig.public.api.base;
    } else {
        API_BASE = process.env.API_BASE_URL || '';
    }

    // Construimos la URL para obtener el contenido específico
    const API_URL = `${API_BASE}/content/${contentType.value}/${slug}/get`;

    try {
        // Realizamos la petición a la API
        const response = await fetch(API_URL);

        if (response.ok) {
            // Si la respuesta es exitosa, procesamos el contenido
            const res = await response.json();

            if (res.content) {
                // Preparamos el contenido con URLs y datos adicionales
                currentContent.value = prepareContentData(res.content, type) ?? null;
            }

            // Si se solicita cargar las páginas y el contenido tiene páginas asociadas
            if (withPages && currentContent.value?.pages_slug) {
                const pages = currentContent.value?.pages_slug.length ?? 0

                // Cargamos cada página asociada al contenido
                for (let i = 1; i <= pages; i++) {
                    await fetchContentPageByOrder(currentContent.value.slug, i);
                }
            }
        } else {
            // Manejo de diferentes códigos de error HTTP
            if (response.status === 422) {
                // Error 422: Unprocessable Content - Slug inválido
                console.warn(`Invalid slug: ${slug} for content type: ${type}`);
                currentContent.value = {
                    title: 'Contenido no encontrado',
                    slug: slug,
                    excerpt: `No se ha encontrado el contenido solicitado. El identificador "${slug}" no es válido o no existe.`,
                    urlImageMedium: '',
                    urlImage: ''
                };
            } else if (response.status === 404) {
                // Error 404: Not Found - Contenido no encontrado
                console.warn(`Content not found: ${slug} for content type: ${type}`);
                currentContent.value = {
                    title: 'Contenido no encontrado',
                    slug: slug,
                    excerpt: 'No se ha encontrado el contenido solicitado. Es posible que haya sido eliminado o movido.',
                    urlImageMedium: '',
                    urlImage: ''
                };
            } else {
                // Otros errores HTTP
                console.error('FETCH useFetchPageBySlug ERROR', response);
                currentContent.value = {
                    title: 'Error al cargar el contenido',
                    slug: slug,
                    excerpt: 'Ha ocurrido un error al intentar cargar el contenido. Por favor, inténtalo de nuevo más tarde.',
                    urlImageMedium: '',
                    urlImage: ''
                };
            }
        }
    } catch (error) {
        // Capturamos excepciones (errores de red, etc.)
        console.error('FETCH useFetchPageBySlug EXCEPTION', error);
        currentContent.value = {
            title: 'Error de conexión',
            slug: slug,
            excerpt: 'Ha ocurrido un error al conectar con el servidor. Por favor, verifica tu conexión a internet e inténtalo de nuevo.',
            urlImageMedium: '',
            urlImage: ''
        };
    } finally {
        // Siempre liberamos el bloqueo y ocultamos el indicador de carga
        // independientemente del resultado de la operación
        fetchLocked.value = false;
        loadingContents.value = false;
    }
}

/**
 * Obtiene un contenido específico y sus páginas asociadas mediante su slug.
 * 
 * He creado esta función como punto de entrada público para que los componentes
 * puedan obtener fácilmente un contenido específico junto con todas sus páginas.
 * Es una versión simplificada que siempre carga las páginas asociadas.
 * 
 * @param {string} type - Tipo de contenido (news, blog, guides, etc.)
 * @param {string} slug - Identificador único del contenido
 * @returns {Object} - Objeto con el contenido actual, sus páginas y estado de carga
 */
export const useFetchContentBySlug = (type: string, slug: string) => {
    // Llamamos a la función interna con withPages=true para cargar también las páginas
    fetchContentBySlug(type, slug, true);

    // Devolvemos un objeto con el contenido, sus páginas y el estado de carga
    return { currentContent, currentContentPages, loadingContents };
}


/**
 * Obtiene una página específica de un contenido según su orden.
 * 
 * He implementado esta función para cargar páginas individuales de un contenido,
 * lo que permite mostrar contenidos extensos divididos en múltiples páginas.
 * Incluye manejo de errores y verificación de duplicados para evitar problemas.
 * 
 * @param {string} contentSlug - Slug del contenido al que pertenece la página
 * @param {number} order - Número de orden de la página a obtener
 * @returns {Promise<void>}
 */
async function fetchContentPageByOrder(contentSlug: string, order: number) {
    // Detectamos si estamos en el cliente o en el servidor
    const isClient = process.client;
    let API_BASE: string = '';

    // Obtenemos la URL base de la API según el entorno
    if (isClient) {
        const runtimeConfig = useRuntimeConfig();
        API_BASE = runtimeConfig.public.api.base;
    } else {
        API_BASE = process.env.API_BASE_URL || '';
    }

    // Construimos la URL para obtener la página específica
    const API_URL = `${API_BASE}/content/${contentSlug}/get/page/${order}`;

    try {
        // Realizamos la petición a la API
        const response = await fetch(API_URL);

        if (!response.ok) {
            // Manejo de diferentes códigos de error HTTP
            if (response.status === 404) {
                // Error 404: Página no encontrada
                console.warn(`Page not found: ${contentSlug} order ${order}`);
                return;
            } else if (response.status === 422) {
                // Error 422: Solicitud inválida
                console.warn(`Invalid page request: ${contentSlug} order ${order}`);
                return;
            } else {
                // Otros errores HTTP
                console.error(`Error fetching page: ${contentSlug} order ${order}`, response);
                return;
            }
        }

        // Procesamos la respuesta
        const data = await response.json();

        // Verificamos que la respuesta contenga datos de la página
        if (!data || !data.page) {
            console.warn(`No page data returned for: ${contentSlug} order ${order}`);
            return;
        }

        const page = data.page;

        // Si la página tiene contenido, lo procesamos
        if (page && page.content) {
            try {
                // El contenido viene como string JSON, lo convertimos a objeto
                page.content = JSON.parse(page.content);

                // Verificamos si la página ya existe en el array para evitar duplicados
                const existingPageIndex = currentContentPages.value?.findIndex(p => 
                    p.slug === page.slug || p.order === page.order
                );

                if (existingPageIndex !== undefined && existingPageIndex >= 0) {
                    // Si la página ya existe, la reemplazamos con la nueva versión
                    currentContentPages.value[existingPageIndex] = page;
                } else {
                    // Si la página no existe, la añadimos al array
                    currentContentPages.value?.push(page);
                }
            } catch (parseError) {
                // Capturamos errores al parsear el JSON
                console.error(`Error parsing page content: ${contentSlug} order ${order}`, parseError);
            }
        }
    } catch (error) {
        // Capturamos excepciones (errores de red, etc.)
        console.error(`FETCH fetchContentPageByOrder ERROR: ${contentSlug} order ${order}`, error);
    }
}

/**
 * Obtiene una página específica de un contenido y devuelve todas las páginas.
 * 
 * He creado esta función como punto de entrada público para que los componentes
 * puedan obtener fácilmente una página específica de un contenido. Es útil para
 * implementar navegación entre páginas de un mismo contenido.
 * 
 * @param {string} contentSlug - Slug del contenido al que pertenece la página
 * @param {number} order - Número de orden de la página a obtener
 * @returns {Ref<ContentPageType[]>} - Array reactivo con todas las páginas del contenido
 */
export const useFetchContentPageByOrder = (contentSlug: string, order: number) => {
    // Llamamos a la función interna para obtener la página específica
    fetchContentPageByOrder(contentSlug, order);

    // Devolvemos el array de páginas completo, que incluirá la página recién cargada
    return currentContentPages;
}
