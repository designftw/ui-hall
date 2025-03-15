<script setup lang="ts">
import { ref } from "vue";
import type {
    GraffitiObject,
    GraffitiObjectBase,
    GraffitiSession,
} from "@graffiti-garden/api";
import { useGraffiti } from "@graffiti-garden/wrapper-vue";
import { channels, submissionSchema } from "./schemas";
import LikeButton from "./likes/LikeButton.vue";
import { useLikeCount } from "./likes/composables";
import { useRouter } from "vue-router";
import markdownit from "markdown-it";
import GraffitiGetFile from "./files/GetFile.vue";
import Replies from "./Replies.vue";

const props = defineProps<{
    url: string;
}>();

const likeCount = useLikeCount(
    () => props.url,
    () => [props.url, ...channels],
);

const graffiti = useGraffiti();
const router = useRouter();

async function editSubmission(
    submission: GraffitiObject<typeof submissionSchema>,
) {
    router.push({
        name: "submit",
        params: { submissionToEdit: JSON.stringify(submission) },
    });
}

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

    try {
        await graffiti.delete(submission, session);
    } catch {
        return alert("Failed to delete submission.");
    }
    router.push({ name: "gallery" });
}

const md = markdownit({
    html: true,
    linkify: true,
});

const imageIndex = ref(0);
</script>

<template>
    <GraffitiGet
        :url="url"
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
                    <RouterLink
                        :to="{
                            name: 'submission',
                            params: { url: submission.url },
                        }"
                    >
                        {{ submission.value.title }}
                    </RouterLink>
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
                    Liked by <strong>{{ likeCount }}</strong>
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

                <nav>
                    <ul>
                        <li>
                            <LikeButton
                                :target="url"
                                :channels="[url, ...channels]"
                            />
                        </li>
                        <template
                            v-if="
                                submission.actor ===
                                $graffitiSession.value?.actor
                            "
                        >
                            <li>
                                <button @click="editSubmission(submission)">
                                    Edit submission
                                </button>
                            </li>
                            <li>
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
                        </template>
                    </ul>
                </nav>
            </header>

            <main>
                <section
                    class="image-gallery"
                    v-if="submission.value.images?.length"
                >
                    <button
                        v-if="submission.value.images.length > 1"
                        @click="
                            imageIndex =
                                (imageIndex -
                                    1 +
                                    submission.value.images.length) %
                                submission.value.images.length
                        "
                    >
                        ◀️
                    </button>
                    <GraffitiGetFile
                        :url="submission.value.images[imageIndex].graffitiFile"
                        v-slot="{ fileUrl }"
                    >
                        <figure>
                            <img
                                :src="fileUrl ?? undefined"
                                :alt="submission.value.images[imageIndex].alt"
                            />
                        </figure>
                    </GraffitiGetFile>
                    <button
                        v-if="submission.value.images.length > 1"
                        @click="
                            imageIndex =
                                (imageIndex + 1) %
                                submission.value.images.length
                        "
                    >
                        ▶️
                    </button>
                </section>
                <section v-html="md.render(submission.value.content)"></section>
            </main>
        </article>
        <h2>Replies</h2>
        <Replies :url="url" :comment-box-open="true" />
    </GraffitiGet>
</template>

<style scoped>
.image-gallery {
    display: flex;
    padding-bottom: 1rem;

    img {
        flex: 1 1 auto;
        max-width: 100%;
    }

    button {
        flex: 0 0 auto;
        padding-left: 0.25rem;
        padding-right: 0.25rem;
    }
}
</style>
