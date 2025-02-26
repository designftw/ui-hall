<script setup lang="ts">
import { computed, ref } from "vue";
import { useGraffiti, useGraffitiDiscover } from "@graffiti-garden/wrapper-vue";
import { channels, submissionSchema } from "./schemas";
import { useLikeCountPerTarget } from "./likes/composables";
import GraffitiGetFile from "./files/GetFile.vue";

const graffiti = useGraffiti();

const { results: submissions, isPolling: isPollingSubmissions } =
    useGraffitiDiscover(channels, submissionSchema);

const likeCountPerTarget = useLikeCountPerTarget(
    () => submissions.value.map((s) => graffiti.objectToUri(s)),
    channels,
);

const sort = ref("likes");
const filter = ref("all");

const submissionsFiltered = computed(() =>
    submissions.value.filter(
        (submission) =>
            filter.value === "all" ||
            (filter.value === "fame" &&
                submission.value.tags.includes("fame")) ||
            (filter.value === "shame" &&
                submission.value.tags.includes("shame")),
    ),
);

const submissionsSorted = computed(() =>
    submissionsFiltered.value.toSorted((a, b) => {
        const timeDifference = b.value.createdAt - a.value.createdAt;
        if (sort.value === "date") return timeDifference;
        const aLikes =
            likeCountPerTarget.value.get(graffiti.objectToUri(a)) ?? 0;
        const bLikes =
            likeCountPerTarget.value.get(graffiti.objectToUri(b)) ?? 0;
        if (aLikes !== bLikes) return bLikes - aLikes;
        return timeDifference;
    }),
);
</script>

<template>
    <section>
        <label for="sort">Sort by:</label>
        <select id="sort" v-model="sort">
            <option value="likes">Likes</option>
            <option value="date">Date</option>
        </select>
        <label for="filter">Filter by:</label>
        <select id="filter" v-model="filter">
            <option value="all">All</option>
            <option value="fame">Fame</option>
            <option value="shame">Shame</option>
        </select>
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
            :key="$graffiti.objectToUri(submission)"
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
                            params: { uri: $graffiti.objectToUri(submission) },
                        }"
                    >
                        {{ submission.value.title }}
                    </RouterLink>
                </h2>
                <p>By {{ submission.actor }}</p>
                <p>
                    Likes:
                    {{
                        likeCountPerTarget.get(
                            $graffiti.objectToUri(submission),
                        ) ?? 0
                    }}
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
                        :locationOrUri="submission.value.images[0].graffitiFile"
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
        width: 15rem;
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
