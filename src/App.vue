<template>
    <header>
        <RouterLink :to="{ name: 'gallery' }">
            <h1>UI Hall of Fame or Shame?</h1>
        </RouterLink>

        <nav>
            <ul>
                <li>
                    <RouterLink :to="{ name: 'gallery' }">Gallery</RouterLink>
                </li>
                <li v-if="$graffitiSession.value">
                    <button @click="$graffiti.logout($graffitiSession.value)">
                        Log out
                    </button>
                </li>
            </ul>
        </nav>
    </header>

    <main>
        <RouterView />
    </main>
</template>

<style>
* {
    box-sizing: border-box;
    font-family: Arial, sans-serif;
    margin: 0;
    padding: 0;
}

body {
    background: #111;
    color: #eee;
}
</style>
