# Actualizaciones

<div text-align="left">

![VersionStatus](https://img.shields.io/badge/Version%20actual-ALPHA%200.0.1-c0392b.svg?style=flat-square)

</div>
<br>

## v0.0.1 (Diciembre 2017) :computer:
*En desarrollo*

<br>

## Conectividad :satellite:
Se ha implementado la posibilidad de conectarse con servidores remotos, es decir, ya no solamente se conectara de manera automatica al *localhost* o *127.0.0.1* de su servidor **MySql**, todo esto desde la pantalla de inicio se sesion, haciendo click en *Asistente de conexiones*.

Nota: *Actualmente se encuentra en pruebas la compatibilidad con otros motores de bases de datos.*

<br>

## Mejoras de aspecto :nail_care:
Se mejora notablemente la interfaz de usuario cambiando por completo el layout del sistema. Con el fin de hacerla mas familiar para el usuario, nos hemos basado en el diseño de aplicaciones web al 100% inspirandonos en sitios como *Facebook*, *Twitter* y *Youtube*, sitios que el usuario ya conoce y ya sabe como funciona su interfaz. Ahora se compone de 7 secciones

<br>
<div>
<img height="300" src="http://antrazstudios.com/billsdelivery/assetsdoc/billsdelivery_sections.png">
</div>
<br>

1. **Menu de navegacion(1):** Area en donde se encuentran las vistas principales del sistema que ahora son 6:
    * **Seccion: Inicio** -> Permite ver el feed del usuario, dentro de este feed se encuentran algunos accesos directos personalizados en la parte izquierda, mientras que en la parte central se muestra la antigua cartelera en forma de *Timeline* de **Facebook**, y en la parte derecha mostraremos las notificaciones de los diferentes movimientos de cada uno de lso documentos del usuario.
    * **Seccion: Terceros** -> Permite ver el menu de opciones de trabajo con los diferentes terceros(pacientes, E.R.P., I.P.S., operadores, entidades) dentro del sistema.
    * **Seccion: Facturacion** -> Permite añadir y/o modificar registros de facturacion existentes, obtenidos desde su sistema principal de gestion medica.
    * **Seccion: Radicacion** -> Funcionalidades del area de radicacion, tales como despacho de correspondencia, radicacion de cuentas medicas y/o actualizacion de estados o movimientos de cada documento generados en los demas modulos.
    * **Seccion: Cartera** -> Funcionalidades para los gestores de cartera. (Actualmente sin desarrollar)
    * **Seccion: Reporteador** -> Funcionalidades de generacion de reportes. (Actualmente sin desarrollar)

<br>

2.  **Menu de Opciones(2):** Area en donde se encuentran los botones de acciones generales, como *buscar*, *contenido de ayuda*, *configuracion del sistema* y *acceso al perfil del usuario*.

<br>

3.  **Area de vistas(3):** Espacio en donde se reenderizara la vista o menu seleccionado en las partes **1** y **2**.

<br>

4.  **Barra de Herramientas del sistema(4):** En este lugar, el sistema mostrara informacion sobre el sistema
    * Primero enseñara la version actual del sistema asi como su deploy tambien que puede ser *ALPHA*, *BETA*, *RELEASE CANDIDATE* y *STABLE*, para que el usuario este informado siempre de que version del sistema tiene funcionando.
    * Todos los procesos en segundo plano se mostraran ahi tambien, de esta manera el usuario sabe en todo momento que esta haciendo **Fact.Squid** con la informacion.

<br>

5.  **Barra de Herramientas Conexion(5):** Muestra a que servidor de informacion esta conectado actualmente el sistema, y siendo este con el que se encuentran intercambiando datos.

<br>

6.  **Barra de Herramientas Usuario(6):** Muestra el usuario que se encuentra actualmente logeado, bajo este usuario se grabaran todos las acciones dentro del sistema.

<br>

7.  **Barra de Herramientas Modo Desarrollador(7):** Muestra si el sistema se esta corriendo bajo el modo desarrollador, este tag solo es presente en caso que se este corriendo en modo desarrollador, bajo este modo se obtiene acceso a otras secciones exclusivas de este modo.

<br>
<br>

<div align="center" backgroudcolor="purple">

<img height="35" src="http://antrazstudios.com/assets/antraz_studios_logotipo_dark.png" alt="Fact.Squid-vue">

</div>

---  
