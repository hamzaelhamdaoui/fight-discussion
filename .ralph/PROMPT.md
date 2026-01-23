# Proyecto: FightReplay AI — Web App Mobile-First (Responsive) + Supabase + Gemini + Ads

## 0) Regla máxima (no negociable)
Este producto es una **WEB APP RESPONSIVE MOBILE-FIRST**.
- Debe verse y sentirse perfecta en móvil (375px ancho como referencia).
- Navegación y UX pensadas para pulgar.
- Nada de “desktop-first adaptado”: es MOBILE-FIRST real.
- Performance en móvil es prioridad (LCP, CLS, imágenes optimizadas).

## 1) Objetivo (visión)
Construir una web app donde el usuario:
1) Sube capturas de una discusión (pareja, amigos, familia, etc.), incluso desordenadas.
2) La IA reconstruye la conversación en orden correcto con confianza y avisos.
3) Se reproduce como un “combate” 1 vs 1 con animaciones y frases clave que quitan vida.
4) Pantalla final shareable (descarga PNG lista para redes) con:
   - análisis detallado
   - motivos de por qué “gana” uno u otro (explicable)
   - recomendaciones prácticas (no diagnóstico / no terapia)

**Monetización**: Integrar **Google AdSense** (preferido) o el “mejor” proveedor mediante arquitectura de “Ad Provider”, con **placements estratégicos y rentables**, sin violar políticas ni UX.

**Auth**: Opcional y ultra rápido: **“Continue with Google”** (Supabase Auth) + modo invitado (rápido) sin fricción.

---

## 2) Stack (fijo)
- Next.js (App Router) + TypeScript
- Tailwind + shadcn/ui
- Framer Motion (animaciones)
- TanStack Query (o equivalente)
- Supabase: Auth + Postgres + Storage
- IA: Gemini multimodal
- Assets: “Nano Banana Pro” vía provider (si no hay SDK, REST por env + fallback assets locales)

---

## 3) Auth ultra rápido (opcional)
Objetivo: “en 1 tap estoy dentro”.
- Botón primario: **Continue with Google**
- Botón secundario: **Continue as Guest**
- Si Guest:
  - permitir uso completo del flujo sin login
  - guardar drafts localmente (localStorage/IndexedDB)
  - al loguear luego, ofrecer “Guardar/convertir” resultados en Supabase
- Si Google:
  - Supabase Auth con provider Google
  - crear/actualizar profile
  - permitir guardar historial de análisis, battles, share links

---

## 4) Monetización con Ads (AdSense-first + estrategia rentable)
### 4.1 Reglas de cumplimiento (obligatorias)
- NO cargar scripts de ads hasta que el usuario acepte consentimiento.
- Etiquetar ads correctamente (ej. “Advertisements”) y que se vean como ads (no mimetizar UI).
- Usar **responsive ad units** para mobile.

### 4.2 Arquitectura obligatoria
Crear un componente:
- `<AdSlot placement="..." />`

Y una capa:
- `adProviders/AdProvider.ts`
- `adProviders/adsense/AdsenseProvider.ts`
- `adProviders/mock/MockProvider.ts` (para dev si no hay AdSense aprobado)

Debe existir:
- `AdsConsent` (CMP simple): aceptar/rechazar y persistir (localStorage + si user logueado, en DB).

### 4.3 Placements estratégicos (rentables + sin fastidiar UX)
Objetivo: maximizar RPM/ingresos en pantallas de alto “dwell time”, SIN interrumpir la acción principal.

**Colocar ads así (MOBILE-FIRST):**
1) Landing:
   - 1 ad responsive “below the fold” (no arriba del todo).
2) ConversationReviewStep:
   - 1 ad inline al final del timeline, antes del CTA “Iniciar combate”.
3) ResultsStep (pantalla más rentable):
   - Ad #1: justo debajo del “winner banner”
   - Ad #2: a mitad del análisis (entre secciones)
   - Ad #3: al final, antes de “Descargar PNG / Compartir”
4) Public Share Page (si existe):
   - 1 ad al final (no arriba), para no romper el share.

**NO poner ads dentro del BattleStep** (animación + atención), excepto quizá un slot muy discreto debajo del fold en pausas, pero por defecto NO.

Implementar lazy-load y no bloquear rendering. Si no hay consentimiento, los `AdSlot` renderizan nada.

---

## 5) UX / Pantallas (flujo)
- Landing (demo mock + CTA)
- Wizard:
  1) UploadStep (multi-upload, preview, “Auto-ordenar con IA”)
  2) ParticipantsStep (detectar A/B, renombrar)
  3) ConversationReviewStep (timeline reconstruido + warnings + CTA)
  4) BattleStep (replay animado, play/pause/skip)
  5) ResultsStep (shareable + análisis + descarga PNG + share link)

Todo debe ser precioso, mobile-first, con animaciones sutiles y performance alta.

---

## 6) IA: extracción + reconstrucción + análisis
### 6.1 Extracción de capturas
Por imagen:
- Gemini multimodal -> mensajes con speaker A/B, texto, timestamp si existe, confidence.
Normalizar.

### 6.2 Reconstrucción global
- Si timestamps suficientes -> ordenar.
- Si no -> Gemini reconstruye un timeline global con:
  - `confidence`
  - `explanation_short`
  - `gaps[]`

Validar con Zod.

### 6.3 Análisis y ganador (explicable, no ofensivo)
Criterios: claridad, coherencia, respeto, intento de resolver, escucha, menor escalada.
Penalizar insultos/manipulación.
Producir `attacks[]`:
- texto, daño, tipo, target, rationale.

---

## 7) Motor de combate
HP 100/100. Ataques por frases clave.
Animaciones Framer Motion + sprites (provider).
Final: winner + stats.

---

## 8) Datos y Supabase
Tablas:
- profiles (ads_consent, plan, created_at)
- uploads (storage_paths, status)
- conversations (timeline_json, confidence, language)
- battles (attacks_json, winner, stats)
- share_cards (public_token, is_public)

Buckets:
- uploads (privado)
- assets (privado)
- share-cards (público con token/signed URL)

RLS estricto por user_id.

---

## 9) Tareas (orden estricto)
1) Scaffold Next.js + Tailwind + shadcn/ui + Framer Motion (mobile-first)
2) Supabase Auth (Google) + modo Guest + DB + Storage + RLS + migraciones
3) Wizard UI completo con mock data
4) Endpoints API: upload/analyze/reconstruct/battle
5) Battle UI animado (placeholder assets)
6) Provider NanoBanana (fallback + docs)
7) Results share (download PNG) + share link
8) Ads: CMP + AdProvider + placements estratégicos
9) Tests (Playwright e2e mínimo) + lint + typecheck
10) README deploy (Vercel) + env vars

---

## 10) Definition of Done (salida real)
- Mobile-first perfecto
- Flujo E2E completo
- Ads solo tras consentimiento + placements implementados
- Auth Google rápido + Guest funcional
- Build + tests + lint + typecheck OK
- README claro
- EXIT_SIGNAL=true solo si todo está hecho

---

## Formato obligatorio de estado (Ralph loop)
Al FINAL de CADA respuesta:

---RALPH_STATUS---
CURRENT_STEP: <...>
PROGRESS: <0-100>%
NEXT: <...>
NOTES: <...>
---EXIT_SIGNAL---
<true|false>
