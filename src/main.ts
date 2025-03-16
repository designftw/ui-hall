import { createApp } from "vue";
import App from "./App.vue";
import Submit from "./Submit.vue";
import Submission from "./Submission.vue";
import Gallery from "./Gallery.vue";
import { GraffitiPlugin } from "@graffiti-garden/wrapper-vue";
import { GraffitiRemote } from "@graffiti-garden/implementation-remote";
import { createRouter, createWebHistory } from "vue-router";
import "@picocss/pico/css/pico.min.css";

const redirect = sessionStorage.redirect;
delete sessionStorage.redirect;
if (redirect && redirect !== location.href) {
  history.replaceState(null, "", redirect);
}

const router = createRouter({
  history: createWebHistory("/ui-hall/"),
  routes: [
    {
      name: "gallery",
      path: "/",
      component: Gallery,
    },
    {
      name: "submission",
      path: "/submission/:url",
      component: Submission,
      props: true,
    },
    {
      name: "submit",
      path: "/submit/:submissionToEdit?",
      component: Submit,
      props: true,
    },
  ],
});

createApp(App)
  .use(router)
  .use(GraffitiPlugin, {
    graffiti: new GraffitiRemote(),
  })
  .mount("#app");
