# PROMPT DE LIMPIEZA SEMANAL — Para CCode
## Usar cada domingo en la carpeta de cada proyecto

---

Copia y pega esto en CCode estando dentro de la carpeta del proyecto:

---

```
Necesito que organices esta carpeta de proyecto. NO borres nada. Solo mueve archivos a la estructura que te indico.

## Estructura objetivo

Crea estas carpetas si no existen:

### 📁 /activo/
Todo lo que se usa activamente esta semana o las próximas:
- Código fuente y configuración del proyecto
- Assets actuales (imágenes, vídeos, audios en uso)
- Documentos de referencia vigentes (roadmaps, auditorías, guías de estilo)
- Borradores en progreso
- Scripts y herramientas que se usan regularmente

### 📁 /archivo/
Material útil pero que NO se necesita esta semana. Podría ir a memoria externa:
- Versiones anteriores de documentos (v1, v2... cuando ya existe v3)
- Assets de contenido ya publicado (teasers, vídeos, imágenes ya usadas)
- Informes de días/semanas anteriores
- Capturas de pantalla antiguas
- Borradores descartados pero con ideas rescatables
- Builds anteriores (.aab, .apk de versiones pasadas)
- Conversaciones o transcripciones exportadas

### 📁 /descartable/
Material obsoleto que probablemente no se necesitará, pero NO se borra por seguridad:
- Archivos temporales (logs, caches, outputs de debug)
- Assets duplicados o versiones descartadas de imágenes/vídeos
- Documentos superseded completamente por versiones nuevas
- Tests, pruebas y experimentos fallidos
- Placeholder content ya sustituido por contenido real

## Reglas

1. **NUNCA borres nada** — solo mueve entre carpetas
2. **No toques /node_modules/, /.git/, /dist/, /build/** ni carpetas de sistema
3. **No muevas el código fuente** del proyecto (src/, components/, pages/, etc.) — eso siempre es /activo/
4. **Si dudas → /archivo/** (mejor conservar de más que perder algo útil)
5. **Cuando muevas algo a /archivo/ o /descartable/**, mantén la estructura de subcarpetas original para que sea fácil encontrarlo
6. **Al terminar**, genera un resumen en formato markdown con:
   - Cuántos archivos moviste y a dónde
   - Qué archivos grandes (>10MB) encontraste y dónde están
   - Espacio total liberado del directorio /activo/
   - Cualquier archivo que te pareció sospechoso o fuera de lugar

## Ejemplos

| Archivo | Destino | Razón |
|---------|---------|-------|
| roadmap-v2.md (versión actual) | /activo/ | Documento de referencia vigente |
| roadmap-v1.md | /archivo/ | Superseded por v2 |
| teaser-elevator.mp4 (ya publicado) | /archivo/ | Ya usado, puede necesitarse para referencia |
| screenshot-2026-02-15.png | /archivo/ | Captura antigua |
| test-output-debug.log | /descartable/ | Temporal de debug |
| fartworld-v8.aab | /descartable/ | Build obsoleto (v10 es el actual) |
| PROJECTMAP.md | /activo/ | Documento de referencia central |

Empieza analizando el contenido de la carpeta y propón el plan de movimientos antes de ejecutar. Yo lo reviso y te doy el OK.
```

---

## NOTAS DE USO

- **Cuándo:** Cada domingo, como parte de la revisión semanal
- **Dónde:** En cada carpeta de proyecto activo (RutaAlemania, FartWorld, QAANAAQ, Gaudí Mosaic)
- **Tiempo estimado:** 10-15 min por proyecto (CCode analiza, tú revisas, CCode ejecuta)
- **Importante:** CCode propone primero, tú apruebas después. Nunca ejecución directa.
- **Después de la limpieza:** Buen momento para copiar /archivo/ a disco externo si quieres liberar espacio
