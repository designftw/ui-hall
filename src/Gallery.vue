<script setup lang="ts">
import { useGraffitiDiscover } from "@graffiti-garden/wrapper-vue";
import { channels, submissionSchema } from "./schemas";

const { results, poll, isPolling } = useGraffitiDiscover(
    channels,
    submissionSchema,
);
</script>

<template>
    <button @click="poll" :disabled="isPolling">
        {{ isPolling ? "Refreshing..." : "Refresh" }}
    </button>
    <ul>
        <li>
            <RouterLink to="submit">Submit a new entry</RouterLink>
        </li>
        <li v-for="result in results" :key="$graffiti.objectToUri(result)">
            <h2>
                {{ result.value.title }}
            </h2>
            <p>
                {{ result.value.content }}
            </p>
        </li>
        <li v-if="isPolling">Loading...</li>
    </ul>
</template>
