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

main {
    display: flex;
    flex-direction: column;
    padding: 1rem;
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
    gap: 0.5rem;
    border-bottom: 1px solid #555;

    a {
        color: #eee;
        text-decoration: none;
    }

    a:hover {
        text-decoration: underline;
    }

    nav {
        .router-link-active {
            text-decoration: underline;
        }

        ul {
            display: flex;
            gap: 1rem;
            justify-content: left;
            list-style-type: none;
        }
    }
}
</style>
