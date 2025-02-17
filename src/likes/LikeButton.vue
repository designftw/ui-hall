<script setup lang="ts">
import { ref } from "vue";
import type { GraffitiSession } from "@graffiti-garden/api";
import { useGraffiti } from "@graffiti-garden/wrapper-vue";
import { likeSchema, type Like } from "./schemas";

const props = defineProps<{
    target: string;
    channels: string[];
}>();

const graffiti = useGraffiti();

const isLiking = ref(false);

async function like(session: GraffitiSession) {
    isLiking.value = true;
    await graffiti.put<ReturnType<typeof likeSchema>>(
        {
            value: {
                activity: "like",
                target: props.target,
            },
            channels: props.channels,
        },
        session,
    );
    isLiking.value = false;
}

async function unlike(likes: Like[], session: GraffitiSession) {
    isLiking.value = true;
    const promises = likes.map((like) => graffiti.delete(like, session));
    await Promise.all(promises);
    isLiking.value = false;
}
</script>

<template>
    <button v-if="!$graffitiSession.value" @click="$graffiti.login()">
        <slot name="login">Log in to like</slot>
    </button>
    <GraffitiDiscover
        v-else
        :channels="channels"
        :schema="
            likeSchema({
                targets: [props.target],
                actors: [$graffitiSession.value.actor],
            })
        "
        v-slot="{ results: likes, isPolling }"
    >
        <button v-if="isPolling || isLiking" disabled>
            <slot name="loading">Loading...</slot>
        </button>
        <button
            v-else-if="likes.length"
            @click="unlike(likes, $graffitiSession.value)"
        >
            <slot name="unlike">Unlike</slot>
        </button>
        <button v-else @click="like($graffitiSession.value)">
            <slot name="like">Like</slot>
        </button>
    </GraffitiDiscover>
</template>
