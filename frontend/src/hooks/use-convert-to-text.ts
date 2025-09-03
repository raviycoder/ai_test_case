import { ungzip } from "pako";



export const convertToText = (byteArray: { data: number[] }, algo: "gzip" | "br" = "gzip"): string => {
    try {
        // Convert byte array to Uint8Array
        const uint8Array = new Uint8Array(byteArray.data);
        
        // DECOMPRESS the bytes first
        let decompressed: Uint8Array;
        if (algo === "gzip") {
            decompressed = ungzip(uint8Array);
        } else if (algo === "br") {
            // For brotli, you'd need: npm i brotli-wasm
            throw new Error("Brotli not implemented - use gzip or handle server-side");
        } else {
            throw new Error(`Unknown algorithm: ${algo}`);
        }
        
        // THEN convert decompressed bytes to string
        return new TextDecoder('utf-8').decode(decompressed);
    } catch (error) {
        console.error("Error decompressing/converting to text:", error);
        return "";
    }
};