/** Error uniforme de la API — mismo formato que ErrorApi en src/mocks/api.ts del frontend. */
export class ErrorApi extends Error {
  constructor(
    public codigo: number,
    mensaje: string,
  ) {
    super(mensaje);
  }
}
