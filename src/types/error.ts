/**
 * API vraća greške u DVA različita oblika (vidi ENDPOINTS.md):
 *
 *  1) Logičke greške (404 / 400-logika / 500):
 *       { "error": "not_found", "message": "Property not found" }
 *
 *  2) Schema-validacija body-ja (Zod, na POST endpointima):
 *       { "success": false, "error": { "name": "ZodError", "message": "[...]" } }
 *
 * Modeliramo ih kao discriminated union da handler mora da pokrije oba slučaja.
 */

/** Poznati `error` kodovi iz `ErrorResponse`. `string` fallback za buduće kodove. */
export type ApiErrorCode =
  | "not_found"
  | "bad_request"
  | "server_error"
  | (string & {});

/** Oblik 1 — logička greška. */
export interface ErrorResponse {
  readonly error: ApiErrorCode;
  readonly message: string;
}

/** Oblik 2 — Zod validacija. `message` je serijalizovan JSON niz issue-a. */
export interface ZodErrorResponse {
  readonly success: false;
  readonly error: {
    readonly name: "ZodError";
    readonly message: string;
  };
}

/** Bilo koji oblik greške koji API može da vrati. */
export type ApiErrorBody = ErrorResponse | ZodErrorResponse;

/** Type guard: logička greška (`{ error, message }`). */
export function isErrorResponse(body: unknown): body is ErrorResponse {
  return (
    typeof body === "object" &&
    body !== null &&
    "error" in body &&
    typeof (body as { error: unknown }).error === "string" &&
    "message" in body
  );
}

/** Type guard: Zod greška (`{ success: false, error: { name: "ZodError" } }`). */
export function isZodErrorResponse(body: unknown): body is ZodErrorResponse {
  return (
    typeof body === "object" &&
    body !== null &&
    "success" in body &&
    (body as { success: unknown }).success === false &&
    "error" in body &&
    typeof (body as { error?: { name?: unknown } }).error?.name === "string"
  );
}
