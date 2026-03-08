# 🎮 IMPLEMENTAR DISEÑO DE FIGMA - FightReplay

## 📁 DATOS DE FIGMA

```
FILE_KEY: HKRjDAq2X1sVYVJJNAChO3
ROOT_NODE: 1:1909
URL: https://www.figma.com/design/HKRjDAq2X1sVYVJJNAChO3/fightreplay
```

---

## ⚠️ INSTRUCCIONES CRÍTICAS

### 1. REPLICAR EL DISEÑO EXACTAMENTE
- Usar `mcp_Figma_get_design_context` para obtener el código de cada pantalla
- El código de Figma es la **FUENTE DE VERDAD** para lo visual
- Replicar colores, tamaños, espaciado, estructura EXACTOS

### 2. MANTENER TODA LA FUNCIONALIDAD
- Preservar hooks, stores, handlers, lógica de negocio
- Conectar el diseño de Figma con los datos dinámicos
- Usar traducciones para todos los textos

### 3. COMPONENTES/PANTALLAS NO EN FIGMA
Si algún componente o pantalla NO está en el diseño de Figma:
- Usar el **design system** extraído de las pantallas existentes
- Aplicar los mismos colores, tipografía, espaciado, efectos
- Mantener consistencia visual con el resto

### 4. ELEMENTOS DE DISEÑO SIN FUNCIONALIDAD
Si el diseño de Figma tiene elementos que NO corresponden con la funcionalidad actual:
- **IGNORARLOS** - no implementar funcionalidad nueva
- Solo implementar lo que ya existe en el código
- El diseño es visual, la funcionalidad es la existente

---

## 📋 PROCESO PASO A PASO

### Paso 0: Obtener estructura del archivo Figma
```
mcp_Figma_get_metadata({ 
  fileKey: "HKRjDAq2X1sVYVJJNAChO3", 
  nodeId: "1:1909" 
})
```

Esto te dará los IDs de todas las pantallas/frames disponibles.

### Paso 1: Para CADA pantalla en Figma

```
mcp_Figma_get_design_context({ 
  fileKey: "HKRjDAq2X1sVYVJJNAChO3", 
  nodeId: "<NODE_ID_DE_LA_PANTALLA>" 
})
```

### Paso 2: Obtener variables de diseño (design tokens)
```
mcp_Figma_get_variable_defs({ 
  fileKey: "HKRjDAq2X1sVYVJJNAChO3", 
  nodeId: "1:1909" 
})
```

Guardar estos tokens para:
- Aplicar a globals.css
- Usar en componentes no incluidos en Figma

### Paso 3: Leer componente actual
Antes de reescribir cada componente, LEE el código actual para identificar:
- Imports
- Hooks (useWizardStore, useBattleStore, useState, etc.)
- Handlers (handleUpload, handleStartBattle, etc.)
- Lógica de negocio
- Animaciones

### Paso 4: Combinar Figma + Funcionalidad

```tsx
// VISUAL: Del código de Figma (get_design_context)
// FUNCIONALIDAD: Del código actual
// TEXTOS: De translations (t.*)
// DATOS: De stores

export function Component() {
  // ===== FUNCIONALIDAD EXISTENTE (preservar) =====
  const t = useTranslations();
  const { data, handler } = useStore();
  
  const handleAction = () => {
    // lógica existente
  };
  
  // ===== DISEÑO DE FIGMA (aplicar) =====
  return (
    <div className="[CLASES EXACTAS DE FIGMA]">
      {/* Estructura de Figma + datos dinámicos */}
      <h1 className="[FIGMA]">{t.section.title}</h1>
      
      {data.map(item => (
        <div key={item.id} className="[FIGMA]">
          {item.content}
        </div>
      ))}
      
      <button className="[FIGMA]" onClick={handleAction}>
        {t.section.button}
      </button>
    </div>
  );
}
```

---

## 🎯 COMPONENTES A IMPLEMENTAR

### Orden de implementación:

1. **globals.css + tailwind.config.ts**
   - Primero extraer design tokens de Figma
   - Actualizar variables CSS y colores de Tailwind

2. **landing-page.tsx**
   - Buscar frame "Landing" o "Home" en Figma

3. **upload-step.tsx**
   - Buscar frame "Upload" en Figma
   - Preservar: useWizardStore, useDropzone, handlers

4. **participants-step.tsx**
   - Buscar frame "Participants" en Figma
   - Preservar: useWizardStore, form handlers

5. **review-step.tsx**
   - Buscar frame "Review" en Figma
   - Preservar: useWizardStore, useBattleFlow

6. **battle-step.tsx**
   - Buscar frame "Battle" o "Arena" en Figma
   - Preservar: useBattleStore, playback controls, animations

7. **results-step.tsx**
   - Buscar frame "Results" en Figma
   - Preservar: useBattleStore, share handlers

8. **auth/page.tsx**
   - Buscar frame "Auth" o "Login" en Figma
   - Preservar: Supabase auth handlers

9. **wizard-header.tsx + wizard-progress.tsx**
   - Extraer de headers de los frames de steps
   - Preservar: useWizardStore, navigation

---

## 🎨 DESIGN SYSTEM

Después de procesar las primeras pantallas, documenta el design system:

```
=== DESIGN SYSTEM EXTRAÍDO ===

COLORS:
- Background: #...
- Surface: #...
- Primary (cyan): #...
- Secondary (magenta): #...
- Text: #...
- Muted: #...

TYPOGRAPHY:
- H1: size/weight/lineHeight
- H2: ...
- Body: ...
- Small: ...

SPACING:
- Section: ...
- Card: ...
- Gap: ...

EFFECTS:
- Card: ...
- Glow: ...
- Glassmorphism: ...

BORDER RADIUS:
- Large: ...
- Medium: ...
- Small: ...

=== END DESIGN SYSTEM ===
```

Usar este design system para:
- Componentes no incluidos en Figma
- Mantener consistencia

---

## 🔗 FUNCIONALIDAD POR COMPONENTE

### landing-page.tsx
```
Funcionalidad: Ningún hook especial
Mantener: Links (/battle, /auth), animaciones motion
Textos: t.landing.*
```

### upload-step.tsx
```
Funcionalidad: 
- useWizardStore → images, addImage, removeImage, setStep
- useDropzone → onDrop, isDragActive
- useState → uploading, error
- handleDrop, handleRemove, handleContinue
- Validaciones de archivos
Textos: t.upload.*
```

### participants-step.tsx
```
Funcionalidad:
- useWizardStore → participants, setParticipants, setStep
- useState → nombres
- handleNameChange, handleContinue
Textos: t.participants.*
```

### review-step.tsx
```
Funcionalidad:
- useWizardStore → conversation
- useBattleFlow → startBattle, isLoading
- Renderizado de mensajes por speaker
- handleStartBattle
Textos: t.review.*
```

### battle-step.tsx
```
Funcionalidad:
- useBattleStore → battle, currentAttack, hp, isPlaying
- useState → speed, etc.
- useEffect → animación de batalla
- handlePlay, handlePause, handleSkip, handleSpeed
- Cálculos de HP
Textos: t.battle.*
Animaciones: motion para ataques
```

### results-step.tsx
```
Funcionalidad:
- useBattleStore → winner, stats, analysis
- useState → sharing
- handleDownload (html-to-image), handleCopyLink, handleShare
Textos: t.results.*
```

### auth/page.tsx
```
Funcionalidad:
- Supabase auth
- handleGoogleLogin, handleGuestContinue
- Redirect logic
Textos: t.auth.*
```

---

## 🚫 PROHIBIDO

❌ Inventar diseños sin consultar Figma
❌ Eliminar hooks/handlers/lógica existente
❌ Implementar funcionalidad nueva que no exista
❌ Hardcodear textos (usar t.*)
❌ Usar colores aproximados (usar exactos de Figma)
❌ Ignorar componentes que sí están en Figma

---

## ✅ OBLIGATORIO

✅ Usar mcp_Figma_get_design_context para CADA pantalla
✅ Usar mcp_Figma_get_metadata para ver estructura
✅ Extraer design tokens con mcp_Figma_get_variable_defs
✅ Preservar TODA la funcionalidad existente
✅ Usar traducciones para textos
✅ Aplicar design system a componentes no en Figma
✅ Ignorar elementos de Figma sin funcionalidad correspondiente

---

## 📊 FORMATO DE ESTADO

Al inicio:
```
---RALPH_STATUS---
MODE: FIGMA_IMPLEMENTATION
FILE_KEY: HKRjDAq2X1sVYVJJNAChO3

FIGMA_STRUCTURE:
[Lista de frames encontrados con get_metadata]

DESIGN_TOKENS_EXTRACTED: true/false
---END_STATUS---
```

Por cada componente:
```
---RALPH_STATUS---
COMPONENT: upload-step.tsx
FIGMA_FRAME_USED: "Upload Step" (nodeId: X:Y)
DESIGN_CONTEXT_OBTAINED: true

FUNCTIONALITY_PRESERVED:
  - useWizardStore: ✓
  - useDropzone: ✓
  - handlers: ✓
  - validations: ✓

DESIGN_ELEMENTS_APPLIED:
  - Structure: [descripción]
  - Colors: [lista]
  - Effects: [lista]

ELEMENTS_IGNORED (no functionality):
  - [lista si hay]

FILE_SAVED: true
COMPONENTS_DONE: X/9
---END_STATUS---
```

Al final:
```
---RALPH_STATUS---
ALL_COMPONENTS_IMPLEMENTED: true
FIGMA_DESIGN_APPLIED: true
FUNCTIONALITY_PRESERVED: true
DESIGN_SYSTEM_CONSISTENT: true
BUILD_STATUS: passing
---END_STATUS---

<promise>FIGMA_DESIGN_IMPLEMENTED</promise>
```

---

## 🚀 EMPEZAR

1. `mcp_Figma_get_metadata({ fileKey: "HKRjDAq2X1sVYVJJNAChO3", nodeId: "1:1909" })`
   → Ver qué frames/pantallas hay disponibles

2. `mcp_Figma_get_variable_defs({ fileKey: "HKRjDAq2X1sVYVJJNAChO3", nodeId: "1:1909" })`
   → Extraer design tokens

3. Para cada frame relevante:
   `mcp_Figma_get_design_context({ fileKey: "HKRjDAq2X1sVYVJJNAChO3", nodeId: "<FRAME_ID>" })`
   → Obtener código React/Tailwind

4. Combinar con funcionalidad existente

5. Guardar y verificar build
