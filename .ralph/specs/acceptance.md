# Acceptance Spec — FightReplay AI (Mobile-First Web)
Ruta: `.ralph/specs/acceptance.md`

## 0) Propósito
Este documento define **criterios de aceptación verificables** (manual + automated) para declarar el proyecto “production-ready” y permitir `EXIT_SIGNAL=true`.

**Principio rector:** MOBILE-FIRST real. La referencia de QA principal es **375×812** (iPhone).

---

## 1) Definiciones
- **Guest**: usuario sin login; datos se guardan localmente (localStorage/IndexedDB).
- **User (Google)**: usuario logueado con Supabase Auth Google; datos se guardan en Supabase DB/Storage.
- **Consent Ads**: el usuario acepta explícitamente ads; antes de aceptar NO se cargan scripts de ads.
- **Modo Privado**: opción del usuario para no persistir texto sensible (ni DB ni logs), y restringir share/export si aplica (según diseño final).

---

## 2) Entorno de prueba (mínimo)
### 2.1 Viewports obligatorios
- Mobile primary: **375×812**
- Mobile secondary: **360×800**
- Desktop sanity: **1440×900** (solo para comprobar que no se rompe)

### 2.2 Navegadores (Playwright)
- Chromium: obligatorio
- WebKit (opcional, recomendado para iOS-like)

### 2.3 Red
- Simular “Fast 3G” (opcional) para validar UX (skeletons, carga no bloqueante).

---

## 3) Checklist E2E (Definition of Done)
Para marcar DONE:
- [ ] Landing se ve perfecto en móvil y no “salta” (CLS razonable).
- [ ] Wizard completo funciona en **Guest** end-to-end.
- [ ] Wizard completo funciona con **Google Auth** end-to-end.
- [ ] Upload: reordenar/eliminar/añadir funciona sin bugs.
- [ ] Reconstrucción: timeline ordenado + confidence + warnings.
- [ ] Battle replay: animaciones fluidas, HP consistente, winner consistente.
- [ ] Results: layout shareable impecable + export PNG funciona.
- [ ] Share link: `/share/[token]` funciona y respeta privacidad.
- [ ] Ads: CMP cumple (sin consentimiento: 0 scripts; con consentimiento: slots en placements).
- [ ] Seguridad mínima: validar inputs, rate limit endpoints IA, sin logs con texto sensible.
- [ ] `npm run lint` OK, `npm run typecheck` OK (si existe), `npm run build` OK.
- [ ] `npx playwright test` OK (smoke suite mínimo).

---

## 4) Casos de Uso Principales (User Journeys)

### UC-01: Guest — flujo completo (sin login)
**Objetivo:** un usuario puede completar todo sin autenticarse.

**Pasos**
1) Entrar a `/`
2) Pulsar “Continue as Guest”
3) Subir 3–6 capturas
4) Reordenar 2 capturas manualmente
5) “Auto-ordenar con IA”
6) Revisar timeline y corregir 1 mensaje (speaker o texto, si se permite)
7) “Iniciar combate”
8) Ver replay hasta finalizar
9) Ir a resultados, descargar PNG
10) (Opcional) generar share link (si Guest lo permite) o mostrar “login para compartir”.

**Criterios de aceptación**
- [ ] Nunca se bloquea el flujo por pedir login.
- [ ] Feedback inmediato (loading/skeleton) en IA.
- [ ] Los resultados se guardan localmente (persisten al refrescar) o se explica claramente si no se guardan.
- [ ] Export PNG funciona en móvil.

---

### UC-02: Google Auth — flujo completo + persistencia en Supabase
**Objetivo:** mismo flujo, pero persistido en DB/Storage.

**Pasos**
1) Entrar a `/`
2) “Continue with Google” (Supabase Auth)
3) Subir capturas
4) IA reconstruye + combate + resultados
5) Refrescar página (F5)
6) Ver historial o recuperar el último resultado (según diseño)

**Criterios de aceptación**
- [ ] Login en 1–2 taps, sin onboarding largo.
- [ ] Se crean/actualizan `profiles`.
- [ ] `uploads`, `conversations`, `battles` se guardan asociados a `user_id`.
- [ ] RLS impide acceder a datos de otro usuario.

---

### UC-03: Consent Ads (cumplimiento + placements)
**Objetivo:** ads sólo con consentimiento y en placements rentables.

**Pasos**
1) Entrar a `/` en Guest
2) Rechazar consentimiento
3) Navegar Landing → Wizard → Results
4) Confirmar que NO se carga ningún script de ads
5) Volver a iniciar (o limpiar storage), aceptar consentimiento
6) Repetir flujo y confirmar que aparecen slots

**Criterios de aceptación**
- [ ] Sin consentimiento: `AdSlot` no carga scripts ni iframes.
- [ ] Con consentimiento: slots aparecen en:
  - Landing: 1 below-the-fold
  - ConversationReviewStep: 1 al final del timeline
  - ResultsStep: 3 (winner abajo, mid analysis, final pre-export/share)
  - Share page: 1 al final
- [ ] Etiqueta visible “Advertisements”.
- [ ] No hay ads “pegados” al CTA principal ni interrumpen BattleStep.

---

## 5) Reconstrucción de Conversación (casos reales + edge)

> Importante: como no usamos OCR real en tests, se deben incluir **fixtures** (JSON) para simular resultados de Gemini en e2e/unit. Aun así, debe existir un modo “dev fixtures” controlado por env o query param para tests.

### DS-01: Capturas en orden correcto con timestamps
**Entrada (fixture)**
- 4 capturas con timestamps consistentes.

**Esperado**
- [ ] Orden final igual al timestamp.
- [ ] confidence alta (ej. >0.8).
- [ ] gaps vacíos.

### DS-02: Capturas desordenadas, sin timestamps (caso más común)
**Entrada**
- 5 capturas sin timestamp, mensajes cortos, algunos repetidos (ej. “vale”).

**Esperado**
- [ ] IA produce un timeline coherente.
- [ ] Se muestra warning “orden inferido”.
- [ ] confidence media (ej. 0.5–0.8).
- [ ] timeline editable (mínimo: cambiar speaker o reorden manual de mensajes si se implementa).

### DS-03: Captura con múltiples mensajes (scroll)
**Entrada**
- 1 captura con 8 mensajes seguidos.

**Esperado**
- [ ] Se extraen todos los mensajes (no solo el último).
- [ ] Se mantiene el orden local dentro de la captura.

### DS-04: Conversación con 3 participantes (grupo)
**Entrada**
- Mensajes de A, B y C (y el producto es 1v1).

**Decisión de producto (aceptación)**
Debe cumplirse **una**:
- Opción A: UI pide elegir 2 participantes para “battle”.
- Opción B: IA agrupa C como “otros” y no entra en combate.
- Opción C: sistema rechaza con mensaje claro y guía (“solo 2 participantes por ahora”).

**Esperado**
- [ ] No se rompe el pipeline.
- [ ] Mensaje al usuario claro, sin confusión.

### DS-05: Idioma mezclado (ES+EN) y emojis
**Esperado**
- [ ] El análisis sigue funcionando.
- [ ] No se rompen validaciones JSON.
- [ ] Emojis se preservan (o se documenta normalización).

### DS-06: Textos sensibles (teléfono/email)
**Esperado**
- [ ] En logs NO aparece el texto sin redacción.
- [ ] En modo privado, no se persiste texto completo.

---

## 6) Combate / Battle Engine (aceptación)
### BE-01: Ataques deterministas
Si se usa la misma conversación (mismo timeline_json) y el mismo modelo:
- [ ] `attacks[]` y `winner` deben ser consistentes (o se debe documentar variación con seed/temperature=0).

### BE-02: HP coherente
- [ ] HP inicial 100.
- [ ] HP nunca baja de 0.
- [ ] Suma de daños coincide con caída de HP.
- [ ] Winner = quien queda con HP > 0; empate -> regla clara.

### BE-03: Animación en móvil
- [ ] Replay fluido (sin “jank” evidente).
- [ ] No hay “layout shifts” grandes durante hits.
- [ ] Controles play/pause funcionan.

---

## 7) Results + Share + Export PNG
### RS-01: Pantalla “viral”
**Esperado**
- [ ] Layout bonito, legible, perfecto para screenshot.
- [ ] Secciones: winner, top hits, análisis, recomendaciones, disclaimers.

### RS-02: Export PNG robusto
- [ ] Botón “Descargar PNG” genera imagen.
- [ ] Incluye fuentes/íconos correctamente (no cajas vacías).
- [ ] Incluye el winner banner y top hits.
- [ ] No corta contenido (o usa tamaño fijo con scroll capturado correctamente).

### RS-03: Share link con token
- [ ] `/share/[token]` carga sin login (si is_public).
- [ ] No expone datos privados si modo privado.
- [ ] Un token no debe ser guessable (alto entropía).
- [ ] Share page incluye 1 ad slot al final (si consent ads y permitido en share).

---

## 8) Ads & Compliance (tests técnicos)
### AD-01: Sin consentimiento no hay scripts
**Validación técnica**
- [ ] `document.querySelectorAll('script[src*="ads"]').length === 0` (o equivalente)
- [ ] No iframes ads.

### AD-02: Con consentimiento sí hay ads (o MockProvider)
**Validación**
- [ ] Se renderiza al menos un contenedor `data-testid="ad-slot-..."`.
- [ ] Si AdSense real no disponible, MockProvider renderiza placeholder claro (no engañoso).

---

## 9) Seguridad y Robustez
### SEC-01: Validación de uploads
- [ ] Rechaza MIME no permitido.
- [ ] Rechaza tamaños excesivos.
- [ ] Mensaje de error claro y recuperable.

### SEC-02: Rate limiting en endpoints IA
- [ ] Si se excede, responde 429 con texto claro.
- [ ] UI muestra “intenta en X segundos”.

### SEC-03: Sanitización / XSS
- [ ] Cualquier texto mostrado en UI se renderiza de forma segura (no `dangerouslySetInnerHTML` con input).

---

## 10) Accesibilidad mínima (AA-ish)
- [ ] Botones tienen labels.
- [ ] Navegación con teclado no se rompe (desktop sanity).
- [ ] Contraste razonable en textos principales.
- [ ] Elementos interactivos con tamaño táctil adecuado en móvil.

---

## 11) Performance mínima (práctica)
- [ ] Landing no bloquea con scripts pesados (ads solo tras consentimiento).
- [ ] Imágenes se optimizan (Next Image o compresión).
- [ ] El battle replay no hace re-render masivo por frame.

---

## 12) Plan de automatización (Playwright “smoke suite”)
> Estos tests deben existir como mínimo:
- [ ] `e2e/guest-smoke.spec.ts`
  - landing → guest → upload (mock) → reconstruct (fixture) → battle (fixture) → results → export
- [ ] `e2e/consent-ads.spec.ts`
  - rechazar -> asegurar no scripts
  - aceptar -> ver ad slots (mock)
- [ ] `e2e/share-page.spec.ts`
  - crear share token (fixture) → abrir `/share/[token]` → ver layout + ad slot final

**Requisitos técnicos**
- Usar `data-testid` en:
  - upload input (`upload-input`)
  - reorder handle (`upload-reorder-handle`)
  - analyze/reconstruct buttons
  - start battle
  - export png
  - consent accept/reject
  - ad slots: `ad-slot-landing`, `ad-slot-review`, `ad-slot-results-1/2/3`, `ad-slot-share`

---

## 13) Fixtures recomendadas (para tests)
Crear carpeta `tests/fixtures/` con:
- `extract_captures_basic.json`
- `reconstruct_no_timestamps.json`
- `battle_attacks_basic.json`
- `share_card_public.json`

**Regla:** fixtures deben ser 100% sintéticas (sin datos personales reales).

---

## 14) Criterio de “EXIT_SIGNAL=true”
Solo puede activarse si:
- [ ] Se cumplen UC-01, UC-03, RS-02 (mínimo)
- [ ] `npm run build` ok, `npm run lint` ok, `npm run typecheck` ok
- [ ] `npx playwright test` ok
- [ ] README contiene setup + env vars + deploy + cómo conectar NanoBanana real + AdSense real
- [ ] No quedan TODO críticos en `.ralph/@fix_plan.md`

