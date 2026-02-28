# GSAP SplitText — Reveal Text Pattern

A step-by-step guide to understanding and implementing the exact pattern used in production.

---

## The Mental Model (read this first)

SplitText takes a DOM text node and **wraps every char / word / line in its own element** so GSAP can animate each piece independently.

```
"Hello World"
       ↓  SplitText({ type: "words, chars" })

<div class="word">           ← word wrapper
  <div class="char">H</div>
  <div class="char">e</div>
  <div class="char">l</div>
  ...
</div>
```

The `mask` option goes one step further — it wraps each animated unit in an **overflow: hidden** container. So a char that starts at `yPercent: -120` is literally **above the clip boundary** — invisible. Animate it to `yPercent: 0` → it slides into view. That is the entire reveal trick.

```
┌───────────────┐  ← overflow: hidden mask
│               │
│   H e l l o  │  ← visible zone (yPercent: 0)
│               │
└───────────────┘

      H e l l o    ← starting position (yPercent: -120) — hidden above
```

---

## Step 1 — Load the scripts in the right order

```html
<!-- 1. GSAP core first, always -->
<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js"></script>

<!-- 2. Plugins after core -->
<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/SplitText.min.js"></script>

<!-- 3. Your script last -->
<script src="script.js"></script>
```

> **Why this order?** Plugins attach themselves to the global `gsap` object when they load. If your script runs before `gsap.min.js` loads, `gsap` doesn't exist yet and everything breaks.

---

## Step 2 — Register the plugins

At the very top of your `script.js`, before anything else:

```js
gsap.registerPlugin(SplitText, ScrollTrigger);
```

> Without `registerPlugin`, GSAP won't know about SplitText or ScrollTrigger even if the files are loaded. This is a one-time setup call per page.

---

## Step 3 — Mark your HTML elements

Give your elements a class that tells your JS which reveal type to use.

```html
<!-- Title: will animate char by char -->
<h1 class="reveal-title">Design is how it works.</h1>
<h2 class="reveal-title">Motion matters.</h2>

<!-- Paragraph: will animate line by line -->
<p class="reveal-paragraph">
  Good animation isn't decoration — it communicates hierarchy,
  timing, and intent.
</p>
```

---

## Step 4 — Hide elements before split (prevent flash)

Before GSAP runs, the browser renders unsplit text for a brief moment. Hide it:

```css
.reveal-title,
.reveal-paragraph {
  opacity: 0;
}
```

> Then inside `onSplit()` you set `opacity: 1` — after the mask wrappers are in place and the text is safely hidden behind them.

---

## Step 5 — Title reveal (char by char)

```js
new SplitText(element, {
  // Split into words AND chars.
  // Words keep chars grouped — needed so spaces don't collapse.
  // Chars are what we actually animate.
  type: 'words, chars',

  // Re-splits automatically on viewport resize.
  // Lines change width on resize → autoSplit keeps things correct.
  autoSplit: true,

  // Wraps each char in overflow:hidden.
  // Chars starting at yPercent: -120 are above the clip → invisible.
  mask: 'chars',

  // CSS class on each char <div> — useful for extra styling if needed.
  charsClass: 'char',

  // Fires on init AND on every autoSplit rebuild.
  // self = fresh SplitText instance with updated .chars array.
  // ⚠️ MUST return the animation — GSAP uses it to kill + rebuild on resize.
  onSplit: (self) => {
    // Make parent element visible now that masks are hiding the text.
    gsap.set(self.elements, { opacity: 1 });

    return gsap.from(self.chars, {
      duration:  1,
      yPercent: -120,  // above the mask → invisible
      scale:     1.2,  // shrinks to 1 as it enters — feels like it settles
      stagger:   0.01, // 10ms between each char — tight, fluid
      ease:      'expo.out',

      scrollTrigger: {
        trigger: self.elements[0],
        start:   'top 88%', // fires when element top hits 88% down the viewport
        once:    true,      // kills the trigger after first fire — won't re-run on scroll up
      },
    });
  },
});
```

---

## Step 6 — Paragraph reveal (line by line)

```js
new SplitText(element, {
  // Lines = what we animate.
  // Words are also needed — they prevent mid-word line breaks
  // that would happen if only 'lines' was set.
  type: 'lines, words',

  autoSplit: true,

  // Wraps each line in overflow:hidden.
  // Lines starting at yPercent: 105 are below the clip → invisible.
  // 105 (not 100) — the extra 5% covers descenders like g, p, y.
  mask: 'lines',

  linesClass: 'line',

  onSplit: (self) => {
    gsap.set(self.elements, { opacity: 1 });

    return gsap.from(self.lines, {
      duration:  0.9,
      yPercent:  105,  // below the mask → invisible
      stagger:   0.04, // 40ms between lines — slower than chars, fits longer text
      ease:      'expo.out',

      scrollTrigger: {
        trigger: self.elements[0],
        start:   'top 88%',
        once:    true,
      },
    });
  },
});
```

---

## Step 7 — Wire it up to all elements

```js
document.querySelectorAll('.reveal-title').forEach((el) => {
  new SplitText(el, { /* title config */ });
});

document.querySelectorAll('.reveal-paragraph').forEach((el) => {
  new SplitText(el, { /* paragraph config */ });
});
```

---

## The 4 rules you must never forget

| Rule | Why it matters |
|------|----------------|
| `autoSplit: true` needs `onSplit()` | Without `onSplit`, the animation isn't rebuilt on resize → it breaks on mobile |
| `onSplit()` must `return` the tween | GSAP uses that reference to `.kill()` it before rebuilding. Without the return → stacked animations on every resize |
| Set `opacity: 1` inside `onSplit` | The mask hides the text safely once it runs — flip visibility at that moment, not before |
| `scrollTrigger` lives inside `onSplit` | Because the tween is rebuilt on resize, the trigger must be rebuilt too. If it's outside, the old trigger sticks around pointing at dead elements |

---

## Easing cheat sheet for this pattern

| Ease | When to use |
|------|-------------|
| `expo.out` | Default for reveals — snappy start, smooth landing |
| `power4.out` | Slightly softer than expo — good for large type |
| `power2.inOut` | Loops or continuous motion — not reveals |

---

## Common mistakes

```js
// ❌ WRONG — animation not returned
onSplit: (self) => {
  gsap.from(self.chars, { yPercent: -120 }); // missing return
}

// ✅ CORRECT
onSplit: (self) => {
  return gsap.from(self.chars, { yPercent: -120 });
}
```

```js
// ❌ WRONG — scrollTrigger outside onSplit
// The trigger is created once and breaks after resize
new SplitText(el, {
  autoSplit: true,
  onSplit: (self) => {
    return gsap.from(self.chars, { yPercent: -120 });
  },
});
gsap.from(el, { scrollTrigger: { trigger: el } }); // wrong place

// ✅ CORRECT — scrollTrigger inside onSplit
onSplit: (self) => {
  return gsap.from(self.chars, {
    yPercent: -120,
    scrollTrigger: { trigger: self.elements[0], once: true },
  });
}
```

---

## Full minimal working example

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: sans-serif; max-width: 700px; margin: 10vh auto; }
    h1, p { margin-bottom: 60vh; }     /* space to trigger scroll */
    .reveal-title, .reveal-paragraph { opacity: 0; }
  </style>
</head>
<body>

  <h1 class="reveal-title">Hello World</h1>
  <p class="reveal-paragraph">
    This line reveals on scroll, line by line,
    with a smooth expo ease and a tiny stagger.
  </p>

  <script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/SplitText.min.js"></script>
  <script>
    gsap.registerPlugin(SplitText, ScrollTrigger);

    // Title
    new SplitText('.reveal-title', {
      type: 'words, chars',
      autoSplit: true,
      mask: 'chars',
      charsClass: 'char',
      onSplit: (self) => {
        gsap.set(self.elements, { opacity: 1 });
        return gsap.from(self.chars, {
          duration: 1, yPercent: -120, scale: 1.2,
          stagger: 0.01, ease: 'expo.out',
          scrollTrigger: { trigger: self.elements[0], start: 'top 88%', once: true },
        });
      },
    });

    // Paragraph
    new SplitText('.reveal-paragraph', {
      type: 'lines, words',
      autoSplit: true,
      mask: 'lines',
      linesClass: 'line',
      onSplit: (self) => {
        gsap.set(self.elements, { opacity: 1 });
        return gsap.from(self.lines, {
          duration: 0.9, yPercent: 105,
          stagger: 0.04, ease: 'expo.out',
          scrollTrigger: { trigger: self.elements[0], start: 'top 88%', once: true },
        });
      },
    });
  </script>

</body>
</html>
```

---

## Practice exercises (do these in order)

1. **Implement the minimal example above** from scratch without looking — title + paragraph revealing on scroll.
2. **Change `yPercent: -120` to `yPercent: 120`** on the title — what changes visually? Why?
3. **Remove the `return`** from `onSplit` — resize the window and watch it break. Put it back.
4. **Move `scrollTrigger` outside `onSplit`** — resize and observe what happens.
5. **Add `opacity: 0` start** to the `gsap.from` instead of hiding with CSS — spot the flash of unsplit text.
6. **Try `mask: "words"`** on a title — what does the reveal look like?
7. **Replace `once: true` with `toggleActions: "play none none reverse"`** — the animation reverses on scroll up.
8. **Wrap the two `new SplitText(...)` calls in a class** called `TextReveal` with a `destroy()` method that calls `this.split.revert()`.
