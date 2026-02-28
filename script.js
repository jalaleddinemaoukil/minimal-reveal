gsap.registerPlugin(SplitText, ScrollTrigger);

new SplitText(element, {
  type: "words, chars",

  autoSplit: true,

  mask: "chars",

  charClass: "char",

  onSplit: (self) => {
    gsap.from(self.elements, {
      opacity: 1,
    });

    return gsap.from(self.chars, {
      duration: 1,
      yPercent: -120,
      scale: 1.2,
      stagger: 0.01,
      ease: "expo.out",
      scrollTrigger: {
        trigger: self.element[0],
        start: "top 88%",
        once: true,
      },
    });
  },
});
