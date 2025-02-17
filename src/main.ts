import { createApp } from "vue";
import App from "./App.vue";
import Submit from "./Submit.vue";
import Gallery from "./Gallery.vue";
import { GraffitiPlugin } from "@graffiti-garden/wrapper-vue";
import { GraffitiLocal } from "@graffiti-garden/implementation-local";
import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      name: "submit",
      path: "/submit",
      component: Submit,
    },
    {
      name: "gallery",
      path: "/",
      component: Gallery,
    },
  ],
});

createApp(App)
  .use(router)
  .use(GraffitiPlugin, {
    graffiti: new GraffitiLocal(),
  })
  .mount("#app");
