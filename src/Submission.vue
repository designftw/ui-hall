<script setup lang="ts">
import FameOrShame from "./FameOrShame.vue";
import { channels, submissionSchema } from "./schemas";
import LikeButton from "./likes/LikeButton.vue";
import { useLikeCount } from "./likes/composables";

const props = defineProps<{
    uri: string;
}>();

const likeCount = useLikeCount(
    () => props.uri,
    () => [props.uri, ...channels],
);
</script>

<template>
    <GraffitiGet
        :locationOrUri="uri"
        :schema="submissionSchema"
        v-slot="{ result }"
    >
        <h1 v-if="result === undefined">Loading...</h1>
        <h1 v-else-if="result === null">Not found.</h1>
        <template v-else>
            <h1>
                {{ result.value.title }}
            </h1>
            <h2>By {{ result.actor }}</h2>
            <FameOrShame :tags="result.value.tags" />
            <p>
                {{ result.value.content }}
            </p>

            <LikeButton :target="uri" :channels="[uri, ...channels]" />
            {{ likeCount }}
        </template>
    </GraffitiGet>
</template>
