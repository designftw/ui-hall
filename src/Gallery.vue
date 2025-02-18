<script setup lang="ts">
import FameOrShame from "./FameOrShame.vue";
import { computed } from "vue";
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
    <ul>
        <li>
            <RouterLink to="submit"> Submit a new entry! </RouterLink>
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
                <h2>
                    <FameOrShame :tags="submission.value.tags" />
                    {{ submission.value.title }}
                    <FameOrShame :tags="submission.value.tags" />
                </h2>

                <p>By: {{ submission.actor }}</p>
                <p>
                    Likes:
                    {{
                        likeCountPerTarget.get(
                            $graffiti.objectToUri(submission),
                        ) ?? 0
                    }}
                </p>
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
    align-items: center;
    justify-content: center;
}

ul {
    > li {
        border: 1px solid #ccc;
        width: 15rem;
        position: relative;
    }

    li {
        img {
            width: 100%;
            height: auto;
        }

        > a {
            display: block;
            padding: 1rem;
            text-decoration: none;
            color: inherit;
            text-align: center;
            transition:
                background-color 0.2s ease,
                box-shadow 0.2s ease;
        }

        > a:hover {
            background-color: rgba(255, 255, 255, 0.05);
            box-shadow: 0.2rem 0.2rem 0 #ccc;
        }
    }
}
</style>
