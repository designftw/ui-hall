<script setup lang="ts">
import FameOrShame from "./FameOrShame.vue";
import type { GraffitiObjectBase, GraffitiSession } from "@graffiti-garden/api";
import { useGraffiti } from "@graffiti-garden/wrapper-vue";
import { channels, submissionSchema } from "./schemas";
import LikeButton from "./likes/LikeButton.vue";
import { useLikeCount } from "./likes/composables";
import { useRouter } from "vue-router";
import markdownit from "markdown-it";
import GraffitiGetFile from "./files/GetFile.vue";

const props = defineProps<{
    uri: string;
}>();

const likeCount = useLikeCount(
    () => props.uri,
    () => [props.uri, ...channels],
);

const graffiti = useGraffiti();
const router = useRouter();
async function deleteSubmission(
    submission: GraffitiObjectBase,
    session: GraffitiSession,
) {
    if (
        !confirm(
            "Are you sure you want to delete this submission? This cannot be undone.",
        )
    ) {
        return;
    }

    await graffiti.delete(submission, session);
    router.push({ name: "gallery" });
}

const md = markdownit();
const fileToUrl = (file: File) => URL.createObjectURL(file);
</script>

<template>
    <article>
        <GraffitiGet
            :locationOrUri="uri"
            :schema="submissionSchema"
            v-slot="{ result: submission }"
        >
            <h1 v-if="submission === undefined">Loading...</h1>
            <h1 v-else-if="submission === null">Not found.</h1>
            <template v-else>
                <FameOrShame :tags="submission.value.tags" />

                <!-- Image gallery -->
                <template v-for="image in submission.value.images">
                    <GraffitiGetFile
                        :locationOrUri="image.graffitiFile"
                        v-slot="{ file }"
                    >
                        <img
                            v-if="file"
                            :src="fileToUrl(file)"
                            :alt="image.alt"
                        />
                    </GraffitiGetFile>
                </template>

                <!-- Title, author, date -->
                <h1>
                    {{ submission.value.title }}
                </h1>
                <p>By {{ submission.actor }}</p>
                <p>
                    {{ new Date(submission.value.createdAt).toLocaleString() }}
                </p>

                <div v-html="md.render(submission.value.content)"></div>

                <LikeButton :target="uri" :channels="[uri, ...channels]" />
                {{ likeCount }}
                <button
                    v-if="submission.actor === $graffitiSession.value?.actor"
                    @click="
                        deleteSubmission(submission, $graffitiSession.value)
                    "
                >
                    Delete submission
                </button>
            </template>
        </GraffitiGet>
    </article>
</template>

<style scoped>
article {
    width: 30em;
    margin: 0 auto;
    padding: 1em;
}
</style>
