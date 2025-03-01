<template>
    <section>
        <div>
            <h2 class="text-center">
                Sobre La
                <span class="text-primary font-bold">
                    Guía
                </span>
                Linux
            </h2>
        </div>

        <div class="box-about-content">
            <p>
                La <strong>Guía Linux</strong> es una iniciativa dirigida a facilitar la adopción y el uso de sistemas operativos basados en Linux, proporcionando información accesible tanto para novatos como para usuarios más experimentados.
            </p>

            <p>
                El proyecto tiene como objetivo ser una fuente de aprendizaje y referencia en español, promoviendo la comprensión de los diferentes aspectos del sistema operativo Linux, desde la instalación hasta su uso avanzado en servidores, escritorios y dispositivos embebidos.
            </p>

            <p>
                Intentamos plantear contenido accesible y cuidadosamente organizado, con tutoriales, artículos y guías que cubren algunas de las principales distribuciones de Linux, herramientas esenciales, y técnicas de administración del sistema.
            </p>

            <p>
                Además, abordamos temas como la seguridad, la optimización del sistema y la personalización del entorno de trabajo, pretendiendo conseguir que exista una guía útil tanto para quienes comienzan con Linux como para aquellos que ya tienen experiencia en su uso.
            </p>
        </div>

        <div class="box-about-information">
            <p>
                Nunca tendremos como objetivo recopilar datos del usuario para ningún fin, todo el contenido estará siempre público y accesible para cualquiera que lo necesite.
            </p>

            <p>
                Implementamos sistemas de ingresos mínimos hasta cubrir costes del proyecto cada mes, principalmente mediante anuncios en lugares que no interfieran con el contenido principal y donaciones directas. De esta forma se pretende amortiguar el coste en mantenimiento (dominio, vps, proxy...) que sale de mi bolsillo.
            </p>

            <p>
                Puedes compartir, redistribuir y adaptar cualquiera de nuestro contenido mientras tenga una referencia al proyecto como autor del contenido orginial.
            </p>
        </div>

        <div class="box-about-skills box-about-card">
            <div class="about-skills about-card">
                <h3 class="about-card-title">Objetivos</h3>

                <div class="about-card-content">
                    <ul>
                        <li>Promover proyectos Open Source</li>
                        <li>Incluir vídeotutoriales para una consulta más dinámica</li>
                        <li>Automatizar tareas para enfocarnos más en crear contenido</li>
                        <li>Canal de difusión de proyectos similares</li>
                        <li>Herramientas para facilitar primeros pasos en Linux</li>
                        <li>Sistema interactivo de cursos y manuales</li>
                        <li>Herramientas de administración y personalización</li>
                        <li>Espacio comunitario</li>
                    </ul>
                </div>
            </div>

            <div class="about-passions about-card">
                <h3 class="about-card-title">Contenido</h3>

                <div class="about-card-content">
                    <ul>
                        <li>Noticias y Actualidad</li>
                        <li>Solución de problemas comunes</li>
                        <li>Administración de sistemas</li>
                        <li>Administración de servidores</li>
                        <li>Personalización y Optimización</li>
                        <li>Seguridad en Linux</li>
                        <li>Software y Herramientas útiles</li>
                        <li>Orientación para principiantes</li>
                        <li>Vídeotutoriales</li>
                    </ul>
                </div>
            </div>
        </div>

        <!-- Imagen con callout para ver la web del autor -->
        <div class="box-about-work-environment">
            <div class="box-about-work-environment-image">

            </div>

            <div class="box-about-work-environment-callout">
                <div>
                    <NuxtImg src="/logo_128x128.webp" alt="Logotipo de La Guía Linux"
                        title="Logotipo de La Guía Linux" />
                </div>

                <div>
                    <BtnGeneric to="https://raupulus.dev" text="Web del Autor" target="_blank"
                        title="Enlace a mi web personal" />
                </div>
            </div>
        </div>

        <div class="box-about-motivation box-about-section-card">
            <h3>Motivación</h3>

            <p>
                El movimiento que hizo nacer a La Guía Linux fue algo involuntario.
            </p>

            <p>
                Hace ya unos añitos
                <NuxtLink to="https://raupulus.dev" title="Portfolio de Raúl Caro Pastorino (@raupulus)">
                    Raúl Caro Pastorino (@raupulus)
                </NuxtLink>
                siendo un estudiante y comenzando en el mundo de GNU LINUX con un flamante Debian 3 necesitado de muchos módulos compilados externos sin saber ni si quiera que era eso (poca documentación accesible en los principios de internet en la zona), decidió crear una especie de wiki prehistórica donde anotar sus avances, descubrimientos, resumenes y en general todo lo que pudiera necesitar en el futuro para ahorrar tiempo posteriormente aprendiendo durante el proceso.
            </p>

            <p>
                Ha llovido ya bastante, embebido en la era digital de lleno y comenzando en ese momento a estudiar programación decidió compartir todos esos conocimientos al mundo.
            </p>

            <p>
                Este proyecto trata de reunir toda la información que vamos aprendiendo sobre software libre y tecnología para plasmarla en internet y que esta fuese accesible a todo el que pudiera necesitarla, en algunos casos como apuntes para nosotros mismos y bueno nunca se sabe a quien le será útil en qué momento.
            </p>
        </div>

        <div class="box-about-history box-about-section-card">
            <h3>Historia de La Guía Linux</h3>

            <p>
            El proyecto La Guía Linux realmente comienza antes de 2005 sin una fecha concreta que pueda recordar o deducir (tampoco es demasiado relevante).
            </p>

            <p>
            En sus orígenes pretendía ser un espacio de apuntes personales que acabó compartiéndose al resto del mundo.
            </p>

            <p>
            Poco a poco ha pasado por distintas etapas intentando mejorar y con ciertas colaboraciones esporádicas de personas afines a la causa y desinteresadamente (tanto que no desean revelar su identidad por motivos personales).
            </p>

            <div style="text-align: center">
                <NuxtImg src="/images/pages/about/laguialinux-2001.webp" alt="La Guía Linux original" style="max-width: 100%;"/>
            </div>

            <p>
            La evolución sería algo parecido a esto:
            </p>

            <ul>
                <li>Apuntes en cuadernos (teníamos que pasarnos fotocopias…)</li>
                <li>Apuntes pasados a Digital y quedando cada unas semanas para copiarnoslos entre amigos</li>
                <li>Una intranet privada con antenas de largo alcance y directorios compartidos</li>
                <li>Cuando llegó internet accesible y soluciones sencillas de publicación, blogger fue durante un tiempo nuestra plataforma de publicación de contenido más o menos por el año 2005</li>
                <li>Llegó el momento de los CMS y Drupal nos acompañó desde 2009 hasta 2015</li>
                <li>En Septiembre de 2015 Lanzamos un nuevo sitio web más claro y mejor organizado con wordpress</li>
                <li>Hoy día queda todo el desarrollo propio y open source en github/gitlab usando laravel, postgresql y nuxt 3</li>
            </ul>

            <p>
            Es realmente 2013 cuando comienza a promoverse el proyecto aunque el dominio y algunas redes ya habían sido planteadas y/o creadas mucho antes.
            </p>

            <p>
            El creador principal, administrador y desarrollador es
            <NuxtLink to="https://raupulus.dev" title="Portfolio de Raúl Caro Pastorino">
                Raúl Caro Pastorino (@raupulus)
            </NuxtLink>
            y es quien procura hasta el día de hoy se mantenga el sitio vivo, responde la mayoría de los mensajes en redes sociales, comentarios en la web y youtube.
            </p>

            <p>
            En colaboración con este proyecto tengo 2 amigos que colaboran esporádicamente en proporción al tiempo que la familia y el trabajo les va dejando hacerlo.
            </p>

            <p>
            Por petición de ellos quedarán como "anónimos" ya que han tomado esa decisión en pro de su privacidad.
            </p>

            <p>
            Cada uno tenemos una especialización distinta y usamos software diferente en la mayoría de los casos, por lo que puede decirse que entre todos conocemos bastante diversidad de software y soluciones.
            </p>
        </div>

        <div class="box-about-current-status box-about-section-card">
            <h3>Estado Actual</h3>

            <p>
            El proyecto sigue en constante desarrollo, aunque no es un proyecto que se mantenga en un solo año, sino que se va actualizando cada año, cada mes y si la vida lo posibilita cada semana.
            </p>

            <p>
            Sabemos y pedimos comprensión que toda esta plataforma no está perféctamente optimizada en cuanto a organización y diseño gráfico pero también es cierto que no paramos de dedicarle tiempo en su mejora y atención a nuestros seguidores que parecen ir en aumento, lo cual nos anima mucho a continuar con el proyecto y sobre todo lo hace cobrar sentido. Cada cambio en la plataforma, guía o vídeotutorial intentamos mejorar en lo que nos váis reportando como feedback.
            </p>
        </div>

        <div class="box-about-future box-about-section-card">
            <h3>Planes de Futuro</h3>

            <p>
            Tenemos planes de futuro, incluso demasiados planes para el futuro y planes inmediatos por lo que sin tentar a la cordura os mencionaré los primeros en los que nos vamos a centrar:
            </p>

            <ul>
                <li>1 de Enero de 2025 hemos relanzado el proyecto con nuevo logotipo y código 100% open source creado por nosotros</li>
                <li>Planteamos sistemas de automatizaciones para dedicarnos exclusivamente a crear contenido</li>
                <li>Reagrupar todo el sistema de búsquedas por categorías y subcategorías mejorando la precisión al buscar contenido</li>
                <li>Revisar contenido obsoleto</li>
                <li>Creación de nuevo contenido actualizado</li>
                <li>Rehacer vídeos que tienen demasiados años y no son tan precisos hoy día</li>
            </ul>
        </div>

        <div class="box-about-future box-about-section-card">
            <h3>¿Te gustaría colaborar?</h3>

            <p>
            Aunque no te quieras involucrar por tiempo o cualquier otro motivo, hay tres factores muy importantes, rápidos y sencillos con los que puedes colaborar ayudándonos mucho:
            </p>

            <ul>
                <li>Compartir</li>
                <li>Tus Comentarios</li>
                <li>Feedback</li>
            </ul>

            <p>
                Más adelante abriremos un repositorio comunitario dónde podrás colaborar en tus propias publicaciones si te apeteciera.
            </p>
        </div>

        <div style="margin-top: 1.3rem;"></div>
    </section>
</template>

<script lang="ts" setup>
const config = useRuntimeConfig();

const url = config.public.app.url;
const title = 'Sobre La Guía Linux | Proyecto para compartir software libre';
const description = 'Conoce a La Guía Linux, un proyecto que pretende compartir conocimiento sobre Software Libre y Tecnología ';
const keywords = 'la guía linux, lgl, laguialinux, guialinux, Raúl Caro Pastorino, software libre, open source, guías, tutoriales';

useHead({
    title: title,
    meta: [
        { name: 'description', content: description },
        { name: 'keywords', content: keywords },
        { name: 'robots', content: 'index, follow' },
        { property: 'og:type', content: 'website' },
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
        { property: 'og:url', content: url + '/about' },
        { property: 'og:image', content: url + '/social/about.webp' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: title },
        { name: 'twitter:description', content: description },
        { name: 'twitter:image', content: url + '/social/about.webp' }
    ]
});

</script>

<style scoped>
.box-about-content {
    height: 100%;
}

/* Información sobre este proyecto */
.box-about-information {
    margin-top: 1.3rem;
    padding: 0.5rem 2rem;
    background-color: rgba(50, 114, 184, 0.1);
    font-size: 1.3rem;
    border-radius: 5px;
    border: 10px solid var(--primary);
    box-shadow: 1px 1px 15px #000;
    box-sizing: border-box;
}

/* Tarjetas a 2 por fila */
.box-about-card {
    position: relative;
    display: grid;
    margin-top: 1.3rem;
    padding: 1.3rem;
    grid-template-columns: 1fr 1fr;
    align-items: center;
    border-radius: 0.6rem 0.6rem 0 0;
    gap: 1.3rem;
    box-sizing: border-box;
    font-size: 1.3rem;
}

.box-about-card>.about-card {
    height: 100%;
    background-color: #dedede;
    box-sizing: border-box;
    border-radius: 0.6rem 0.6rem 0 0;
}

.box-about-card>.about-card>.about-card-title {
    margin: 0;
    padding: 0.3rem 2rem;
    text-align: center;
    background-color: var(--primary);
    box-sizing: border-box;
    border-radius: 0.6rem 0.6rem 0 0;
    color: #fff;
    font-size: 1.9rem;
    font-weight: bold;
}

.box-about-card>.about-card>.about-card-content {
    position: relative;
    padding: 1.3rem;
    box-sizing: border-box;
    color: var(--blue)
}

.box-about-card>.about-card>.about-card-content li {
    list-style-type: none;
    /* Elimina el punto por defecto */
    position: relative;
    margin-bottom: 1rem;
    padding-left: 1.6rem;
    /* Ajusta según sea necesario */
}

.box-about-card>.about-card>.about-card-content li::before {
    content: url('/images/icons/success.svg');
    position: absolute;
    left: 0;
    top: 3px;
    width: 22px;
    height: 22px;
}

/* Imagen del entorno de trabajo con callout */
.box-about-work-environment {
    display: grid;
    position: relative;
    margin-top: 1.3rem;
    width: 100%;
    height: 400px;
    text-align: center;
    grid-template-columns: 1fr;
    align-items: center;
    background-image: url("/images/pages/about/author.webp");
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;
}

.box-about-work-environment>.box-about-work-environment-image {
    position: absolute;
    top: 0;
    left: 0;
}

.box-about-work-environment>.box-about-work-environment-callout {
    text-align: center;
}


/** Secciones con estilos de tarjeta **/
.box-about-section-card {
    margin-top: 1.3rem;
    background-color: var(--blue);
    border: 2px solid var(--white);
    border-radius: 0.5rem;
    overflow: hidden;
    box-sizing: border-box;
}

.box-about-section-card h3 {
    margin: 0;
    padding: 0.5rem;
    text-align: center;
    background-color: var(--white);
    color: var(--blue);
}

.box-about-section-card p {
    padding: 0.5rem;
}

.box-about-section-card a {
    color: var(--primary);
    font-weight: bold;
    font-style: italic;
}

@media (max-width: 920px) {
    .box-about-main {
        grid-template-columns: 1fr;
    }

    .box-about-card {
        grid-template-columns: 1fr;
        padding: 0.3rem;
    }

    .box-about-skills .about-card-content ul,
    .about-passions .about-card-content ul {
        padding-left: 1.3rem;
    }
}
</style>
