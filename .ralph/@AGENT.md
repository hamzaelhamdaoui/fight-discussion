# @AGENT — Manual operativo (Ralph + Claude Code) — FightReplay AI

## 0) Objetivo del agente
Entregar una web app MOBILE-FIRST production-ready cumpliendo `.ralph/PROMPT.md` y siguiendo el plan `.ralph/@fix_plan.md`.
No se acepta “demo bonita” sin robustez. Todo debe ser verificable por comandos.

---

## 1) Reglas absolutas (NO negociables)
1) MOBILE-FIRST real.
2) No inventar APIs/SDKs. Si algo no existe, hacerlo como provider REST configurable + fallback.
3) No exponer secretos. Nunca commitear `.env.local`.
4) No loggear contenido sensible (conversaciones). Redactar antes de logs.
5) Ads: no cargar scripts antes de consentimiento. Etiquetar ads claramente.
6) EXIT_SIGNAL=true solo si:
   - build + lint + typecheck + e2e pasan
   - checklist final completa
   - README y `.env.example` correctos

---

## 2) Flujo de trabajo (cómo ejecutar cambios)
### Disciplina de commits
- Commits pequeños, atómicos, con mensajes tipo:
  - `feat: add upload step UI`
  - `feat: implement gemini reconstruct endpoint`
  - `chore: add e2e smoke test`
- No acumular 50 cambios sin commit.
- Si algo se rompe, revertir o arreglar antes de seguir.

### Branch
- Trabajar en `main` si el flujo lo exige (simple repo). Si se usa branch, documentar en README.

---

## 3) Comandos estándar del repo (obligatorio mantener scripts)
El repo debe incluir (package.json):
- `dev` -> next dev
- `build` -> next build
- `start` -> next start
- `lint` -> eslint
- `typecheck` -> tsc --noEmit (si aplica)
- `test` (opcional) -> unit tests
- `e2e` -> playwright test

### Comandos que el agente debe usar en validación
- `npm install`
- `npm run lint`
- `npm run typecheck` (si existe)
- `npm run build`
- `npm run e2e` o `npx playwright test`

---

## 4) MCP usage (Supabase + Playwright)
### Supabase MCP
- Usar MCP para:
  - generar SQL de tablas
  - crear/ajustar políticas RLS
  - revisar queries
- Nunca apuntar a producción si no es necesario.

### Playwright MCP
- Usar para:
  - crear tests e2e smoke
  - screenshots de regresión para ResultsStep y BattleStep
- Mantener tests estables (no flakey):
  - esperar por `data-testid`
  - evitar timeouts arbitrarios

---

## 5) Estilo UI/UX (requisitos prácticos)
- Todo debe funcionar perfecto a 375x812 (iPhone).
- Interacciones:
  - botones grandes
  - feedback inmediato (loading/skeleton)
  - errores siempre recuperables (retry)
- Animaciones: Framer Motion suave, no excesiva, sin jank.
- Accesibilidad:
  - contraste razonable
  - focus states
  - aria-labels en acciones clave

---

## 6) Seguridad y privacidad (mínimo viable de producción)
### Inputs
- Validar imágenes:
  - MIME permitido
  - tamaño máximo por imagen
  - límite de cantidad total
- Sanitizar cualquier string mostrado.

### Logs
- No imprimir textos completos de la conversación.
- Redactar emails/teléfonos antes de logs.
- Añadir request id / correlation id.

### Rate limiting
- Implementar rate limit en endpoints IA:
  - por IP / por user id (si logueado)
  - devolver 429 con mensaje claro

### Modo privado
- Si user elige “privado”:
  - no guardar timeline completo en DB
  - solo métricas agregadas o nada (según diseño)
  - share deshabilitado o “redacted”

---

## 7) IA: contratos y prompts
### Contratos estrictos (Zod)
- Define tipos:
  - ExtractedMessage, ExtractedCapture
  - ReconstructedConversation (timeline ordenado)
  - BattleAnalysis (attacks, winner, stats)
- Cualquier respuesta IA:
  - debe validarse con Zod
  - si falla: reintento con prompt “STRICT JSON” o devolver error recuperable

### Estrategia de orden
1) timestamps -> orden determinista
2) si faltan -> reconstrucción global IA:
   - devolver confidence
   - explanation_short
   - gaps

### Prompts IA
- Mantener prompts versionados en `lib/ai/prompts/*`
- No mezclar lógica en components UI.

---

## 8) Ads: estrategia rentable sin romper políticas
### Consent
- Implementar CMP simple:
  - aceptar / rechazar
  - persistencia local + DB si logueado
- No cargar script de AdSense antes de aceptar.

### Arquitectura
- `AdSlot` + `AdProvider` interface:
  - AdsenseProvider
  - MockProvider (dev)
- Lazy load por IntersectionObserver.

### Placements (obligatorio)
- Landing: 1 below-the-fold
- ConversationReviewStep: 1 al final del timeline
- ResultsStep: 3 (winner abajo, mid analysis, final pre-share)
- Share page: 1 al final

### Etiquetado
- Mostrar “Advertisements” cerca del slot.
- No imitar UI nativa.

---

## 9) Google Auth ultra rápido + Guest
### Google
- Botón “Continue with Google”
- Onboarding mínimo: entrar directo al Wizard

### Guest
- Flujo completo sin login:
  - drafts local
  - resultados local
- Si luego loguea:
  - migración local->DB (opt-in)

---

## 10) Export PNG + Share (viral)
- ResultsStep debe exportarse a PNG fiable:
  - fuentes ok
  - imágenes ok
- Share token:
  - token no guessable
  - evita exponer PII
- Si private mode: share bloqueado o redacted.

---

## 11) Estructura y calidad del código
- Separar:
  - UI (components)
  - domain (battle engine)
  - infrastructure (supabase, ai, ads)
- No meter prompts IA dentro de React components.
- Usar `data-testid` en elementos clave para e2e:
  - upload input
  - reconstruct button
  - start battle
  - export png
  - ad slot wrappers
  - consent accept/reject

---

## 12) Procedimiento de “fin” (antes de EXIT_SIGNAL=true)
### Checklist obligatorio
1) `npm run lint` OK
2) `npm run typecheck` OK (si existe)
3) `npm run build` OK
4) `npx playwright test` OK (smoke)
5) Flujo manual:
   - upload -> reconstruct -> review -> battle -> results -> export png -> share link OK
6) Ads:
   - sin consentimiento: no hay scripts
   - con consentimiento: slots renderizan sin romper layout
7) Auth:
   - Google ok
   - Guest ok
8) README:
   - setup local
   - env vars
   - deploy (Vercel)
   - cómo conectar NanoBanana real y AdSense real

### Formato de salida Ralph (obligatorio en cada iteración)
---RALPH_STATUS---
CURRENT_STEP: ...
PROGRESS: ...
NEXT: ...
NOTES: ...
---EXIT_SIGNAL---
false|true

No marcar true si falta algo.

---

## 13) Si algo se bloquea
- No “inventar” soluciones.
- Implementar fallback:
  - NanoBanana: placeholders bonitos
  - AdSense: MockProvider
- Documentar el hook real por env vars.
- Reducir scope solo si se mantiene E2E funcional y se documenta.
