/**
 * server/utils/redirectsMap.ts
 * Diccionario O(1) de redirecciones 301 de rutas antiguas de WordPress
 * Ecosistema La Guía Linux
 * Licencia: GNU AGPLv3
 */

export const EXACT_PATH_MAP: Record<string, string> = {
  "/comandos-indispensables-para-linux": "/guia/comandos-indispensables-para-linux",
  "/comandos-linux-gestionar-archivos-y-directorios": "/guia/comandos-linux-gestionar-archivos-y-directorios",
  "/otros-comandos-utiles-linux": "/guia/otros-comandos-utiles-linux",
  "/comandos-linux-para-comprimir-archivos-y-directorios": "/guia/comandos-linux-para-comprimir-archivos-y-directorios",
  "/comandos-linux-para-buscar-archivos": "/guia/comandos-linux-para-buscar-archivos",
  "/comandos-linux-para-configurar-cortafuegos-con-iptables": "/guia/comandos-linux-para-configurar-cortafuegos-con-iptables",
  "/comandos-linux-para-copias-de-seguridad": "/guia/comandos-linux-para-copias-de-seguridad",
  "/comandos-linux-para-editar-y-ver-archivos-de-texto": "/guia/comandos-linux-para-editar-y-ver-archivos-de-texto",
  "/comandos-linux-para-formatear-una-particion-linux": "/guia/comandos-linux-para-formatear-una-particion-linux",
  "/comandos-linux-para-gestionar-cd-rom-y-dvd-rom": "/guia/comandos-linux-para-gestionar-cd-rom-y-dvd-rom",
  "/comandos-linux-para-gestionar-redes-lan-y-wifi": "/guia/comandos-linux-para-gestionar-redes-lan-y-wifi",
  "/comandos-linux-para-gestionar-paquetes-en-debian-ubuntu-linux-mint-y-derivados": "/guia/comandos-linux-para-gestionar-paquetes-en-debian-ubuntu-linux-mint-y-derivados",
  "/comandos-linux-informacion-del-sistema": "/guia/comandos-linux-informacion-del-sistema",
  "/comandos-linux-monitorizar-depurar-sistema-linux": "/guia/comandos-linux-monitorizar-depurar-sistema-linux",
  "/comandos-linux-montaje-sistemas-archivos-particiones": "/guia/comandos-linux-montaje-sistemas-archivos-particiones",
  "/comandos-linux-redes-windows-con-samba": "/guia/comandos-linux-redes-windows-con-samba",
  "/comandos-linux-seguridad-cifrado-archivos-servidores": "/guia/comandos-linux-seguridad-cifrado-archivos-servidores",
  "/comandos-linux-analisis-sistema-archivos-particiones": "/guia/comandos-linux-analisis-sistema-archivos-particiones",
  "/comandos-linux-para-el-espacio-en-disco": "/guia/comandos-linux-para-el-espacio-en-disco",
  "/comandos-linux-para-el-gestor-de-paquetes-yum": "/guia/comandos-linux-para-el-gestor-de-paquetes-yum",
  "/comandos-linux-para-la-gestion-de-paquetes-rpm-de-fedora-y-redhat": "/guia/comandos-linux-para-la-gestion-de-paquetes-rpm-de-fedora-y-redhat",
  "/comandos-linux-para-modificar-permisos-en-ficheros-y-directorios": "/guia/comandos-linux-para-modificar-permisos-en-ficheros-y-directorios",
  "/comandos-linux-para-apagar-reiniciar-o-cerrar-sesion": "/guia/comandos-linux-para-apagar-reiniciar-o-cerrar-sesion",
  "/comandos-para-cambiar-atributos-especiales-en-ficheros": "/guia/comandos-para-cambiar-atributos-especiales-en-ficheros",
  "/renombrar-interfaz-de-red-con-udev": "/guia/renombrar-interfaz-de-red-con-udev",
  "/cambiar-editor-de-texto-por-defecto-para-usarlo-por-la-terminal": "/guia/cambiar-editor-de-texto-por-defecto-para-usarlo-por-la-terminal",
  "/equivalencias-emuladores": "/guia/equivalencias-emuladores",
  "/equivalencias-software-grafico-multimedia-linux-windows": "/guia/equivalencias-software-grafico-multimedia-linux-windows",
  "/equivalencias-multimedia-video": "/guia/equivalencias-multimedia-video",
  "/equivalencia-audio-y-cd-multimedia": "/guia/equivalencia-audio-y-cd-multimedia",
  "/equivalencias-ofimatica-negocios": "/guia/equivalencias-ofimatica-negocios",
  "/equivalencias-otros-programas-linux-windows": "/guia/equivalencias-otros-programas-linux-windows",
  "/equivalencias-programacion-y-desarrollo": "/guia/equivalencias-programacion-y-desarrollo",
  "/equivalencias-windows-linux-para-redes-y-conectividad": "/guia/equivalencias-windows-linux-para-redes-y-conectividad",
  "/equivalencias-software-para-escritorio": "/guia/equivalencias-software-para-escritorio",
  "/equivalencias-software-para-servidores": "/guia/equivalencias-software-para-servidores",
  "/equivalencia-archivos-software": "/guia/equivalencia-archivos-software",
  "/swappiness-optimizar-uso-de-memoria-swap": "/guia/swappiness-optimizar-uso-de-memoria-swap",
  "/analizar-sistema-de-archivos-y-particion": "/guia/analizar-sistema-de-archivos-y-particion",
  "/debfoster-mostrar-dependencias-y-paquetes-obsoletos": "/guia/debfoster-mostrar-dependencias-y-paquetes-obsoletos",
  "/eliminar-kernels-antiguos-para-ahorrar-espacio": "/guia/eliminar-kernels-antiguos-para-ahorrar-espacio",
  "/limpiar-gestor-de-paquetes": "/guia/limpiar-gestor-de-paquetes",
  "/localepurge-limpiar-manuales-y-paginas-en-idiomas-que-no-necesitas": "/guia/localepurge-limpiar-manuales-y-paginas-en-idiomas-que-no-necesitas",
  "/principales-programas-para-edicion-2d-y-3d": "/blog/principales-programas-para-edicion-2d-y-3d",
  "/ultimate-boot-cd": "/blog/ultimate-boot-cd",
  "/instalar-aircrack-y-airoscript-codigo-fuente": "/guia/instalar-aircrack-y-airoscript-codigo-fuente",
  "/pyrit-borrar-entrada": "/guia/pyrit-descifrar-clave-wpa-con-gpu",
  "/que-es-un-ataque-ddos": "/blog/que-es-un-ataque-ddos",
  "/rarcrack-recupera-contrasenas-de-archivos-comprimidos": "/guia/rarcrack-recupera-contrasenas-de-archivos-comprimidos",
  "/aceleracion-en-ati-y-nvidia": "/guia/aceleracion-en-ati-y-nvidia",
  "/instalar-ubuntu": "/guia/instalar-ubuntu",
  "/bleachbit-limpieza-de-registros-cache-y-suciedad-del-sistema": "/guia/bleachbit-limpieza-de-registros-cache-y-suciedad-del-sistema",
  "/gtk-warning-cannot-open-display-0": "/guia/gtk-warning-cannot-open-display-0",
  "/gtkorphan-para-limpiar-paquetes-y-librerias-huerfanas-en-linux": "/guia/gtkorphan-para-limpiar-paquetes-y-librerias-huerfanas-en-linux",
  "/testdisk-recuperar-datos-de-particion-borrada-en-el-disco-duro-hdd": "/guia/testdisk-recuperar-datos-de-particion-borrada-en-el-disco-duro-hdd",
  "/badblocks-analizar-recuperar-y-reubicar-sectores-defectuosos": "/guia/badblocks-analizar-recuperar-y-reubicar-sectores-defectuosos",
  "/e2fsck-reparar-sistemas-de-archivos-ext-ext2-ext3-ext4": "/guia/e2fsck-reparar-sistemas-de-archivos-ext-ext2-ext3-ext4",
  "/crear-liveusb-en-linux-con-unetbootin": "/guia/crear-liveusb-en-linux-con-unetbootin",
  "/crear-live-usb-multisistema-con-multisystem-muchos-live-cd-en-el-mismo-pen-drive": "/guia/crear-live-usb-multisistema-con-multisystem-muchos-live-cd-en-el-mismo-pen-drive",
  "/programar-apagado-del-equipo-por-terminal": "/guia/programar-apagado-del-equipo-por-terminal",
  "/cron-configuracion-basica-para-programar-tareas-mediante-crontab": "/guia/cron-configuracion-basica-para-programar-tareas-mediante-crontab",
  "/script-crear-backup-del-sistema": "/guia/script-crear-backup-del-sistema",
  "/recuperar-sistema-linux-desde-un-backup": "/guia/recuperar-sistema-linux-desde-un-backup",
  "/cambiar-contrasena-de-usuario-y-root": "/guia/cambiar-contrasena-de-usuario-y-root",
  "/desactivar-inicio-automatico-del-entorno-grafico": "/guia/desactivar-inicio-automatico-del-entorno-grafico",
  "/nmap-funcionamiento-basico": "/guia/nmap-funcionamiento-basico",
  "/ssh-autenticacion-sin-clave": "/guia/ssh-autenticacion-sin-clave",
  "/sincronizacion-directorios-remotos-rsync": "/guia/sincronizacion-directorios-remotos-rsync",
  "/backups-tipos-de-copias-de-seguridad": "/guia/backups-tipos-de-copias-de-seguridad",
  "/formatear-nivel-medio-zero-filling": "/guia/formatear-nivel-medio-zero-filling",
  "/formas-de-formatear-un-disco-duro": "/guia/formas-de-formatear-un-disco-duro",
  "/formatear-bajo-nivel-en-linux": "/guia/formatear-bajo-nivel-en-linux",
  "/instalar-guest-additions-en-linux": "/guia/instalar-guest-additions-en-linux",
  "/proteger-por-contrasena-y-cifrar-pendrive-o-disco-duro": "/guia/proteger-por-contrasena-y-cifrar-pendrive-o-disco-duro",
  "/buscar-archivos-comando-find": "/guia/buscar-archivos-comando-find",
  "/ejecutar-comandos-como-otro-usuario": "/guia/ejecutar-comandos-como-otro-usuario",
  "/comandos-para-obtener-informacion-de-nuestro-sistema-linux-y-su-hardware": "/guia/comandos-para-obtener-informacion-de-nuestro-sistema-linux-y-su-hardware",
  "/tipos-de-programadores-hackers-y-delincuentes-que-interactuan-en-la-red": "/blog/tipos-de-programadores-hackers-y-delincuentes-que-interactuan-en-la-red",
  "/terminos-informaticos-mas-comunes": "/blog/terminos-informaticos-mas-comunes",
  "/optimizar-arranque-en-debian": "/guia/optimizar-arranque-en-debian",
  "/gestores-de-paquetes-en-debian-y-derivados-ubuntu-linux-mint": "/guia/gestores-de-paquetes-en-debian-y-derivados-ubuntu-linux-mint",
  "/las-extensiones-de-archivos-mas-comunes": "/guia/las-extensiones-de-archivos-mas-comunes",
  "/gestion-de-fecha-y-hora": "/guia/gestion-de-fecha-y-hora",
  "/raspberry-pi-control-de-gpio-mediante-interfaz-web": "/guia/raspberry-pi-control-de-gpio-mediante-interfaz-web",
  "/quitar-contrasena-windows-10-de-usuario-y-administrador": "/guia/quitar-contrasena-windows-10-de-usuario-y-administrador",
  "/instalar-arch-linux-cifrado": "/guia/instalar-arch-linux-cifrado",
  "/solucion-al-error-con-libreria-libudev-so-0": "/guia/solucion-al-error-con-libreria-libudev-so-0",
  "/script-para-combinar-diccionarios-en-bash": "/guia/script-para-combinar-diccionarios-en-bash",
  "/script-para-juntar-2-diccionarios-y-eliminar-entradas-repetidas-bash": "/guia/script-para-juntar-2-diccionarios-y-eliminar-entradas-repetidas-bash",
  "/script-para-generar-diccionario-numerico": "/guia/script-para-generar-diccionario-numerico",
  "/linux-y-gnu": "/blog/linux-y-gnu",
  "/boinc-compartir-hardware-proyectos-cientificos": "/blog/boinc-compartir-hardware-proyectos-cientificos",
  "/gestion-red-iproute2": "/guia/gestion-red-iproute2",
  "/crear-liveusb-en-linux-usb-booteable": "/guia/crear-liveusb-en-linux-usb-booteable",
  "/informacion-sistema-comando-uname": "/guia/informacion-sistema-comando-uname",
  "/comandos-linux-para-gestion-de-usuarios": "/guia/comandos-linux-para-gestion-de-usuarios",
  "/comandos-linux-para-gestion-de-grupos": "/guia/comandos-linux-para-gestion-de-grupos",
  "/error-al-iniciar-ninja-ide-en-debian-al-cargar-modulo-qtwebkit": "/guia/error-al-iniciar-ninja-ide-en-debian-al-cargar-modulo-qtwebkit",
  "/dia-del-software-libre": "/blog/dia-del-software-libre",
  "/vim-instrucciones-basicas": "/guia/vim-instrucciones-basicas",
  "/listado-podcasts-tecnologia-software-libre-gnu-linux": "/blog/listado-podcasts-tecnologia-software-libre-gnu-linux",
  "/analizando-debian": "/blog/analizando-debian",
  "/pyrit-descifrar-clave-wpa-con-gpu": "/guia/pyrit-descifrar-clave-wpa-con-gpu",
  "/instalar-pyrit-con-soporte-cuda-y-opencl": "/guia/instalar-pyrit-con-soporte-cuda-y-opencl",
  "/pyrit-analizando-y-capturando-handshakes": "/guia/pyrit-analizando-y-capturando-handshakes",
  "/detectar-dispositivos-conectados-en-la-red-e-intrusos-con-script": "/guia/detectar-dispositivos-conectados-en-la-red-e-intrusos-con-script",
  "/principios-del-software-libre": "/blog/principios-del-software-libre",
  "/debian-day-birtday-16-agosto": "/blog/debian-day-birtday-16-agosto",
  "/sobre-laguialinux": "/sobre-nosotros",
  "/redes-sociales": "/sobre-nosotros",
  "/portada": "/",
  "/contacto": "/contacto",
  "/contribuidores": "/sobre-nosotros",
  "/entradas-recomendadas-iniciarse-linux": "/guias",
  "/index-apps": "/herramientas",
  "/cookies": "/cookies",
  "/mas-informacion-sobre-las-cookies": "/cookies",
  "/normas-al-publicar-comentarios-en-laguialinux": "/aviso-legal",
  "/licencia-del-proyecto-la-guia-linux": "/aviso-legal",
  "/politica-de-privacidad": "/privacidad",
  "/enlaces-amigos-del-open-source": "/amigos",
  "/enlaces-amigos-open-source-blogs": "/amigos",
  "/enlaces-amigos-del-open-source-podcasts": "/amigos",
  "/enlaces-amigos-del-open-source-webs": "/amigos",
  "/enlaces-amigos-del-open-source-asociaciones": "/amigos",
  "/enlaces-amigos-del-open-source-canales-youtube": "/amigos",
  "/enlaces-amigos-del-open-source-canales-telegram": "/amigos",
  "/enlaces-amigos-del-open-source-repositorios": "/amigos",
  "/enlaces-amigos-del-open-source-distribuciones": "/amigos",
  "/category/redes": "/categoria/redes",
  "/category/redes/feed": "/feed.xml",
  "/category/comandos-gestion-archivos-directorios": "/categoria/comandos",
  "/category/comandos-gestion-archivos-directorios/feed": "/feed.xml",
  "/category/comandos-gestion-paquetes": "/categoria/administracion",
  "/category/comandos-gestion-paquetes/feed": "/feed.xml",
  "/category/comandos-seguridad": "/categoria/seguridad",
  "/category/comandos-seguridad/feed": "/feed.xml",
  "/category/sistema": "/categoria/administracion",
  "/category/sistema/feed": "/feed.xml",
  "/category/comandos-informacion-sistema": "/categoria/comandos",
  "/category/comandos-informacion-sistema/feed": "/feed.xml",
  "/category/comandos-gestion-usuarios-grupos": "/categoria/administracion",
  "/category/comandos-gestion-usuarios-grupos/feed": "/feed.xml",
  "/category/comandos": "/categoria/comandos",
  "/category/comandos/feed": "/feed.xml",
  "/category/linux": "/guias",
  "/category/linux/feed": "/feed.xml",
  "/category/comandos-para-monitorizar-partes-del-sistema": "/categoria/administracion",
  "/category/comandos-para-monitorizar-partes-del-sistema/feed": "/feed.xml",
  "/category/comandos-gestion-discos-duros-comandos": "/categoria/almacenamiento",
  "/category/comandos-gestion-discos-duros-comandos/feed": "/feed.xml",
  "/category/instalar-distribucion-linux": "/categoria/distribuciones",
  "/category/instalar-distribucion-linux/feed": "/feed.xml",
  "/category/sin-categoria": "/guias",
  "/category/sin-categoria/feed": "/feed.xml",
  "/category/solucion-a-errores": "/guias",
  "/category/solucion-a-errores/feed": "/feed.xml",
  "/category/hardware": "/categoria/almacenamiento",
  "/category/hardware/feed": "/feed.xml",
  "/category/comandos-administracion": "/categoria/administracion",
  "/category/comandos-administracion/feed": "/feed.xml",
  "/category/seguridad": "/categoria/seguridad",
  "/category/seguridad/feed": "/feed.xml",
  "/category/eventos-y-dias-especiales": "/blog",
  "/category/eventos-y-dias-especiales/feed": "/feed.xml",
  "/category/otros-comandos": "/categoria/comandos",
  "/category/otros-comandos/feed": "/feed.xml",
  "/category/informacion": "/categoria/comandos",
  "/category/informacion/feed": "/feed.xml",
  "/category/scripts": "/categoria/administracion",
  "/category/scripts/feed": "/feed.xml",
  "/category/optimizar-rendimiento-linux": "/categoria/optimizacion",
  "/category/optimizar-rendimiento-linux/feed": "/feed.xml",
  "/category/comandos-gestion-red": "/categoria/redes",
  "/category/comandos-gestion-red/feed": "/feed.xml",
  "/category/alternativas-de-programas": "/categoria/software",
  "/category/alternativas-de-programas/feed": "/feed.xml",
  "/category/maquinas-virtuales": "/categoria/software",
  "/category/maquinas-virtuales/feed": "/feed.xml",
  "/category/diseno-grafico": "/categoria/software",
  "/category/diseno-grafico/feed": "/feed.xml",
  "/category/juegos": "/categoria/software",
  "/category/juegos/feed": "/feed.xml",
  "/category/cursos": "/guias",
  "/category/cursos/feed": "/feed.xml",
  "/category/podcast": "/blog",
  "/category/podcast/feed": "/feed.xml",
  "/category/distribuciones-gnu-linux": "/categoria/distribuciones",
  "/category/distribuciones-gnu-linux/feed": "/feed.xml",
  "/category/debian-gnu-linux": "/categoria/distribuciones",
  "/category/debian-gnu-linux/feed": "/feed.xml",
  "/feed": "/feed.xml",
  "/feed/atom": "/feed.xml",
  "/?feed=rss": "/feed.xml",
  "/?feed=rss2": "/feed.xml",
  "/?feed=atom": "/feed.xml"
};

export const SHORTLINKS_P_MAP: Record<number, string> = {
  "17": "/guia/comandos-indispensables-para-linux",
  "18": "/guia/comandos-linux-gestionar-archivos-y-directorios",
  "19": "/guia/otros-comandos-utiles-linux",
  "20": "/guia/comandos-linux-para-comprimir-archivos-y-directorios",
  "21": "/guia/comandos-linux-para-buscar-archivos",
  "22": "/guia/comandos-linux-para-configurar-cortafuegos-con-iptables",
  "23": "/guia/comandos-linux-para-copias-de-seguridad",
  "24": "/guia/comandos-linux-para-editar-y-ver-archivos-de-texto",
  "25": "/guia/comandos-linux-para-formatear-una-particion-linux",
  "26": "/guia/comandos-linux-para-gestionar-cd-rom-y-dvd-rom",
  "27": "/guia/comandos-linux-para-gestionar-redes-lan-y-wifi",
  "28": "/guia/comandos-linux-para-gestionar-paquetes-en-debian-ubuntu-linux-mint-y-derivados",
  "30": "/guia/comandos-linux-informacion-del-sistema",
  "31": "/guia/comandos-linux-monitorizar-depurar-sistema-linux",
  "32": "/guia/comandos-linux-montaje-sistemas-archivos-particiones",
  "33": "/guia/comandos-linux-redes-windows-con-samba",
  "34": "/guia/comandos-linux-seguridad-cifrado-archivos-servidores",
  "35": "/guia/comandos-linux-analisis-sistema-archivos-particiones",
  "36": "/guia/comandos-linux-para-el-espacio-en-disco",
  "37": "/guia/comandos-linux-para-el-gestor-de-paquetes-yum",
  "38": "/guia/comandos-linux-para-la-gestion-de-paquetes-rpm-de-fedora-y-redhat",
  "39": "/guia/comandos-linux-para-modificar-permisos-en-ficheros-y-directorios",
  "40": "/guia/comandos-linux-para-apagar-reiniciar-o-cerrar-sesion",
  "41": "/guia/comandos-para-cambiar-atributos-especiales-en-ficheros",
  "42": "/guia/renombrar-interfaz-de-red-con-udev",
  "43": "/guia/cambiar-editor-de-texto-por-defecto-para-usarlo-por-la-terminal",
  "45": "/guia/equivalencias-emuladores",
  "46": "/guia/equivalencias-software-grafico-multimedia-linux-windows",
  "47": "/guia/equivalencias-multimedia-video",
  "48": "/guia/equivalencia-audio-y-cd-multimedia",
  "49": "/guia/equivalencias-ofimatica-negocios",
  "50": "/guia/equivalencias-otros-programas-linux-windows",
  "51": "/guia/equivalencias-programacion-y-desarrollo",
  "52": "/guia/equivalencias-windows-linux-para-redes-y-conectividad",
  "53": "/guia/equivalencias-software-para-escritorio",
  "54": "/guia/equivalencias-software-para-servidores",
  "55": "/guia/equivalencia-archivos-software",
  "56": "/guia/swappiness-optimizar-uso-de-memoria-swap",
  "58": "/guia/analizar-sistema-de-archivos-y-particion",
  "59": "/guia/debfoster-mostrar-dependencias-y-paquetes-obsoletos",
  "60": "/guia/eliminar-kernels-antiguos-para-ahorrar-espacio",
  "61": "/guia/limpiar-gestor-de-paquetes",
  "62": "/guia/localepurge-limpiar-manuales-y-paginas-en-idiomas-que-no-necesitas",
  "81": "/blog/principales-programas-para-edicion-2d-y-3d",
  "83": "/blog/ultimate-boot-cd",
  "85": "/guia/instalar-aircrack-y-airoscript-codigo-fuente",
  "87": "/guia/pyrit-descifrar-clave-wpa-con-gpu",
  "89": "/blog/que-es-un-ataque-ddos",
  "91": "/guia/rarcrack-recupera-contrasenas-de-archivos-comprimidos",
  "93": "/guia/aceleracion-en-ati-y-nvidia",
  "95": "/guia/instalar-ubuntu",
  "103": "/guia/bleachbit-limpieza-de-registros-cache-y-suciedad-del-sistema",
  "106": "/guia/gtk-warning-cannot-open-display-0",
  "108": "/guia/gtkorphan-para-limpiar-paquetes-y-librerias-huerfanas-en-linux",
  "110": "/guia/testdisk-recuperar-datos-de-particion-borrada-en-el-disco-duro-hdd",
  "112": "/guia/badblocks-analizar-recuperar-y-reubicar-sectores-defectuosos",
  "114": "/guia/e2fsck-reparar-sistemas-de-archivos-ext-ext2-ext3-ext4",
  "116": "/guia/crear-liveusb-en-linux-con-unetbootin",
  "118": "/guia/crear-live-usb-multisistema-con-multisystem-muchos-live-cd-en-el-mismo-pen-drive",
  "120": "/guia/programar-apagado-del-equipo-por-terminal",
  "122": "/guia/cron-configuracion-basica-para-programar-tareas-mediante-crontab",
  "124": "/guia/script-crear-backup-del-sistema",
  "126": "/guia/recuperar-sistema-linux-desde-un-backup",
  "128": "/guia/cambiar-contrasena-de-usuario-y-root",
  "130": "/guia/desactivar-inicio-automatico-del-entorno-grafico",
  "132": "/guia/nmap-funcionamiento-basico",
  "134": "/guia/ssh-autenticacion-sin-clave",
  "136": "/guia/sincronizacion-directorios-remotos-rsync",
  "138": "/guia/backups-tipos-de-copias-de-seguridad",
  "140": "/guia/formatear-nivel-medio-zero-filling",
  "142": "/guia/formas-de-formatear-un-disco-duro",
  "144": "/guia/formatear-bajo-nivel-en-linux",
  "146": "/guia/instalar-guest-additions-en-linux",
  "148": "/guia/proteger-por-contrasena-y-cifrar-pendrive-o-disco-duro",
  "153": "/guia/buscar-archivos-comando-find",
  "155": "/guia/ejecutar-comandos-como-otro-usuario",
  "157": "/guia/comandos-para-obtener-informacion-de-nuestro-sistema-linux-y-su-hardware",
  "159": "/blog/tipos-de-programadores-hackers-y-delincuentes-que-interactuan-en-la-red",
  "161": "/blog/terminos-informaticos-mas-comunes",
  "163": "/guia/optimizar-arranque-en-debian",
  "165": "/guia/gestores-de-paquetes-en-debian-y-derivados-ubuntu-linux-mint",
  "167": "/guia/las-extensiones-de-archivos-mas-comunes",
  "169": "/guia/gestion-de-fecha-y-hora",
  "170": "/guia/raspberry-pi-control-de-gpio-mediante-interfaz-web",
  "172": "/guia/quitar-contrasena-windows-10-de-usuario-y-administrador",
  "174": "/guia/instalar-arch-linux-cifrado",
  "176": "/guia/solucion-al-error-con-libreria-libudev-so-0",
  "178": "/guia/script-para-combinar-diccionarios-en-bash",
  "180": "/guia/script-para-juntar-2-diccionarios-y-eliminar-entradas-repetidas-bash",
  "182": "/guia/script-para-generar-diccionario-numerico",
  "184": "/blog/linux-y-gnu",
  "525": "/blog/boinc-compartir-hardware-proyectos-cientificos",
  "555": "/guia/gestion-red-iproute2",
  "669": "/guia/crear-liveusb-en-linux-usb-booteable",
  "709": "/guia/informacion-sistema-comando-uname",
  "852": "/guia/comandos-linux-para-gestion-de-usuarios",
  "856": "/guia/comandos-linux-para-gestion-de-grupos",
  "879": "/guia/error-al-iniciar-ninja-ide-en-debian-al-cargar-modulo-qtwebkit",
  "959": "/blog/dia-del-software-libre",
  "978": "/guia/vim-instrucciones-basicas",
  "991": "/blog/listado-podcasts-tecnologia-software-libre-gnu-linux",
  "1049": "/blog/analizando-debian",
  "1097": "/guia/pyrit-descifrar-clave-wpa-con-gpu",
  "1101": "/guia/instalar-pyrit-con-soporte-cuda-y-opencl",
  "1103": "/guia/pyrit-analizando-y-capturando-handshakes",
  "1309": "/guia/detectar-dispositivos-conectados-en-la-red-e-intrusos-con-script",
  "1317": "/blog/principios-del-software-libre",
  "1324": "/blog/debian-day-birtday-16-agosto"
};

export const SHORTLINKS_PAGE_MAP: Record<number, string> = {
  "310": "/sobre-nosotros",
  "316": "/sobre-nosotros",
  "324": "/",
  "327": "/contacto",
  "330": "/sobre-nosotros",
  "451": "/guias",
  "453": "/herramientas",
  "590": "/cookies",
  "798": "/cookies",
  "940": "/aviso-legal",
  "944": "/aviso-legal",
  "1031": "/privacidad",
  "1190": "/amigos",
  "1216": "/amigos",
  "1217": "/amigos",
  "1219": "/amigos",
  "1221": "/amigos",
  "1225": "/amigos",
  "1227": "/amigos",
  "1229": "/amigos",
  "1300": "/amigos"
};

export const KNOWN_TOP_LEVEL = new Set([
  "",
  "guias",
  "herramientas",
  "blog",
  "contacto",
  "buscar",
  "sobre-nosotros",
  "amigos",
  "feeds",
  "aviso-legal",
  "privacidad",
  "cookies",
  "categoria",
  "etiqueta",
  "guia",
  "noticia",
  "newsletter",
  "404",
  "500",
]);

export function resolveLegacyRedirect(
  pathname: string,
  query: Record<string, any>
): string | null {
  // Ignorar activos estáticos, API y rutas internas
  if (
    pathname.startsWith("/_nuxt") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/__") ||
    pathname.startsWith("/assets") ||
    pathname.startsWith("/img") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/robots.txt") ||
    pathname.startsWith("/sitemap.xml") ||
    pathname.startsWith("/feed.xml")
  ) {
    return null;
  }

  // 1. Redirecciones por Query Params de WordPress (?p=18, ?page_id=310, ?s=..., ?cat=...)
  if (query.p !== undefined) {
    const pId = Number(query.p);
    if (!isNaN(pId) && SHORTLINKS_P_MAP[pId]) {
      return SHORTLINKS_P_MAP[pId];
    }
    return "/";
  }

  if (query.page_id !== undefined) {
    const pageId = Number(query.page_id);
    if (!isNaN(pageId) && SHORTLINKS_PAGE_MAP[pageId]) {
      return SHORTLINKS_PAGE_MAP[pageId];
    }
    return "/sobre-nosotros";
  }

  if (query.s !== undefined) {
    const q = String(query.s).trim();
    if (q) {
      return `/buscar?q=${encodeURIComponent(q)}`;
    }
    return "/guias";
  }

  if (query.cat !== undefined) {
    return "/categoria";
  }

  if (query.tag !== undefined) {
    return `/etiqueta/${encodeURIComponent(String(query.tag).trim())}`;
  }

  if (query.feed !== undefined) {
    return "/feed.xml";
  }

  // Normalizar ruta sin barra final
  let cleanPath = pathname.replace(/\/+$/, "");
  if (!cleanPath) cleanPath = "/";

  // 2. Feeds globales y Feeds por categoría de WordPress
  if (
    cleanPath === "/feed" ||
    cleanPath === "/rss" ||
    cleanPath === "/comments/feed" ||
    cleanPath === "/feed/atom"
  ) {
    return "/feed.xml";
  }

  const catFeedMatch = cleanPath.match(/^\/category\/([^\/]+)\/feed$/);
  if (catFeedMatch && catFeedMatch[1]) {
    return `/${catFeedMatch[1]}/feed.xml`;
  }

  // 3. Coincidencia Exacta en el Diccionario
  if (EXACT_PATH_MAP[cleanPath]) {
    return EXACT_PATH_MAP[cleanPath];
  }

  // 4. Rutas singulares vs plurales (/guias/{slug} -> /guia/{slug})
  if (cleanPath.startsWith("/guias/")) {
    const guideSlug = cleanPath.slice(7);
    if (guideSlug) {
      return `/guia/${guideSlug}`;
    }
  }

  // 5. Patrones de Fecha Históricos de WordPress (/{year}/{month}/{day?}/{slug})
  const dateMatch = cleanPath.match(/^\/\d{4}\/\d{2}(?:\/\d{2})?\/([^\/]+)$/);
  if (dateMatch && dateMatch[1]) {
    const slug = dateMatch[1];
    const directTarget = EXACT_PATH_MAP["/" + slug];
    if (directTarget) {
      return directTarget;
    }
    // Si no está mapeado, búsqueda parametrizada de rescate
    const searchTerms = slug.replace(/[-_]+/g, " ").trim();
    return `/buscar?q=${encodeURIComponent(searchTerms)}`;
  }

  // 6. Categorías y Etiquetas dinámicas
  if (cleanPath.startsWith("/category/")) {
    const catSlug = cleanPath.slice(10);
    return `/categoria/${catSlug}`;
  }

  if (cleanPath.startsWith("/tag/")) {
    const tagSlug = cleanPath.slice(5);
    return `/etiqueta/${tagSlug}`;
  }

  // 7. Autores y Aplicaciones Antiguas
  if (cleanPath.startsWith("/author/")) {
    return "/sobre-nosotros";
  }

  if (cleanPath.startsWith("/apps/")) {
    return "/herramientas";
  }

  // 8. Rutas administrativas de WordPress
  if (
    cleanPath.startsWith("/wp-admin") ||
    cleanPath === "/wp-login.php" ||
    cleanPath === "/xmlrpc.php"
  ) {
    return "/";
  }

  // 9. Heurística de Rescate para Slugs Raíz Huérfanos
  // Si la ruta tiene solo un nivel (ej. /mi-articulo-antiguo) y no es una ruta del sistema Nuxt
  const segments = cleanPath.split("/").filter(Boolean);
  if (segments.length === 1) {
    const rootSlug = segments[0];
    if (!KNOWN_TOP_LEVEL.has(rootSlug)) {
      // Es un slug antiguo de WordPress no reconocido
      const terms = rootSlug.replace(/[-_]+/g, " ").trim();
      if (terms.length > 2) {
        return `/buscar?q=${encodeURIComponent(terms)}`;
      }
      return "/";
    }
  }

  return null;
}
