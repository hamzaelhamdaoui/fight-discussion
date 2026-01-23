# @fix_plan — FightReplay AI (Mobile-First Web) — Plan de ejecución estricto

## Principio rector
- MOBILE-FIRST real (375px como referencia). Desktop es secundario.
- Flujo E2E usable desde el día 1 (aunque sea con mocks).
- Prohibido “humo”: cada milestone debe dejar el repo ejecutable y verificable.
- No se marca DONE sin: build + lint + typecheck + e2e básicos pasando.

---

## M0 — Baseline del repo (fundación)
### Objetivo
Arrancar un proyecto consistente, con herramientas, convenciones y DX limpia.

### Tareas
- [ ] Crear Next.js (App Router) + TypeScript.
- [ ] Tailwind configurado.
- [ ] shadcn/ui instalado y funcionando (Button, Card, Dialog, Sheet, Tabs si aplica).
- [ ] Framer Motion instalado.
- [ ] TanStack Query instalado (o alternativa equivalente).
- [ ] Estructura de carpetas inicial (ver “Estructura” abajo).
- [ ] ESLint + Prettier + scripts.
- [ ] Configurar `.env.example` (sin secretos).
- [ ] Añadir `README.md` mínimo con setup local.
- [ ] Añadir placeholder pages: `/` (Landing), `/app` (Wizard), `/share/[token]`.

### DoD M0
- `npm run dev` levanta.
- `npm run lint` pasa.
- `npm run build` pasa.

---

## M1 — Diseño y Design System (mobile-first)
### Objetivo
Estética “increíble” desde pronto, evitando refactors masivos después.

### Tareas
- [ ] Definir tokens UI (Tailwind + CSS vars): spacing, radius, shadows, typography.
- [ ] Componentes base:
  - [ ] AppShell mobile (header minimal, safe-area, bottom spacing)
  - [ ] Stepper/Wizard layout
  - [ ] UploadGrid (cards + reorder UI)
  - [ ] TimelineMessage bubble (A/B)
  - [ ] HPBar
  - [ ] WinnerBanner
  - [ ] “AdSlot” placeholder (sin provider aún)
- [ ] Motion: transiciones suaves entre pasos (Framer Motion).
- [ ] Skeletons + loading states para todas las pantallas.

### DoD M1
- Landing + Wizard navegan fluidos en móvil.
- UI consistente y atractiva (sin saltos CLS).

---

## M2 — Supabase: Auth Google (rápido) + Guest mode + DB/Storage + RLS
### Objetivo
Arquitectura sólida con privacidad y opción “sin login”.

### Tareas
#### Auth
- [ ] Implementar botón **Continue with Google** (Supabase Auth).
- [ ] Implementar **Continue as Guest**:
  - [ ] Todo el flujo funciona sin login.
  - [ ] Drafts y resultados temporales se guardan localmente (IndexedDB o localStorage).
  - [ ] Si el usuario se loguea después, ofrecer “Guardar en mi cuenta” y migrar local->Supabase.

#### DB + Storage
- [ ] Esquema SQL + migraciones (documentado):
  - [ ] profiles (id, ads_consent, plan, created_at)
  - [ ] uploads (id, user_id nullable, created_at, storage_paths[], status)
  - [ ] conversations (id, user_id nullable, language, participants_json, timeline_json, confidence)
  - [ ] battles (id, conversation_id, attacks_json, winner, stats_json)
  - [ ] share_cards (id, battle_id, public_token, is_public)
- [ ] Buckets:
  - [ ] uploads (privado)
  - [ ] assets (privado)
  - [ ] share-cards (público por token o signed URL)

#### RLS (crítico)
- [ ] RLS estricta por `user_id` cuando exista.
- [ ] Guest:
  - [ ] No persistir en DB por defecto, solo local.
  - [ ] Alternativa: permitir persistencia anónima con expiración (si se decide), con token seguro.

### DoD M2
- Login Google en 1–2 taps.
- Guest funciona end-to-end sin errores.
- RLS no permite acceder a datos de otros.

---

## M3 — Upload de capturas (ordenables) + Validación + API upload
### Objetivo
Subida fluida, robusta y segura.

### Tareas
- [ ] UI UploadStep:
  - [ ] Drag&drop + file picker
  - [ ] Preview grid
  - [ ] Reordenar manual (drag)
  - [ ] Eliminar/añadir
  - [ ] Validaciones:
    - [ ] tipos MIME permitidos
    - [ ] límite tamaño por imagen
    - [ ] límite total de imágenes
- [ ] API `POST /api/upload`:
  - [ ] valida MIME y tamaño
  - [ ] sube a Supabase Storage si user logueado
  - [ ] si guest, guarda temporal local (sin subir) o sube a storage anónimo *solo si está permitido* y documentado
- [ ] Rate limit básico server-side (por IP / sesión).

### DoD M3
- Upload y reorden funcionan en móvil sin glitches.
- Errores bien manejados (toasts + recovery).

---

## M4 — Pipeline IA: extracción (Gemini multimodal) + reconstrucción + contrato JSON
### Objetivo
Convertir capturas desordenadas en conversación ordenada con trazabilidad.

### Tareas
- [ ] Definir contratos Zod (estrictos):
  - [ ] `ExtractedMessage`
  - [ ] `ExtractedCapture`
  - [ ] `ReconstructedConversation`
- [ ] API:
  - [ ] `POST /api/analyze` (por captura): Gemini multimodal -> mensajes detectados
  - [ ] `POST /api/reconstruct` (global): Gemini ordena timeline completo
- [ ] Estrategia orden:
  - [ ] si timestamps suficientes -> ordenar determinístico
  - [ ] si no -> Gemini produce `confidence`, `explanation_short`, `gaps[]`
- [ ] Guardar resultados:
  - [ ] logueado -> DB
  - [ ] guest -> local
- [ ] Redacción (privacy):
  - [ ] opción “modo privado”: no persistir texto, solo stats (si aplica)
  - [ ] redacción básica: emails/teléfonos antes de logs (no antes de IA).

### DoD M4
- Con 3–8 capturas desordenadas, produce timeline usable y editable.
- Siempre devuelve JSON válido (Zod) o error recuperable.

---

## M5 — ConversationReviewStep (edición + warnings) + CTA
### Objetivo
Permitir revisar y corregir antes del “combate”.

### Tareas
- [ ] Timeline UI:
  - [ ] bubbles A/B
  - [ ] editar speaker (toggle)
  - [ ] editar texto (si se permite)
  - [ ] insertar/borrar mensaje (opcional)
- [ ] Mostrar `confidence` + warnings + `gaps`.
- [ ] Botón “Iniciar combate”.
- [ ] Ad placement #1 (ConversationReviewStep al final del timeline) condicionado a consentimiento.

### DoD M5
- El usuario entiende y confía en lo reconstruido.
- Puede corregir lo mínimo para que el combate tenga sentido.

---

## M6 — Motor de combate (ataques + HP + animaciones)
### Objetivo
Replay espectacular, fluido y determinista.

### Tareas
- [ ] API `POST /api/battle`:
  - [ ] analiza conversación y produce `attacks[]` con daño, tipo, target, rationale
  - [ ] produce `winner` + `stats`
- [ ] BattleStep UI:
  - [ ] 2 personajes (izq/der)
  - [ ] HP bars
  - [ ] play/pause/skip + scrub (si da tiempo)
  - [ ] animaciones: hits, shake, floating text, combos
  - [ ] performance: requestAnimationFrame / no jank
- [ ] Guardado:
  - [ ] logueado -> DB
  - [ ] guest -> local

### DoD M6
- Replay fluido en móvil (sin tirones).
- HP se reduce en sincronía con ataques.
- Winner consistente.

---

## M7 — Nano Banana Pro provider (assets) + fallback bonito
### Objetivo
Assets generados o placeholders “production-grade”, con caching.

### Tareas
- [ ] Interfaz provider:
  - [ ] `generateCharacterSet`
  - [ ] `generateUIStickers`
- [ ] Modo REAL (REST por env): `NANO_BANANA_API_URL` + `KEY`
- [ ] Modo FALLBACK:
  - [ ] sprites/ilustraciones locales de buena calidad
  - [ ] consistencia estética (mismo estilo)
- [ ] Cache en Supabase Storage:
  - [ ] key basada en seed+stylePrompt
  - [ ] evitar regenerar
- [ ] Documentación exacta para conectar endpoint real.

### DoD M7
- App se ve “increíble” aunque no haya endpoint real.
- Provider no bloquea UX.

---

## M8 — ResultsStep shareable (descarga PNG + share link público)
### Objetivo
Pantalla final viral, lista para screenshot y export.

### Tareas
- [ ] Layout results:
  - [ ] Winner banner
  - [ ] “Top hits” (frases clave)
  - [ ] análisis detallado seccionado
  - [ ] recomendaciones prácticas + disclaimers
- [ ] Export PNG:
  - [ ] `html-to-image` o equivalente
  - [ ] fuentes e imágenes embebidas correctamente
  - [ ] tamaño optimizado para redes
- [ ] Share:
  - [ ] `share_cards` con `public_token`
  - [ ] ruta `/share/[token]`
  - [ ] política: no revelar datos sensibles si “modo privado”
- [ ] Ads placements rentables:
  - [ ] ResultsStep Ad#1 bajo Winner
  - [ ] Ad#2 mid-analysis
  - [ ] Ad#3 final pre-export/share
  - [ ] Share page: 1 slot final

### DoD M8
- Export PNG funciona siempre.
- Share link muestra una versión correcta y “bonita”.

---

## M9 — Ads: Consent CMP + AdProvider (AdSense-first)
### Objetivo
Monetización lista, cumpliendo políticas y maximizando RPM sin romper UX.

### Tareas
- [ ] CMP:
  - [ ] banner aceptar/rechazar
  - [ ] persistencia local + DB si logueado
  - [ ] no cargar scripts antes de aceptar
- [ ] Provider Ads:
  - [ ] `AdsenseProvider` (inserta script + define slots)
  - [ ] `MockProvider` (dev)
- [ ] `AdSlot`:
  - [ ] responsive
  - [ ] lazy load (IntersectionObserver)
  - [ ] fallback si no hay consentimiento
- [ ] Etiquetado “Advertisements”.
- [ ] Documentar configuración AdSense:
  - [ ] client id
  - [ ] ad units / auto ads (si se usa) y justificación

### DoD M9
- Sin consentimiento: 0 scripts ads.
- Con consentimiento: slots renderizan y no rompen layout.

---

## M10 — Calidad: Tests, Observabilidad, Seguridad, Deploy
### Objetivo
Producción real.

### Tareas
- [ ] Unit tests:
  - [ ] Zod schema validation
  - [ ] ordering logic determinista
- [ ] E2E Playwright (mínimo):
  - [ ] landing -> wizard -> upload mocks -> reconstruct -> battle -> results -> export PNG
- [ ] Logging seguro:
  - [ ] sin texto sensible en logs
  - [ ] trazas por request id
- [ ] Seguridad:
  - [ ] rate limiting endpoints IA
  - [ ] validar input y payload sizes
  - [ ] sanitizar
- [ ] Performance:
  - [ ] optimización de imágenes (Next Image si aplica)
  - [ ] evitar re-renders masivos
- [ ] Deploy:
  - [ ] README Vercel
  - [ ] checklist env vars

### DoD M10
- `npm run build` ok
- `npm run lint` ok
- `npm run typecheck` ok (si existe)
- `npx playwright test` ok
- README completo

---

## Estructura de carpetas sugerida
- `app/` (Next App Router)
- `components/` (UI reusable)
- `lib/`
  - `supabase/` (client/server helpers)
  - `ai/` (Gemini client, prompts, validators)
  - `ads/` (CMP, providers, AdSlot)
  - `battle/` (engine + types)
  - `utils/` (sanitize, rate limit, storage)
- `providers/`
  - `nanobanana/`
- `tests/` (unit)
- `e2e/` (playwright)

---

## Política de intervención si hay bloqueos
Si falta credenciales reales (AdSense aprobado / NanoBanana endpoint / etc.):
- Implementar fallback completo (MockProvider / placeholders bonitos).
- Documentar exactamente cómo conectar lo real.
- NO inventar SDKs ni endpoints.

---

## Checklist final antes de EXIT_SIGNAL=true
- [ ] Flujo E2E completo en móvil
- [ ] Consent + ads placements correctos
- [ ] Google auth + guest
- [ ] Export PNG + share
- [ ] Build/lint/typecheck/tests OK
- [ ] README deploy + env vars
