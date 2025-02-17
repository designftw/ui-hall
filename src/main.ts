import { createApp } from "vue";
import App from "./App.vue";
import Submit from "./Submit.vue";
import Submission from "./Submission.vue";
import Gallery from "./Gallery.vue";
import { GraffitiPlugin } from "@graffiti-garden/wrapper-vue";
import { GraffitiLocal } from "@graffiti-garden/implementation-local";
import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      name: "gallery",
      path: "/",
      component: Gallery,
    },
    {
      name: "submission",
      path: "/submission/:uri",
      component: Submission,
      props: true,
    },
    {
      name: "submit",
      path: "/submit",
      component: Submit,
    },
  ],
});

createApp(App)
  .use(router)
  .use(GraffitiPlugin, {
    graffiti: new GraffitiLocal(),
  })
  .mount("#app");
