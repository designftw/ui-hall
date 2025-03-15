import type { Graffiti, GraffitiSession } from "@graffiti-garden/api";
import { fileToBase64 } from "./utils";
import { fileSchema } from "./schemas";

export async function uploadFile(
  graffiti: Graffiti,
  file: File,
  session: GraffitiSession,
) {
  const putted = await graffiti.put<typeof fileSchema>(
    {
      value: await fileToBase64(file),
      channels: [],
    },
    session,
  );
  return putted.url;
}

export { useGraffitiGetFile } from "./composables";
