import { beforeAll, describe, expect, it } from "vitest";

// requerirSecreto() lee process.env.CANJE_SECRET en cada llamada, así que
// alcanza con ponerla antes de importar el módulo.
beforeAll(() => {
  process.env.CANJE_SECRET = "secreto-de-pruebas-no-usar-en-produccion";
});

const { normalizarCodigo, hashCodigo, firmarSesion, verificarSesion, canjeActivo } = await import("./canje");

describe("normalizarCodigo", () => {
  it("normaliza con y sin guiones, mayúsculas y minúsculas, con o sin el prefijo SAF", () => {
    const esperado = "SAF-2345-6789";
    expect(normalizarCodigo("SAF-2345-6789")).toBe(esperado);
    expect(normalizarCodigo("saf-2345-6789")).toBe(esperado);
    expect(normalizarCodigo("SAF23456789")).toBe(esperado);
    expect(normalizarCodigo("2345-6789")).toBe(esperado);
    expect(normalizarCodigo("2345 6789")).toBe(esperado);
    expect(normalizarCodigo("  saf 2345 6789  ")).toBe(esperado);
  });

  it("rechaza caracteres confusos (0, 1, O, I, L) aunque el largo sea correcto", () => {
    expect(normalizarCodigo("SAF-0000-0000")).toBeNull();
    expect(normalizarCodigo("SAF-OOII-LL11")).toBeNull();
  });

  it("rechaza un cuerpo de largo incorrecto", () => {
    expect(normalizarCodigo("SAF-234-6789")).toBeNull();
    expect(normalizarCodigo("SAF-23456-6789")).toBeNull();
    expect(normalizarCodigo("")).toBeNull();
  });
});

describe("hashCodigo", () => {
  it("es determinístico: el mismo código da siempre el mismo hash", () => {
    const codigo = "SAF-2345-6789";
    expect(hashCodigo(codigo)).toBe(hashCodigo(codigo));
  });

  it("nunca deja ver el código en el hash", () => {
    const hash = hashCodigo("SAF-2345-6789");
    expect(hash).not.toContain("2345");
    expect(hash).not.toContain("SAF");
  });

  it("da un hex de 64 caracteres (SHA-256)", () => {
    expect(hashCodigo("SAF-2345-6789")).toMatch(/^[0-9a-f]{64}$/);
  });

  it("códigos distintos dan hashes distintos", () => {
    expect(hashCodigo("SAF-2345-6789")).not.toBe(hashCodigo("SAF-9876-5432"));
  });
});

describe("firmarSesion / verificarSesion", () => {
  it("una cookie recién firmada verifica correctamente, y devuelve los últimos 4 caracteres", () => {
    const valor = firmarSesion(hashCodigo("SAF-2345-6789"), "6789");
    expect(verificarSesion(valor)).toEqual({ valida: true, ultimos4: "6789" });
  });

  it("rechaza un valor sin firma o vacío", () => {
    expect(verificarSesion(undefined)).toEqual({ valida: false });
    expect(verificarSesion(null)).toEqual({ valida: false });
    expect(verificarSesion("")).toEqual({ valida: false });
    expect(verificarSesion("solo-payload-sin-punto")).toEqual({ valida: false });
  });

  it("rechaza si se altera el payload (cambiar el hash adentro)", () => {
    const valor = firmarSesion(hashCodigo("SAF-2345-6789"), "6789");
    const [payload, firma] = valor.split(".");
    const datos = JSON.parse(Buffer.from(payload, "base64url").toString("utf-8"));
    const payloadFalso = Buffer.from(JSON.stringify({ ...datos, hash: "otro-hash" })).toString(
      "base64url",
    );
    expect(verificarSesion(`${payloadFalso}.${firma}`).valida).toBe(false);
  });

  it("rechaza si se altera la firma", () => {
    const valor = firmarSesion(hashCodigo("SAF-2345-6789"), "6789");
    const [payload, firma] = valor.split(".");
    const firmaAlterada = firma.slice(0, -1) + (firma.at(-1) === "A" ? "B" : "A");
    expect(verificarSesion(`${payload}.${firmaAlterada}`).valida).toBe(false);
  });

  it("rechaza una cookie firmada con otro secreto", () => {
    const valor = firmarSesion(hashCodigo("SAF-2345-6789"), "6789");
    process.env.CANJE_SECRET = "otro-secreto-completamente-distinto";
    try {
      expect(verificarSesion(valor).valida).toBe(false);
    } finally {
      process.env.CANJE_SECRET = "secreto-de-pruebas-no-usar-en-produccion";
    }
  });

  it("acepta una sesión emitida hace 59 días y rechaza una de 61 días (60 días de duración)", () => {
    const ahora = Date.now();
    const hace59Dias = ahora - 59 * 24 * 60 * 60 * 1000;
    const hace61Dias = ahora - 61 * 24 * 60 * 60 * 1000;

    const vigente = firmarSesion(hashCodigo("SAF-2345-6789"), "6789", hace59Dias);
    const vencida = firmarSesion(hashCodigo("SAF-2345-6789"), "6789", hace61Dias);

    expect(verificarSesion(vigente, ahora).valida).toBe(true);
    expect(verificarSesion(vencida, ahora).valida).toBe(false);
  });
});

describe("canjeActivo", () => {
  it("no está activo antes del horario de inicio del evento", () => {
    expect(canjeActivo(new Date("2026-10-10T13:59:59-05:00"))).toBe(false);
  });

  it("está activo desde el horario de inicio del evento (2:00 p.m. hora de Lima)", () => {
    expect(canjeActivo(new Date("2026-10-10T19:00:00Z"))).toBe(true); // 14:00 -05:00 = 19:00 UTC
    expect(canjeActivo(new Date("2026-10-11T00:00:00Z"))).toBe(true);
  });
});
