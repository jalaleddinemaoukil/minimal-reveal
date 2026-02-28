gsap.registerPlugin(SplitText, ScrollTrigger);

new SplitText(".reveal-title", {
  type: "words, chars",

  autoSplit: true,

  mask: "chars",

  charsClass: "char",

  onSplit: (self) => {
    gsap.set(self.elements, { opacity: 1 });

    return gsap.from(self.chars, {
      duration: 1,
      yPercent: -120,
      scale: 1.2,
      stagger: 0.01,
      ease: "expo.out",
      scrollTrigger: {
        trigger: self.elements[0],
        start: "top 88%",
        once: true,
      },
    });
  },
});

new SplitText(".reveal-pargraph", {
  type: "lines, words",

  autoSplit: true,

  mask: "lines",

  linesClass: "line",

  onSplit: (self) => {
    gsap.set(self.elements, { opacity: 1 });

    return gsap.from(self.lines, {
      duration: 0.9,
      yPercent: 105,
      stagger: 0.04,
      ease: "expo.out",

      scrollTrigger: {
        trigger: self.elements[0],
        start: "top 88%",
        once: true,
      },
    });
  },
});
