<script setup lang="ts">
import type { GraffitiLocation, GraffitiSession } from "@graffiti-garden/api";
import { useGraffitiGetFile } from "./composables";

const props = defineProps<{
    locationOrUri: string | GraffitiLocation;
    session?: GraffitiSession | null;
}>();

defineSlots<{
    default?(props: {
        file: File | undefined | null;
        fileUrl: string | undefined | null;
        poll: () => void;
        isPolling: boolean;
    }): any;
}>();

const { file, fileUrl, poll, isPolling } = useGraffitiGetFile(
    () => props.locationOrUri,
    () => props.session,
);
</script>

<template>
    <slot
        :file="file"
        :fileUrl="fileUrl"
        :poll="poll"
        :isPolling="isPolling"
    ></slot>
</template>
