<script setup lang="ts">
import { computed, ref } from "vue";
import { useGraffiti, useGraffitiDiscover } from "@graffiti-garden/wrapper-vue";
import { channels, submissionSchema } from "./schemas";
import { useLikeCountPerTarget } from "./likes/composables";
import GraffitiGetFile from "./files/GetFile.vue";

const { results: submissions, isPolling: isPollingSubmissions } =
    useGraffitiDiscover(channels, submissionSchema);

const likeCountPerTarget = useLikeCountPerTarget(
    () => submissions.value.map<string>((s) => s.url),
    channels,
);

const sort = ref("likes");
const showMe = ref<Set<"fame" | "shame">>(new Set(["fame", "shame"]));

const submissionsFiltered = computed(() =>
    submissions.value.filter(
        (submission) =>
            (showMe.value.has("fame") &&
                submission.value.tags.includes("fame")) ||
            (showMe.value.has("shame") &&
                submission.value.tags.includes("shame")),
    ),
);

const submissionsSorted = computed(() =>
    submissionsFiltered.value.toSorted((a, b) => {
        const timeDifference = b.value.createdAt - a.value.createdAt;
        if (sort.value === "date") return timeDifference;
        const aLikes = likeCountPerTarget.value.get(a.url) ?? 0;
        const bLikes = likeCountPerTarget.value.get(b.url) ?? 0;
        if (aLikes !== bLikes) return bLikes - aLikes;
        return timeDifference;
    }),
);
</script>

<template>
    <section>
        <fieldset>
            <legend>Sort by:</legend>
            <input type="radio" id="likes" value="likes" v-model="sort" />
            <label for="likes"> Likes </label>
            <input type="radio" id="date" value="date" v-model="sort" />
            <label for="date"> Date </label>
        </fieldset>

        <fieldset>
            <legend>Show me:</legend>
            <input type="checkbox" id="fame" value="fame" v-model="showMe" />
            <label for="fame"> Fame ⭐️ </label>
            <input type="checkbox" id="shame" value="shame" v-model="showMe" />
            <label for="shame"> Shame 😱 </label>
        </fieldset>
    </section>

    <ul>
        <li>
            <article>
                <h2>
                    <RouterLink to="submit"> Submit a new entry! </RouterLink>
                </h2>
            </article>
        </li>
        <li
            v-for="submission in submissionsSorted"
            :key="submission.url"
            :class="
                submission.value.tags.includes('fame')
                    ? 'fame'
                    : submission.value.tags.includes('shame')
                      ? 'shame'
                      : ''
            "
        >
            <article>
                <h2>
                    <RouterLink
                        :to="{
                            name: 'submission',
                            params: { url: submission.url },
                        }"
                    >
                        {{ submission.value.title }}
                    </RouterLink>
                </h2>
                <p>By {{ submission.actor }}</p>
                <p>
                    Likes:
                    {{ likeCountPerTarget.get(submission.url) ?? 0 }}
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
                <template v-if="submission.value.images?.length">
                    <GraffitiGetFile
                        :url="submission.value.images[0].graffitiFile"
                        v-slot="{ fileUrl }"
                    >
                        <img
                            v-if="fileUrl"
                            :src="fileUrl"
                            :alt="submission.value.images[0].alt"
                        />
                    </GraffitiGetFile>
                </template>
            </article>
        </li>
        <li v-if="isPollingSubmissions">
            <article>
                <h2>Loading...</h2>
            </article>
        </li>
    </ul>
</template>

<style scoped>
ul {
    display: flex;
    flex-wrap: wrap;
    gap: 2rem;
    list-style: none;
    padding: 0;
    justify-content: center;
}

ul {
    > li {
        width: 20rem;
        position: relative;
        word-break: break-word;
        list-style: none;

        > article {
            height: 100%;
        }

        img {
            width: 100%;
            height: auto;
        }
    }
}
</style>
