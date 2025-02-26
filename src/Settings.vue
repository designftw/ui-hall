<script setup lang="ts">
import { ref } from "vue";
const working = ref(false);
</script>

<template>
    <template v-if="$graffitiSession.value">
        <button
            @click="
                working = true;
                $graffiti
                    .logout($graffitiSession.value)
                    .finally(() => (working = false));
            "
            :disabled="working"
        >
            {{ working ? "Logging out..." : "Log out" }}
        </button>
        <p>You are logged in as {{ $graffitiSession.value.actor }}</p>
    </template>
    <template v-else>
        <button
            @click="
                working = true;
                $graffiti.login().finally(() => (working = false));
            "
            :disabled="working"
        >
            {{ working ? "Logging in..." : "Log in" }}
        </button>
    </template>
</template>
