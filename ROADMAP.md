# 🗺️ Hoja de Ruta y Tracking: Study Spaces REST API

**Materia:** Programación 2 - UNSAM  
**Estado:** MVP 100% Completado + Desplegado en Render (PostgreSQL)  

---

## 📌 Progreso General

- [x] **Fase 1: Análisis y Definición del MVP** (6 requerimientos clave seleccionados: `RQ1` a `RQ6`).
- [x] **Fase 2: Modelado UML y Arquitectura** (Diagrama de clases Mermaid en `README.md`, herencia polimórfica y patrones de diseño).
- [x] **Fase 3: Repositorio e Inicialización Base** (Estructura modular en capas, `.gitignore`, `requirements.txt`).
- [x] **Fase 4: Entorno Virtual y Dependencias** (Creación de `venv` e instalación).
- [x] **Fase 5: Base de Datos y Modelos SQLAlchemy** (Configuración de sesión con soporte SQLite/PostgreSQL, ORM polimórfico y 6 migraciones con Alembic).
- [x] **Fase 6: Autenticación JWT y Roles** (Bcrypt + Tokens Bearer + RBAC polimórfico con `StudentUser`, `BusinessUser`, `AdminUser`).
- [x] **Fase 7: Repositorios, Servicios y Endpoints REST** (Los 6 requerimientos del MVP + Posts: usuarios, espacios con filtros, listas y favoritos, reseñas con votos/imágenes/promedios, publicaciones y reportes polimórficos).
- [ ] **Fase 8: Manejo Centralizado de Excepciones** (Pendiente opcional: custom exception handlers globales; actualmente se utiliza `HTTPException` en servicios y routers).
- [x] **Fase 9: Testing con Pytest** (163 tests pasando en `tests/`, superando ampliamente el mínimo de 10 requeridos).
- [x] **Fase 10: Docker & CI/CD** (`Dockerfile` con migraciones y creación automática de admin, `docker-compose.yml` y pipeline en GitHub Actions `.github/workflows/tests.yml`).
- [x] **Fase 11: Deploy en la Nube y Frontend** (API desplegada en Render con PostgreSQL `study-spaces-rest-api.onrender.com` integrada con cliente web en `frontend/`; pendiente defensa oral).

---

## 🔍 Detalle de Funcionalidades y Pendientes

### ✅ Implementado (Todos los Requerimientos del MVP + Extras)
* **Usuarios y Autenticación (`RQ1`):** Registro diferenciado (`/users/register/student`, `/users/register/business`), login JWT (`/users/login`), perfil (`/users/me`) y creación automatizada de administrador en arranque (`crear_admin.py --auto`).
* **Espacios de Estudio (`RQ2` y `RQ3`):** Creación y edición por negocios, listado de espacios propios (`/spaces/mine`), búsqueda y filtrado dinámico por nombre, WiFi, enchufes y nivel de ruido (`/spaces/`), y flujo de moderación/aprobación por administradores (`/spaces/pending`, `/spaces/{id}/approve`).
* **Reseñas y Votos (`RQ4`):** CRUD de reseñas por estudiantes (`/reviews`), soporte de hasta 5 imágenes, cálculo automático de promedio (`average_rating`) y cantidad de reseñas (`reviews_count`), y sistema de votación de utilidad (`/reviews/{id}/vote`).
* **Listas Personalizadas y Favoritos (`RQ5`):** Herencia `StudySpacesList` / `FavoritesList`, gestión de múltiples listas personalizadas (`/lists`) y acceso rápido a favoritos (`/favorites`).
* **Moderación y Reportes Polimórficos (`RQ6`):** Jerarquía abstracta `Report` con *Template Method* (`ReviewReport`, `PostReport`, `StudySpaceReport`, `UserReport`) en `/reports`, permitiendo reportar reseñas, publicaciones, espacios y usuarios, y a los administradores listar, filtrar, resolver (`resolve`, ocultando contenido o desactivando usuario) o descartar (`dismiss`).
* **Publicaciones de Negocios (`Extra UML`):** CRUD de posts (`/posts`) para que los dueños de espacios publiquen novedades e imágenes en sus espacios.
* **Infraestructura y Frontend Web:** Soporte para PostgreSQL en producción y SQLite en desarrollo/testing, contenedor Docker auto-inicializable y frontend en HTML/CSS/JS (`frontend/`).

### 🚧 Pendiente / Mejoras Opcionales
1. **Refactor de Capa en `study_spaces`:** Mover las consultas SQLAlchemy directas de `app/routers/study_spaces.py` (`mis_espacios`, `espacios_pendientes`, `crear_espacio`, `editar_espacio`, `aprobar_espacio`) hacia `study_space_service.py` y `study_space_repository.py` para unificar el patrón en capas con el resto de los módulos, y usar `require_business` / `require_admin`.
2. **Manejo Centralizado de Excepciones (Fase 8):** Incorporar excepciones de dominio personalizadas y *exception handlers* globales en `app/main.py` para desacoplar la capa de servicios de `fastapi.HTTPException`.
3. **Integración de Reportes y Posts en el Frontend:** Conectar los nuevos endpoints `/reports` y `/posts` en las vistas de `frontend/` (actualmente `admin.html` gestiona espacios pendientes).
4. **Extensiones del Modelo UML (Post-MVP):** Sistema de notificaciones (`Observer` + `Factory Method`), solicitudes de titularidad (`OwnershipRequest`) y campañas publicitarias con MercadoPago (`Campaign`, `AdvertisingPlan`, `Payment`).

---

*Este archivo se actualiza a medida que avanzamos en el desarrollo del proyecto.*
