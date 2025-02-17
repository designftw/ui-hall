<script setup lang="ts">
defineProps<{
    tags: string[];
}>();
</script>

<template>
    <span class="tag">
        {{
            tags.includes("fame")
                ? "🌟 Fame"
                : tags.includes("shame")
                  ? "💩 Shame"
                  : "🤨 Unknown"
        }}
    </span>
</template>

<style scoped>
.tag {
    font-size: 0.8em;
    padding: 0.2em 0.4em;
    border: 1px solid #ccc;
}
</style>
