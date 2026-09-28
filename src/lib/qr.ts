import QRCode from "qrcode";

/**
 * Genera un QR como SVG inline, sin servicios externos (PLAN.md: "QR
 * generados localmente"). Se usa con `<Fragment set:html={svg} />`
 * porque el contenido lo generamos nosotros mismos, no es entrada de
 * usuario.
 */
export async function qrSvg(texto: string): Promise<string> {
  return QRCode.toString(texto, {
    type: "svg",
    margin: 0,
    color: { dark: "#1D2152", light: "#FDFEFC" },
  });
}
