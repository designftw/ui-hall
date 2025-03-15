import type { GraffitiObjectUrl, GraffitiSession } from "@graffiti-garden/api";
import { useGraffitiGet } from "@graffiti-garden/wrapper-vue";
import { ref, type Ref, watch, computed, type MaybeRefOrGetter } from "vue";
import { fileFromBase64 } from "./utils";
import { fileSchema } from "./schemas";

export function useGraffitiGetFile(
  url: MaybeRefOrGetter<GraffitiObjectUrl | string>,
  session?: MaybeRefOrGetter<GraffitiSession | undefined | null>,
) {
  const { result, poll, isPolling } = useGraffitiGet(url, fileSchema, session);

  const file: Ref<File | undefined | null> = ref();
  watch(result, async (value) => {
    file.value = value ? await fileFromBase64(value.value) : value;
  });

  const fileUrl = computed(() => {
    if (!file.value) return file.value;
    return URL.createObjectURL(file.value);
  });

  return { file, fileUrl, poll, isPolling };
}
