# Publication avec GitHub Pages

## Première publication

1. Créer un nouveau dépôt GitHub public, par exemple `dtw-heatmap-explorer`.
2. Ouvrir un terminal dans ce dossier.
3. Exécuter :

```bash
git init
git branch -M main
git add .
git commit -m "Première galerie DTW"
git remote add origin https://github.com/VOTRE_COMPTE/dtw-heatmap-explorer.git
git push -u origin main
```

4. Sur GitHub, ouvrir :

`Settings > Pages`

5. Dans `Build and deployment` :
   - Source : `Deploy from a branch`
   - Branch : `main`
   - Folder : `/ (root)`
   - Save

Le site sera disponible à :

`https://VOTRE_COMPTE.github.io/dtw-heatmap-explorer/`

## Mise à jour

Relancer le script Python avec `--overwrite`, puis :

```bash
git add .
git commit -m "Mise à jour des résultats"
git push
```

GitHub Pages republiera automatiquement la galerie.
