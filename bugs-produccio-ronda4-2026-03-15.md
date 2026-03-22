# BUGS DE PRODUCCIÓ — Ronda 4 — 15 de març de 2026

Llegeix CLAUDE.md per context.

**ATENCIÓ: L'últim deploy ha introduït regressions. Les rajoles del catàleg han perdut qualitat d'imatge i la zona de trencament retalla les imatges. Cal revertir els canvis CSS que han causat això o arreglar-los sense perdre qualitat.**

**Fes tots els canvis i UN SOL deploy a Netlify.**

---

### Bug 1 — Qualitat d'imatge degradada al catàleg mòbil
**Descripció:** Les rajoles del catàleg en mòbil es veuen amb menys resolució que abans, borroses. La qualitat de les imatges Midjourney s'ha degradat.
**Causa probable:** El canvi de CSS per fer les rajoles quadrades pot haver forçat una mida de renderitzat diferent o haver afectat com es carreguen/escalen les imatges.
**Solució:** Les imatges han de mantenir la resolució original. Assegura't que les imatges es renderitzen amb la seva resolució nativa i no es redueixen per CSS. Utilitza `object-fit: cover` amb `aspect-ratio: 1` si cal, però sense reduir la qualitat de la imatge. Mostra'm el CSS actual i el canvi.

### Bug 2 — Col·lecció Jocs Florals no scroleja completament
**Descripció:** Al catàleg mòbil, la col·lecció Jocs Florals no permet fer scroll fins a veure totes les rajoles completes. Les últimes rajoles queden tallades.
**Solució:** Afegir padding-bottom suficient al contenidor del catàleg perquè totes les rajoles de l'última col·lecció siguin completament visibles i accessibles. Tenir en compte l'alçada de la barra de navegació inferior.

### Bug 3 — Rajola retallada a la zona de trencament
**Descripció:** Quan selecciones una rajola per trencar-la, la imatge no es mostra sencera a la zona de trencament. Està retallada pels costats — no es veu la rajola completa.
**Esperat:** La rajola sencera ha de ser visible dins la zona de trencament, sense retallar. Si cal, reduir la mida de la previsualització perquè càpiga completa dins l'espai disponible mantenint la proporció original.
**Solució:** Revisar el CSS del breakCanvas o la imatge de previsualització en mòbil. Probablement cal `object-fit: contain` en lloc de `cover`, o ajustar max-width/max-height perquè la imatge sencera càpiga.

### Bug 4 — Trencament no mostra resultat complet
**Descripció:** Després de prémer "Trencar", abans es veia la rajola amb totes les línies de fractura i els fragments resultants dins la zona de trencament. Ara no es veu complet — el resultat queda tallat o no es mostra correctament.
**Esperat:** Després de trencar, l'usuari ha de veure TOTS els fragments resultants dins la zona de trencament, amb les línies de fractura visibles, abans de decidir si vol "Usar fragments" o tornar a trencar.
**Solució:** Mateixa causa que el Bug 3 — la zona de trencament retalla el contingut. Assegurar que tant la previsualització com el resultat del trencament es mostren complets.

### Bug 5 — Modal d'exportació: botons fora de pantalla en mòbil
**Descripció:** El modal "Your mosaic is ready!" no scroleja en mòbil. Els botons de Compartir i Descarregar queden per sota de la part visible de la pantalla. L'usuari veu la previsualització i el text però no pot arribar als botons.
**Solució:** Afegir overflow-y: auto al modal d'exportació. Afegir padding-bottom generós (mínim 120px) per tenir en compte la barra del navegador mòbil. Alternativament, reduir la mida de la previsualització en mòbil perquè els botons càpiguen a la pantalla sense necessitat de scroll.

---

## ORDRE DE TREBALL

1. **Bug 1** — Qualitat imatge (regressió, prioritat alta)
2. **Bug 3 + Bug 4** — Zona trencament retallada (mateixa causa)
3. **Bug 5** — Modal exportació botons
4. **Bug 2** — Scroll catàleg Jocs Florals

Per cada canvi, mostra'm el codi real modificat. Al final de tot, fes UN SOL deploy a Netlify.
