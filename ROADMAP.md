# 🗺️ Hoja de Ruta y Tracking: Study Spaces REST API

**Materia:** Programación 2 - UNSAM  
**Estado:** MVP 100% Completado + Notificaciones Observer + Moderación en Frontend + Desplegado en Render (PostgreSQL / Neon)  

---

## 📌 Progreso General

- [x] **Fase 1: Análisis y Definición del MVP** (6 requerimientos clave seleccionados: `RQ1` a `RQ6`).
- [x] **Fase 2: Modelado UML y Arquitectura** (Diagrama de clases Mermaid en `README.md`, herencia polimórfica y patrones de diseño).
- [x] **Fase 3: Repositorio e Inicialización Base** (Estructura modular en capas, `.gitignore`, `requirements.txt`).
- [x] **Fase 4: Entorno Virtual y Dependencias** (Creación de `venv` e instalación).
- [x] **Fase 5: Base de Datos y Modelos SQLAlchemy** (Configuración de sesión con soporte SQLite/PostgreSQL, ORM polimórfico con 4 jerarquías STI y 8 migraciones con Alembic).
- [x] **Fase 6: Autenticación JWT y Roles** (Bcrypt + Tokens Bearer + RBAC polimórfico con `StudentUser`, `BusinessUser`, `AdminUser`).
- [x] **Fase 7: Repositorios, Servicios y Endpoints REST** (8 routers: usuarios, espacios con filtros y estados aprobado/pendiente/rechazado, listas y favoritos, reseñas con votos/imágenes/promedios, publicaciones, reportes polimórficos y notificaciones).
- [ ] **Fase 8: Manejo Centralizado de Excepciones** (Pendiente opcional: custom exception handlers globales; actualmente se utiliza `HTTPException` en servicios y routers).
- [x] **Fase 9: Testing con Pytest** (201 tests pasando en `tests/`, superando ampliamente el mínimo de 10 requeridos).
- [x] **Fase 10: Docker & CI/CD** (`Dockerfile` con migraciones y creación automática de admin, `docker-compose.yml` y pipeline en GitHub Actions `.github/workflows/tests.yml`).
- [x] **Fase 11: Deploy en la Nube y Frontend** (API desplegada en Render con PostgreSQL en Neon `study-spaces-rest-api.onrender.com` integrada con cliente web de 10 pantallas en `frontend/`, incluyendo notificaciones, reportes y rechazo/re-revisión de espacios).

---

## 🔍 Detalle de Funcionalidades y Pendientes

### ✅ Implementado (MVP + Notificaciones + Moderación Completa)
* **Usuarios y Autenticación (`RQ1`):** Registro diferenciado (`/users/register/student`, `/users/register/business`), login JWT (`/users/login`), perfil (`/users/me`) y creación automatizada de administrador en arranque (`crear_admin.py --auto`).
* **Espacios de Estudio (`RQ2` y `RQ3`):** Creación y edición por negocios, listado de espacios propios (`/spaces/mine` con estado Aprobado, Pendiente o Rechazado), búsqueda y filtrado dinámico por nombre, WiFi, enchufes y nivel de ruido (`/spaces/`), y flujo de moderación por administradores (`/spaces/pending`, `/spaces/{id}/approve`, `/spaces/{id}/reject`; al editar un rechazado vuelve a Pendiente).
* **Reseñas y Votos (`RQ4`):** CRUD de reseñas por estudiantes (`/reviews`), soporte de hasta 5 imágenes, cálculo automático de promedio (`average_rating`) y cantidad de reseñas (`reviews_count`), y sistema de votación de utilidad (`/reviews/{id}/vote`).
* **Listas Personalizadas y Favoritos (`RQ5`):** Herencia `StudySpacesList` / `FavoritesList`, gestión de múltiples listas personalizadas (`/lists`) y acceso rápido a favoritos (`/favorites`), suscribiendo al estudiante como observador del espacio.
* **Moderación y Reportes Polimórficos (`RQ6`):** Jerarquía abstracta `Report` con *Template Method* (`ReviewReport`, `PostReport`, `StudySpaceReport`, `UserReport`) en `/reports`, permitiendo reportar reseñas, publicaciones, espacios y usuarios, y a los administradores listar, filtrar, resolver (`resolve`, ocultando contenido o desactivando usuario) o descartar (`dismiss`).
* **Publicaciones de Negocios (`Extra UML`):** CRUD de posts (`/posts`) para que los dueños de espacios publiquen novedades e imágenes en sus espacios.
* **Notificaciones In-App y Patrón Observer:** Jerarquía `Notification` / `InAppNotification`, `NotificationService` (Template Method con `ModerationNotificationService`, `PromotionNotificationService`, `ActivityNotificationService`, `SpaceApprovalNotificationService`), `StudySpace.observers` / `notify_observers()` y endpoints `/notifications/*` integrados en `frontend/js/notificaciones.js`.
* **Refactor de Capa en `study_spaces`:** Toda la lógica de negocio y consultas en `app/routers/study_spaces.py` delegadas a `study_space_service.py` y `study_space_repository.py`, usando `require_business` y `require_admin`.
* **Infraestructura y Frontend Web:** Soporte para PostgreSQL en Neon (producción) y SQLite en desarrollo/testing, contenedor Docker auto-inicializable y frontend de 10 pantallas en HTML/CSS/JS (`frontend/`).

### 🚧 Pendiente / Mejoras Opcionales (Post-MVP)
1. **Manejo Centralizado de Excepciones (Fase 8):** Incorporar excepciones de dominio personalizadas y *exception handlers* globales en `app/main.py` para desacoplar la capa de servicios de `fastapi.HTTPException`.
2. **Canales Adicionales y Monetización (UML Post-MVP):** Sumar canal `EmailNotification`, solicitudes de titularidad (`OwnershipRequest`) y campañas publicitarias con MercadoPago (`Campaign`, `AdvertisingPlan`, `Payment`).

---

*Este archivo se actualiza a medida que avanzamos en el desarrollo del proyecto.*
