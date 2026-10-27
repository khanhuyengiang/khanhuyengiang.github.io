# khanhuyengiang.github.io

Personal website, served by GitHub Pages as plain static files (no build step).

```
index.html            academic homepage and CV          styles: assets/css/academic.css
play.html             playground: side projects, informal CV
                                                         styles: assets/css/play.css (pixel design system)
                                                         script: assets/play.js (sprites, theme toggle)
recipe/
  index.html          recipe table maker                recipe.js
  book.html           recipe book, one recipe at a time book.js
  recipes.jsonl       the book's recipes, one JSON object per line
  table.js            draws a recipe as an HTML table (used by both pages)
  compile.js          reorders ingredients so each step stays in one piece (loaded on first Compile)
  recipe.css          styles for both recipe pages, on top of assets/css/play.css
assets/
  fonts/              self-hosted fonts (Inter, Newsreader, Jersey 15), declared at the top of each stylesheet
  img/                images (WebP; recipe-table*.webp are 2x captures of the book, a wide and a phone crop)
  Khanh_Giang_CV.pdf  the downloadable CV
```

Preview locally with `python3 -m http.server` and open http://localhost:8000.

## Notes

- **Adding a recipe to the book:** append it to `recipe/recipes.jsonl` as a single line. The maker's Download JSON has the right fields but is spread over several lines. The book opens on Lemon Bars; change `DEFAULT_RECIPE` in `recipe/book.js`.
- **Fonts** are served from `assets/fonts/` instead of Google Fonts, so pages make no third-party requests. Inter is cut down to weights 400–600 and Newsreader to 400–500, the only ones `academic.css` uses. Using a new weight means downloading the font again.
- **Images:** prefer lossless WebP for screenshots and pixel art, and give `<img>` its `width` and `height` so the page doesn't jump while it loads.
- **The CV** in `assets/` is the published copy. Replace it when the CV changes, since `.cv/` is gitignored.
- Placeholders to fill in are marked with `TODO` or `href="#"`.
