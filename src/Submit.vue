<script setup lang="ts">
import { ref, type Ref } from "vue";
import type { GraffitiSession } from "@graffiti-garden/api";
import { useGraffiti } from "@graffiti-garden/wrapper-vue";
import { channels, submissionSchema } from "./schemas";
import { useRouter } from "vue-router";

const router = useRouter();

const title = ref("");
const content = ref("");
const url = ref("");
const fameOrShame: Ref<"fame" | "shame" | undefined> = ref();
// const attachments: Ref<Submission["value"]["attachment"]> = ref([]);

const graffiti = useGraffiti();

const isPutting = ref(false);
async function submit(session: GraffitiSession) {
    if (!title.value || !content.value || !fameOrShame.value) {
        return alert("Please fill out all required fields.");
    }

    isPutting.value = true;
    await graffiti.put<typeof submissionSchema>(
        {
            value: {
                title: title.value,
                content: content.value,
                urls: [url.value],
                tags: [fameOrShame.value],
                createdAt: new Date().getTime(),
            },
            channels,
        },
        session,
    );
    isPutting.value = false;
    router.push({ name: "gallery" });
}
</script>

<template>
    <RouterLink :to="{ name: 'gallery' }">Back to gallery</RouterLink>
    <p v-if="!$graffitiSession.value">
        You must be logged in to submit a shame/fame entry.
        <button @click="$graffiti.login()">Log in</button>
    </p>
    <form v-else @submit.prevent="submit($graffitiSession.value)">
        <p>
            You are posting as {{ $graffitiSession.value.actor }}.
            <button @click="$graffiti.logout($graffitiSession.value)">
                Log out
            </button>
        </p>

        <label for="title">Title</label>
        <input id="title" v-model="title" required />

        <label for="content">Content</label>
        <textarea id="content" v-model="content" required />

        <label for="url">URL</label>
        <input id="url" v-model="url" type="url" />

        <fieldset>
            <legend>Fame or Shame?</legend>

            <input
                name="fameOrShame"
                id="fame"
                type="radio"
                v-model="fameOrShame"
                value="fame"
                required
            />
            <label for="fame">Fame</label>
            <input
                name="fameOrShame"
                id="shame"
                type="radio"
                v-model="fameOrShame"
                value="shame"
            />
            <label for="shame">Shame</label>
        </fieldset>

        <input type="submit" :value="isPutting ? 'Submitting...' : 'Submit'" />
    </form>
</template>

<style></style>
