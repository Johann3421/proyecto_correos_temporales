# AGENTS.md — Reglas y Parámetros de Diseño UI/UX del Proyecto

Para cualquier tarea de diseño, modificación visual, maquetación o refactorización del frontend en este proyecto, es **OBLIGATORIO** aplicar las siguientes directrices:

## 1. Sistema de Color (Regla 60-30-10 con Propósito)
- **Dominante (60%)**: Neutro con temperatura controlada (fondo principal). Prohibido `#FFFFFF` deslumbrante o crema `#F4F1EA`.
- **Secundario (30%)**: Superficies y contenedores (variación tonal del dominante).
- **Acento (10% o menos)**: Único color para interacción primaria (botones primarios y estados activos).
- **Funcionales**: Verde (éxito), Rojo (error), Ámbar (advertencia), independientes del color de marca.
- **Contraste**: Cumplimiento estricto de WCAG AA (mínimo 4.5:1).

## 2. Layout y Distribución
- **Grid explícito**: 12 columnas en desktop, 4 en mobile.
- **Escala de espaciado fija**: 4, 8, 12, 16, 24, 32, 48, 64 px. Prohibidos valores arbitrarios.
- **Jerarquía**: Un solo elemento con peso visual dominante por vista.
- **Densidad consciente**: Priorizar información visible y escaneable antes que espacios vacíos injustificados.

## 3. Heurísticas de UX y Copy
- **Feedback visible inmediato**: En cada acción realizada.
- **Consistencia verbal**: Los botones y sus respectivos toasts de confirmación deben usar el mismo verbo.
- **Estados vacíos y errores**: Explicación clara y accionable de qué pasa y qué hacer a continuación.
- **Accesibilidad**: Navegación por teclado visible (`focus-visible`) y soporte para `prefers-reduced-motion`.

## 4. Prohibiciones
- Prohibido fondo crema + serif display + terracota.
- Prohibido fondo casi-negro con un solo acento verde ácido o vermellón.
- Prohibidos gradientes decorativos sin propósito funcional.
- Prohibido numerar `01 / 02 / 03` si no es una secuencia real.
- Prohibido texto de relleno genérico.

---
Para la especificación completa, consultar [.agents/rules/ui-design-guidelines.md](.agents/rules/ui-design-guidelines.md).
