<script setup lang="ts">
import { ref } from "vue";
import type {
    GraffitiObjectBase,
    GraffitiSession,
    JSONSchema,
} from "@graffiti-garden/api";
import { useGraffiti } from "@graffiti-garden/wrapper-vue";

const props = defineProps<{
    url: string;
    commentBoxOpen: boolean;
}>();

const commentSchema = {
    properties: {
        value: {
            required: ["content", "inReplyTo", "createdAt"],
            properties: {
                content: { type: "string" },
                inReplyTo: {
                    enum: [props.url],
                },
                createdAt: { type: "number" },
            },
        },
    },
} as const satisfies JSONSchema;

const graffiti = useGraffiti();

const content = ref("");
const commenting = ref(false);
async function postComment(session: GraffitiSession) {
    commenting.value = true;
    await graffiti.put<typeof commentSchema>(
        {
            value: {
                content: content.value,
                createdAt: new Date().getTime(),
                inReplyTo: props.url,
            },
            channels: [props.url],
        },
        session,
    );
    commenting.value = false;
    content.value = "";
}

async function deleteComment(
    comment: GraffitiObjectBase,
    session: GraffitiSession,
) {
    confirm(
        "Are you sure you want to delete this reply? It cannot be undone.",
    ) && graffiti.delete(comment, session);
}

const openCommentBoxes = ref<Map<string, boolean>>(new Map());
</script>

<template>
    <section>
        <template v-if="commentBoxOpen">
            <template v-if="!$graffitiSession.value">
                <button @click="$graffiti.login()">Log in to comment</button>
            </template>
            <form v-else @submit.prevent="postComment($graffitiSession.value)">
                <textarea
                    id="comment"
                    type="text"
                    v-model="content"
                    placeholder="My reply..."
                    aria-label="Comment"
                ></textarea>
                <input
                    type="submit"
                    :value="commenting ? 'Posting...' : 'Post Reply'"
                    :disabled="commenting"
                />
            </form>
        </template>
        <GraffitiDiscover
            :channels="[url]"
            :schema="commentSchema"
            v-slot="{ results: comments }"
        >
            <ul>
                <li
                    v-for="comment in comments.toSorted(
                        (a, b) => b.value.createdAt - a.value.createdAt,
                    )"
                    :key="comment.url"
                >
                    <article>
                        <header>
                            <h3>{{ comment.actor }}</h3>
                            <p>
                                {{
                                    new Date(
                                        comment.value.createdAt,
                                    ).toLocaleString()
                                }}
                            </p>
                        </header>
                        <main>
                            {{ comment.value.content }}
                        </main>
                        <footer>
                            <nav>
                                <ul>
                                    <li>
                                        <button
                                            v-if="
                                                $graffitiSession.value
                                                    ?.actor === comment.actor
                                            "
                                            @click="
                                                deleteComment(
                                                    comment,
                                                    $graffitiSession.value,
                                                )
                                            "
                                        >
                                            Delete
                                        </button>
                                    </li>
                                    <li>
                                        <button
                                            @click="
                                                openCommentBoxes.set(
                                                    comment.url,
                                                    true,
                                                )
                                            "
                                        >
                                            Reply
                                        </button>
                                    </li>
                                </ul>
                            </nav>
                        </footer>
                    </article>
                    <Replies
                        class="nested-comments"
                        :url="comment.url"
                        :commentBoxOpen="
                            openCommentBoxes.get(comment.url) ?? false
                        "
                    />
                </li>
            </ul>
        </GraffitiDiscover>
    </section>
</template>

<style scoped>
ul {
    padding: 0;
}

li {
    list-style: none;
}

.nested-comments {
    border-left: 1px solid #ccc;
    padding-left: 2rem;
}
</style>
