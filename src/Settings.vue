<template>
    <template v-if="$graffitiSession.value">
        <p>You are logged in as {{ $graffitiSession.value.actor }}</p>
        <button @click="$graffiti.logout($graffitiSession.value)">
            log out
        </button>
    </template>
    <template v-else>
        <button @click="$graffiti.login()">log in</button>
    </template>
</template>
