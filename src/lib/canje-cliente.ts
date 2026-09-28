// Comportamiento cliente de /canje (design/canvas/Canje-Mobile.dc.html).
// Progressive enhancement: sin este script, el formulario sigue
// visible y funcional (POST /api/canje ya valida todo en el servidor);
// esto solo mejora la experiencia (avisos tempranos, normalización en
// vivo, animación 11 al fallar).

const MENSAJES: Record<string, string> = {
  invalido: "Ese código no es válido. Revisa que esté completo, con el formato SAF-XXXX-XXXX.",
  dispositivos: "Este código ya se activó en 3 dispositivos. Acércate a la mesa de canje.",
  "no-disponible": "El canje todavía no está disponible. Vuelve el día del evento.",
  intentos: "Demasiados intentos seguidos. Espera unos minutos y vuelve a intentarlo.",
  formato: "Algo salió mal. Revisa tu código e inténtalo de nuevo.",
};

export function armarFormularioCodigo(): void {
  const raiz = document.getElementById("canje-raiz");
  const form = document.getElementById("form-codigo") as HTMLFormElement | null;
  const input = document.getElementById("codigo") as HTMLInputElement | null;
  const errorEl = document.getElementById("codigo-error");
  if (!raiz || !form || !input || !errorEl) return;

  const reducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // --- Ventanas de tiempo (activación y fin del evento) ---
  const activacion = new Date(raiz.dataset.activacion ?? "").getTime();
  const finEvento = new Date(raiz.dataset.finEvento ?? "").getTime();
  const ahora = Date.now();

  if (Number.isFinite(activacion) && ahora < activacion) {
    document.getElementById("canje-formulario")?.setAttribute("hidden", "");
    document.getElementById("canje-no-disponible")?.removeAttribute("hidden");
  }
  if (Number.isFinite(finEvento) && ahora > finEvento) {
    document.getElementById("canje-ayuda-antes")?.setAttribute("hidden", "");
    document.getElementById("canje-ayuda-despues")?.removeAttribute("hidden");
  }

  // --- Prellenar desde ?c= (PLAN.md, Fase 5, punto 4) ---
  const desdeQuery = new URLSearchParams(window.location.search).get("c");
  if (desdeQuery) input.value = desdeQuery.toUpperCase();

  // --- Mayúsculas en vivo mientras se escribe ---
  input.addEventListener("input", () => {
    const cursor = input.selectionStart;
    input.value = input.value.toUpperCase();
    if (cursor !== null) input.setSelectionRange(cursor, cursor);
    ocultarError();
  });

  function mostrarError(codigo: string) {
    errorEl!.textContent = MENSAJES[codigo] ?? MENSAJES.formato;
    errorEl!.classList.remove("hidden");
    input!.style.borderColor = "#B0126F";
    input!.setAttribute("aria-invalid", "true");
    if (!reducido) {
      form!.classList.remove("field-shake");
      void form!.offsetWidth;
      form!.classList.add("field-shake");
    }
  }

  function ocultarError() {
    errorEl!.classList.add("hidden");
    input!.style.borderColor = "";
    input!.removeAttribute("aria-invalid");
  }

  form.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    const boton = form.querySelector('button[type="submit"]') as HTMLButtonElement | null;
    if (boton) boton.disabled = true;
    ocultarError();

    try {
      const respuesta = await fetch("/api/canje", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codigo: input.value }),
      });
      const datos = await respuesta.json().catch(() => ({}));

      if (respuesta.ok && datos.ok) {
        window.location.href = "/mi-calendario";
        return;
      }
      mostrarError(typeof datos.error === "string" ? datos.error : "formato");
    } catch {
      mostrarError("formato");
    } finally {
      if (boton) boton.disabled = false;
    }
  });
}
