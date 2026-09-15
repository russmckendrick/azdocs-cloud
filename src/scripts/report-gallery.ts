const dialog = document.querySelector<HTMLDialogElement>("[data-pdf-dialog]");
const pageButtons = [...document.querySelectorAll<HTMLButtonElement>("[data-pdf-page]")];
const pageImage = dialog?.querySelector<HTMLImageElement>("[data-pdf-image]");
const position = dialog?.querySelector<HTMLElement>("[data-pdf-position]");
const original = dialog?.querySelector<HTMLAnchorElement>("[data-pdf-original]");
const previous = dialog?.querySelector<HTMLButtonElement>("[data-pdf-previous]");
const next = dialog?.querySelector<HTMLButtonElement>("[data-pdf-next]");
let currentIndex = 0;

function showPage(index: number) {
  if (!dialog || !pageImage || !position || !original || pageButtons.length === 0) return;
  currentIndex = Math.max(0, Math.min(pageButtons.length - 1, index));
  const button = pageButtons[currentIndex];
  const page = button.dataset.page ?? String(currentIndex + 1);
  pageImage.src = button.dataset.src ?? "";
  pageImage.alt = `Azure Estate Report page ${page}`;
  position.textContent = `Page ${page} of ${pageButtons.length}`;
  original.href = button.dataset.pdfHref ?? "";
  if (previous) previous.disabled = currentIndex === 0;
  if (next) next.disabled = currentIndex === pageButtons.length - 1;
}

for (const [index, button] of pageButtons.entries()) {
  button.addEventListener("click", () => {
    showPage(index);
    dialog?.showModal();
  });
}

previous?.addEventListener("click", () => showPage(currentIndex - 1));
next?.addEventListener("click", () => showPage(currentIndex + 1));
dialog?.addEventListener("click", (event) => {
  if (event.target === dialog) dialog.close();
});
dialog?.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") showPage(currentIndex - 1);
  if (event.key === "ArrowRight") showPage(currentIndex + 1);
});
