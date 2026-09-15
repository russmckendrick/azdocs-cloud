const story = document.querySelector<HTMLElement>("[data-product-story]");
const frame = story?.querySelector<HTMLIFrameElement>("[data-demo-frame]");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

if (story && frame) {
  const scenes: Array<{ id: string; label: string }> = [
    { id: "overview", label: "Overview" },
    { id: "map", label: "Map" },
    { id: "findings", label: "Findings" },
    { id: "inventory", label: "Inventory" },
  ];
  let activeScene = "";
  let animationFrame = 0;

  const openDesktopView = (label: string) => {
    try {
      const buttons = frame.contentDocument?.querySelectorAll<HTMLButtonElement>(".side-nav .nav-row");
      if (!buttons) return false;
      for (const button of buttons) {
        if (button.title.trim().toLowerCase() === label.toLowerCase()) {
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
    const sceneIndex = progress < .34 ? 0 : progress < .56 ? 1 : progress < .78 ? 2 : 3;
    const scene = scenes[sceneIndex];

    story.dataset.scene = scene.id;
    story.style.setProperty("--story-progress", progress.toFixed(4));
    story.style.setProperty("--intro-out", segment(progress, .025, .15).toFixed(4));
    story.style.setProperty("--frame-in", frameIn.toFixed(4));
    story.style.setProperty("--explode", segment(progress, .13, .42).toFixed(4));

    if (activeScene !== scene.id && openDesktopView(scene.label)) activeScene = scene.id;
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
