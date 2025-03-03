<template>
    <header>
        <h1>UI Hall of Fame or Shame?</h1>

        <nav>
            <ul>
                <li>
                    <RouterLink :to="{ name: 'gallery' }"> Gallery </RouterLink>
                </li>
                <li>
                    <RouterLink :to="{ name: 'settings' }">
                        Settings
                    </RouterLink>
                </li>
            </ul>
        </nav>
    </header>

    <main>
        <template v-if="$graffitiSession.value === undefined">
            <p>Loading...</p>
        </template>
        <RouterView v-else />
    </main>
</template>

<style>
#app > main {
    display: flex;
    flex-direction: column;
    padding: 2rem;
    gap: 1rem;
}

.visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    margin: -1px;
    padding: 0;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    border: 0;
}

header {
    padding: 1rem;
    display: flex;
    flex-direction: column;
    align-items: left;
    border-bottom: 1px solid #555;
}

.shame,
.fame {
    position: relative;

    &::before {
        position: absolute;
        top: -1rem;
        right: -1rem;
        border-radius: 0.25rem;
        padding: 0.25rem;
        background: black;
        border: 2px solid white;
    }
}

.shame:before {
    content: "Shame 😱";
}
.fame:before {
    content: "Fame ⭐";
}

article {
    border: 2px solid grey;
}

main > :not(ul) {
    width: 100%;
    max-width: 50rem;
    margin: auto;
}
</style>
