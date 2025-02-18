import type { GraffitiFile } from "./schemas";

export async function fileToBase64(file: File) {
  return new Promise<GraffitiFile["value"]>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        reject(new Error("Expected a string"));
      } else {
        resolve({
          data: reader.result,
          name: file.name,
          mimetype: file.type,
        });
      }
    };
    reader.onerror = (error) => reject(error);
  });
}

export async function fileFromBase64(base64: GraffitiFile["value"]) {
  const response = await fetch(base64.data);
  const blob = await response.blob();
  return new File([blob], base64.name, { type: base64.mimetype });
}
