const story = document.querySelector<HTMLElement>("[data-product-story]");
const frame = story?.querySelector<HTMLIFrameElement>("[data-demo-frame]");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

if (story && frame) {
  // Desktop view ids and the nav labels the embedded build ships (ProductStory.astro).
  const scenes: Array<{ view: string; label: string }> = JSON.parse(frame.dataset.storyScenes ?? "[]");
  const copies = story.querySelectorAll<HTMLElement>("[data-copy-scene]");
  let activeScene = "";
  let animationFrame = 0;

  const openDesktopView = (label: string) => {
    try {
      const buttons = frame.contentDocument?.querySelectorAll<HTMLButtonElement>(".side-nav .nav-row");
      if (!buttons) return false;
      const wanted = label.trim().toLowerCase();
      for (const button of buttons) {
        // The visible text is the bare label; the title can carry a badge
        // suffix such as "Findings · 2 high-severity".
        const text = (button.querySelector("span")?.textContent ?? button.title).trim().toLowerCase();
        if (text === wanted) {
          button.click();
          return true;
        }
      }
    } catch {
      // The frame remains a complete preview if scripted navigation is unavailable.
    }
    return false;
  };

  const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));
  const segment = (value: number, from: number, to: number) => clamp((value - from) / (to - from));

  const render = () => {
    animationFrame = 0;
    const bounds = story.getBoundingClientRect();
    const distance = Math.max(1, story.offsetHeight - window.innerHeight);
    const progress = reduceMotion.matches ? 1 : clamp(-bounds.top / distance);
    const frameIn = segment(progress, .05, .2);
    // The first scene holds while the window assembles; the rest share the remainder evenly.
    const step = .66 / Math.max(1, scenes.length - 1);
    const sceneIndex = progress < .34 ? 0 : Math.min(scenes.length - 1, 1 + Math.floor((progress - .34) / step));
    const scene = scenes[sceneIndex];
    if (!scene) return;

    if (story.dataset.scene !== scene.view) {
      story.dataset.scene = scene.view;
      for (const copy of copies) copy.toggleAttribute("data-active", copy.dataset.copyScene === scene.view);
    }
    story.style.setProperty("--story-progress", progress.toFixed(4));
    story.style.setProperty("--intro-out", segment(progress, .025, .15).toFixed(4));
    story.style.setProperty("--frame-in", frameIn.toFixed(4));
    story.style.setProperty("--explode", segment(progress, .13, .42).toFixed(4));

    if (activeScene !== scene.view && openDesktopView(scene.label)) activeScene = scene.view;
  };

  const requestRender = () => {
    if (!animationFrame) animationFrame = requestAnimationFrame(render);
  };

  frame.addEventListener("load", () => {
    try {
      frame.contentDocument?.documentElement.setAttribute("data-theme", "dark");
      frame.contentWindow?.localStorage.setItem("azdocs-theme", "dark");
    } catch {
      // The generated document also pins dark mode before its first paint.
    }
    activeScene = "";
    render();
    window.setTimeout(render, 180);
  });
  window.addEventListener("scroll", requestRender, { passive: true });
  window.addEventListener("resize", requestRender, { passive: true });
  reduceMotion.addEventListener("change", requestRender);
  render();
}
