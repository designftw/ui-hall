<script setup lang="ts">
import FameOrShame from "./FameOrShame.vue";
import { computed } from "vue";
import { useGraffiti, useGraffitiDiscover } from "@graffiti-garden/wrapper-vue";
import { channels, submissionSchema } from "./schemas";
import { useLikeCountPerTarget } from "./likes/composables";

const graffiti = useGraffiti();

const {
    results: submissions,
    poll: pollSubmissions,
    isPolling: isPollingSubmissions,
} = useGraffitiDiscover(channels, submissionSchema);

const likeCountPerTarget = useLikeCountPerTarget(
    () => submissions.value.map((s) => graffiti.objectToUri(s)),
    channels,
);

const submissionsSorted = computed(() =>
    submissions.value.toSorted((a, b) => {
        const aLikes =
            likeCountPerTarget.value.get(graffiti.objectToUri(a)) ?? 0;
        const bLikes =
            likeCountPerTarget.value.get(graffiti.objectToUri(b)) ?? 0;
        if (aLikes !== bLikes) return bLikes - aLikes;
        return b.value.createdAt - a.value.createdAt;
    }),
);
</script>

<template>
    <button @click="pollSubmissions" :disabled="isPollingSubmissions">
        {{ isPollingSubmissions ? "Refreshing..." : "Refresh" }}
    </button>
    <ul>
        <li>
            <RouterLink to="submit"> Submit a new entry </RouterLink>
        </li>
        <li
            v-for="submission in submissionsSorted"
            :key="$graffiti.objectToUri(submission)"
        >
            <RouterLink
                :to="{
                    name: 'submission',
                    params: { uri: $graffiti.objectToUri(submission) },
                }"
            >
                <h2>
                    {{ submission.value.title }}
                </h2>
                <h3>
                    {{ submission.actor }}
                </h3>
                <h4>
                    Likes:
                    {{
                        likeCountPerTarget.get(
                            $graffiti.objectToUri(submission),
                        ) ?? 0
                    }}
                </h4>
                <FameOrShame :tags="submission.value.tags" />
            </RouterLink>
        </li>
        <li v-if="isPollingSubmissions">Loading...</li>
    </ul>
</template>

<style scoped>
ul {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    list-style: none;
    padding: 0;
}

ul {
    > li {
        border: 1px solid #ccc;
        width: 15rem;
    }

    li {
        > a {
            display: block;
            padding: 1rem;
            text-decoration: none;
            color: inherit;
            text-align: center;
            transition:
                background-color 0.3s ease,
                box-shadow 0.3s ease;
        }

        > a:hover {
            background-color: rgba(255, 255, 255, 0.05);
            box-shadow: 0.2rem 0.2rem 0 #ccc;
        }
    }
}
</style>
