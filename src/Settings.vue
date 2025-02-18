<template>
    <template v-if="$graffitiSession.value">
        <button @click="$graffiti.logout($graffitiSession.value)">
            Log out
        </button>
        <p>You are logged in as {{ $graffitiSession.value.actor }}</p>
    </template>
    <template v-else>
        <button @click="$graffiti.login()">Log in</button>
    </template>
</template>
