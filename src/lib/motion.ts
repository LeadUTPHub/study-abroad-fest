// Animación 3 (design/canvas/Animaciones.dc.html): las paradas del
// cronograma se pegan como recortes, escalonadas, la primera vez que
// entran en pantalla.
//
// Progressive enhancement estricto: por defecto (sin este script, con
// prefers-reduced-motion, o si el navegador no soporta
// IntersectionObserver) los elementos quedan completamente visibles.
// Regla de la guía de animaciones: "las secciones siempre se ven
// completas sin animación. Una parada nunca queda en opacity: 0
// esperando el scroll."
//
// Uso: agrega `data-motion-stop` (y opcionalmente `data-motion-delay`,
// en milisegundos, para escalonar) a cada elemento que deba animarse.

const STAGGER_MS = 150;

export function armMotionStops(root: ParentNode = document): void {
  if (typeof window === "undefined") return;
  if (!("IntersectionObserver" in window)) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const stops = Array.from(root.querySelectorAll<HTMLElement>("[data-motion-stop]"));
  if (stops.length === 0) return;

  stops.forEach((el, i) => {
    const delay = el.dataset.motionDelay ?? String(i * STAGGER_MS);
    el.style.animationDelay = `${delay}ms`;
    el.classList.add("motion-armed");
  });

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("motion-visible");
        observer.unobserve(entry.target);
      }
    },
    { threshold: 0.2, rootMargin: "0px 0px -10% 0px" },
  );

  stops.forEach((el) => observer.observe(el));
}
