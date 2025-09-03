import {
  brotliDecompressSync,
  gzipSync,
  gunzipSync,
  constants,
  brotliCompressSync,
} from "zlib";

export const compressTest = (
  code: string,
  algo: "br" | "gzip" = "br"
): Buffer => {
  const input = Buffer.from(code, "utf-8");
  if (algo === "br") {
    return brotliCompressSync(input, {
      params: {
        [constants.BROTLI_PARAM_MODE]: constants.BROTLI_MODE_TEXT,
        [constants.BROTLI_PARAM_QUALITY]: 6,
      },
    });
  }

  return gzipSync(input, { level: 6 });
};

export function decompressTest(buf: Buffer, algo: "br" | "gzip"): string {
  return algo === "br"
    ? brotliDecompressSync(buf).toString("utf-8")
    : gunzipSync(buf).toString("utf-8");
}