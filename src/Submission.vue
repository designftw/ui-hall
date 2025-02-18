<script setup lang="ts">
import { ref } from "vue";
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

const imageIndex = ref(0);
</script>

<template>
    <GraffitiGet
        :locationOrUri="uri"
        :schema="submissionSchema"
        v-slot="{ result: submission }"
    >
        <article v-if="!submission">
            <header>
                <h1 v-if="submission === undefined">Loading...</h1>
                <h1 v-else>Not found.</h1>
            </header>
        </article>
        <article
            v-else
            :class="
                submission.value.tags.includes('fame')
                    ? 'fame'
                    : submission.value.tags.includes('shame')
                      ? 'shame'
                      : ''
            "
        >
            <header>
                <h1>
                    {{ submission.value.title }}
                </h1>
                <p>By {{ submission.actor }}</p>
                <p>
                    Posted
                    <time
                        :datetime="
                            new Date(submission.value.createdAt).toISOString()
                        "
                    >
                        {{
                            new Date(submission.value.createdAt).toLocaleString(
                                undefined,
                                {
                                    month: "long",
                                    day: "numeric",
                                    year: "numeric",
                                    hour: "numeric",
                                    minute: "numeric",
                                },
                            )
                        }}
                    </time>
                </p>
                <p>
                    Liked by {{ likeCount }}
                    {{ likeCount === 1 ? "person" : "people" }}
                </p>
                <p class="visually-hidden">
                    {{
                        submission.value.tags.includes("fame")
                            ? "Fame"
                            : submission.value.tags.includes("shame")
                              ? "Shame"
                              : ""
                    }}
                    submission
                </p>

                <ul>
                    <li>
                        <LikeButton
                            :target="uri"
                            :channels="[uri, ...channels]"
                        />
                    </li>
                    <li
                        v-if="
                            submission.actor === $graffitiSession.value?.actor
                        "
                    >
                        <button
                            @click="
                                deleteSubmission(
                                    submission,
                                    $graffitiSession.value,
                                )
                            "
                        >
                            Delete submission
                        </button>
                    </li>
                </ul>

                <figure v-if="submission.value.images?.length">
                    <GraffitiGetFile
                        :locationOrUri="
                            submission.value.images[imageIndex].graffitiFile
                        "
                        v-slot="{ fileUrl }"
                    >
                        <img
                            :src="fileUrl ?? undefined"
                            :alt="submission.value.images[imageIndex].alt"
                        />
                    </GraffitiGetFile>
                    <button
                        @click="
                            imageIndex =
                                (imageIndex -
                                    1 +
                                    submission.value.images.length) %
                                submission.value.images.length
                        "
                    >
                        Previous image
                    </button>
                    <button
                        @click="
                            imageIndex =
                                (imageIndex + 1) %
                                submission.value.images.length
                        "
                    >
                        Next image
                    </button>
                </figure>
            </header>

            <main v-html="md.render(submission.value.content)"></main>
        </article>
    </GraffitiGet>
</template>

<style scoped>
article {
    width: 30em;
    margin: 0 auto;
    padding: 1em;

    img {
        max-width: 100%;
        height: auto;
    }

    header > ul {
        display: flex;
        gap: 1em;
        list-style-type: none;
    }
}
</style>
