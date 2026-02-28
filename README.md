# minimal-reveal

A minimal implementation of scroll-triggered text reveal animations using GSAP SplitText. No build tools, no dependencies beyond GSAP — just three files.

Two animation types are included: titles reveal character by character, paragraphs reveal line by line. Both are responsive and rebuild automatically on resize.

---

## Preview

Live demo: [jalal-eddine-maoukil.github.io/reveal-text](https://jalal-eddine-maoukil.github.io/reveal-text)

---

## How it works

GSAP's `SplitText` plugin splits a text element into individual characters, words, or lines by wrapping each unit in its own DOM element. The `mask` option adds an `overflow: hidden` container around each unit, so animated elements that start outside the mask boundary are invisible until they slide into view.

**Titles** use `mask: "chars"` — each character starts at `yPercent: -120` (above the mask) and animates down into place with a tight stagger of `0.01s`.

**Paragraphs** use `mask: "lines"` — each line starts at `yPercent: 105` (below the mask) and animates up with a stagger of `0.04s`.

`autoSplit: true` re-splits the text on every viewport resize since line breaks change with layout. The animation is created inside `onSplit()` and returned so GSAP can kill and rebuild it cleanly on each resize.

---

## Usage

Add the classes `reveal-title` or `reveal-pargraph` to any element you want to animate.

```html
<h1 class="reveal-title">Your heading here.</h1>

<p class="reveal-pargraph">
  Your paragraph text here. It will reveal line by line on scroll.
</p>
```

That is all. The script handles the rest automatically.

---

## Requirements

GSAP 3.13 or later is required. `SplitText` was made freely available starting from version 3.13 — it will not work on earlier versions even if the CDN URL resolves.

The project loads GSAP directly from jsDelivr. No installation or package manager is needed.

```html
<script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/ScrollTrigger.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/SplitText.min.js"></script>
```

---

## Running locally

No server is required. Open `index.html` directly in a browser.

If you prefer a live-reload workflow, any static file server works:

```bash
npx serve .
```

---

## File structure

```
reveal-text/
  index.html   — markup and script tags
  style.css    — layout and typography
  script.js    — SplitText configuration and animations
  README.md
```

---

## Customisation

All animation values are plain numbers in `script.js` — duration, stagger, ease, and scroll trigger position. Change them directly in their respective `onSplit` callbacks.

To apply the reveal to additional elements, add the `reveal-title` or `reveal-pargraph` class to any text element in the HTML. No changes to the script are needed.

---

## Author

Jalal Eddine Maoukil
