# Parámetros de Diseño UI/UX v2 — Sistema Constructivo y Directrices de Calidad

Este documento define el estándar obligatorio de diseño y experiencia de usuario para cualquier cambio, refactorización o adición en este proyecto.

---

## 1. Sistema de Color: Regla 60-30-10 con Propósito

Cada propuesta de color debe definirse en este orden y responder a una función real del producto:

1. **Color Dominante (60% del área visual)**:
   - Fondo principal del sistema.
   - Debe ser un neutro con temperatura definida (ligeramente frío/azulado o cálido según el producto/marca).
   - **Prohibido**: `#FFFFFF` plano deslumbrante o crema genérico `#F4F1EA`.
2. **Color Secundario (30% del área visual)**:
   - Superficies de tarjetas, barras laterales, contenedores de trabajo y cabeceras.
   - Variación tonal directa del color dominante (mismo matiz, diferente luminosidad/saturación).
3. **Color de Acento Único (10% o menos)**:
   - Reservado **estrictamente** para interacción primaria (botón de acción principal, estado activo seleccionado, enlaces clave).
   - Si un color de acento ocupa más del 10% del espacio, genera ruido visual y pierde su función de llamada a la acción.
4. **Colores Funcionales / Semánticos**:
   - Éxito (`#10B981` / Emerald), Error (`#EF4444` / Rose), Advertencia (`#F59E0B` / Amber).
   - Son independientes del color de marca y deben contrastar inequívocamente con el fondo.
5. **Verificación de Contraste Obligatoria**:
   - Cada combinación de texto y fondo debe cumplir la norma **WCAG AA** (mínimo 4.5:1 para texto normal, 3:1 para texto grande).

---

## 2. Distribución y Layout: Grid, Escala y Jerarquía

1. **Grid Explícito**:
   - Layout modular (12 columnas en escritorio, 4 en móviles). Todos los elementos deben estar anclados al grid, sin componentes flotando a ojo.
2. **Escala de Espaciado Única**:
   - Utilizar únicamente valores de la escala fija: `4px` (1), `8px` (2), `12px` (3), `16px` (4), `24px` (6), `32px` (8), `48px` (12), `64px` (16).
   - **Prohibido**: Valores arbitrarios inventados (`13px`, `22px`, etc.).
3. **Escala Tipográfica Modular**:
   - Jerarquía clara con tamaños proporcionales (ratio 1.25 o 1.333).
   - Un solo peso visual dominante por pantalla; el resto de elementos en segundo plano estructurado.
4. **Densidad Consciente**:
   - Maximizar la información visible, legible y escaneable (listas de correos, filtros, visualizadores) en lugar de espacios en blanco vacíos e injustificados de landing page.

---

## 3. Heurísticas de UX y Calidad de Interacción

1. **Visibilidad del estado del sistema**:
   - Feedback inmediato y visible en cada acción (copia con checkmark, temporizador en vivo, conexión WebSocket).
2. **Consistencia de Vocabulario y Componentes**:
   - El botón "Copiar dirección" genera el toast "Dirección copiada".
   - El botón "Extender 10 minutos" genera el toast "Tiempo extendido (+10m)".
   - Los botones del mismo nivel jerárquico se comportan y ven exactamente igual en toda la interfaz.
3. **Control y Libertad**:
   - Posibilidad inmediata de revertir o reiniciar acciones (volver a la lista, cancelar edición de alias, generar nueva dirección).
4. **Estados Vacíos y Errores Claros**:
   - Mensajes específicos que explican qué sucede y qué hacer a continuación, sin disculpas vacías ("Oops") ni texto genérico de relleno.
5. **Accesibilidad**:
   - Foco de teclado visible (`focus-visible`), navegación por tabulador y respeto por `prefers-reduced-motion`.

---

## 4. Prohibiciones Explícitas (Anti-Defaults de IA)

* ❌ **Prohibido**: Fondo crema (`#F4F1EA`) + tipografía serif display + acento terracota (`#D97757`).
* ❌ **Prohibido**: Fondo casi negro absoluto con acento verde ácido o vermellón chillón.
* ❌ **Prohibido**: Layout "broadsheet" lleno de líneas divisorias excesivas sin justificación.
* ❌ **Prohibido**: Gradientes decorativos de fondo o textos con gradientes de colores si no aportan significado.
* ❌ **Prohibido**: Numeración ficticia `01 / 02 / 03` si no es una secuencia ordinal obligatoria.
* ❌ **Prohibido**: Sombras difusas `soft-UI` idénticas en todas las tarjetas sin jerarquía.
* ❌ **Prohibido**: Animaciones innecesarias en cada componente (el movimiento solo se usa si aporta feedback funcional).
* ❌ **Prohibido**: Texto de relleno genérico o publicitario ("Empoderamos tu privacidad").

---

## 5. Proceso Obligatorio para Futuros Cambios de UI

1. **Plan en Texto Previo**:
   - Entregar tabla con colores (60-30-10), tipografías, estructura del layout y elemento distintivo.
2. **Validación contra las Heurísticas**:
   - Verificar contraste AA, coherencia de copy y escala de espaciado antes de cerrar el cambio.
