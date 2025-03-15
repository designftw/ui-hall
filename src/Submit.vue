<script setup lang="ts">
import { ref, toRefs, type Ref } from "vue";
import GraffitiGetFile from "./files/GetFile.vue";
import type { GraffitiObject, GraffitiSession } from "@graffiti-garden/api";
import { useGraffiti } from "@graffiti-garden/wrapper-vue";
import { channels, submissionSchema } from "./schemas";
import { useRouter } from "vue-router";
import { uploadFile } from "./files/index";
import markdownit from "markdown-it";

const router = useRouter();

const props = defineProps<{
    submissionToEdit?: string;
}>();

const submissionToEdit = props.submissionToEdit
    ? (JSON.parse(props.submissionToEdit) as GraffitiObject<
          typeof submissionSchema
      >)
    : undefined;

const value = submissionToEdit?.value;

const title = ref(value?.title ?? "");
const content = ref(value?.content ?? "");
const fameOrShame: Ref<"fame" | "shame" | undefined> = ref(
    value?.tags.includes("fame")
        ? "fame"
        : value?.tags.includes("shame")
          ? "shame"
          : undefined,
);

const graffiti = useGraffiti();

const loggingIn = ref(false);

const imageFiles = ref<
    ({
        alt: string;
    } & (
        | {
              file: File;
          }
        | {
              graffitiFile: string;
          }
    ))[]
>(value?.images ?? []);

function addImage(event: Event) {
    const target = event.target as HTMLInputElement;
    if (!target.files?.length) return;
    imageFiles.value.push({
        file: target.files[0],
        alt: "",
    });
}

const fileToUrl = (file: File) => URL.createObjectURL(file);

const isPutting = ref(false);
async function submit(session: GraffitiSession) {
    if (!title.value || !content.value || !fameOrShame.value) {
        return alert("Please fill out all required fields.");
    }

    isPutting.value = true;

    let images: {
        alt: string;
        graffitiFile: string;
    }[] = [];
    for (const [index, image] of imageFiles.value.entries()) {
        if ("graffitiFile" in image) {
            images.push(image);
        } else {
            try {
                const imageUri = await uploadFile(
                    graffiti,
                    image.file,
                    session,
                );
                imageFiles.value[index] = {
                    alt: image.alt,
                    graffitiFile: imageUri,
                };
                images.push({
                    alt: image.alt,
                    graffitiFile: imageUri,
                });
            } catch (error) {
                alert(`Failed to upload image ${index + 1}: ` + error);
                return;
            }
        }
    }

    try {
        await graffiti.put<typeof submissionSchema>(
            {
                ...submissionToEdit,
                value: {
                    ...submissionToEdit?.value,
                    title: title.value,
                    content: content.value,
                    tags: [fameOrShame.value],
                    createdAt:
                        submissionToEdit?.value.createdAt ??
                        new Date().getTime(),
                    images,
                },
                channels,
            },
            session,
        );
    } catch (error) {
        alert("Failed to submit entry." + error);
        return;
    } finally {
        isPutting.value = false;
    }
    router.push({ name: "gallery" });
}

const showMe = ref<"entry" | "preview">("entry");
const md = markdownit({
    html: true,
    linkify: true,
});
</script>

<template>
    <template v-if="!$graffitiSession.value">
        <p>
            You must be logged in to submit an entry to the UI hall of fame or
            shame.
        </p>
        <button
            @click="
                loggingIn = true;
                $graffiti.login().finally(() => (loggingIn = false));
            "
            :disabled="loggingIn"
        >
            {{ loggingIn ? "Logging in..." : "Log in" }}
        </button>
    </template>
    <template v-else>
        <form @submit.prevent="submit($graffitiSession.value)">
            <fieldset>
                <legend>Fame or Shame?</legend>

                <input
                    name="fameOrShame"
                    id="fame"
                    type="radio"
                    v-model="fameOrShame"
                    value="fame"
                    required
                />
                <label for="fame">Fame</label>
                <input
                    name="fameOrShame"
                    id="shame"
                    type="radio"
                    v-model="fameOrShame"
                    value="shame"
                    required
                />
                <label for="shame">Shame</label>
            </fieldset>

            <label for="title">Title</label>
            <input id="title" v-model="title" required placeholder="My Title" />

            <section>
                <label for="content">
                    <p>
                        Describe your example and why it deserves to be in the
                        hall of
                        <strong>{{
                            fameOrShame === "fame"
                                ? "fame"
                                : fameOrShame === "shame"
                                  ? "shame"
                                  : "fame or shame"
                        }}</strong
                        >.
                    </p>
                    <p>
                        Try to use terminology from class and The Design of
                        Everyday Things. If this is an online example, please
                        include links. Both markdown and HTML are accepted in
                        your response.
                    </p>
                </label>
                <fieldset>
                    <input
                        type="radio"
                        id="entry"
                        value="entry"
                        v-model="showMe"
                    />
                    <label for="entry">Edit</label>
                    <input
                        type="radio"
                        id="preview"
                        value="preview"
                        v-model="showMe"
                    />
                    <label for="preview"> Preview </label>
                </fieldset>
                <textarea
                    v-if="showMe === 'entry'"
                    id="content"
                    v-model="content"
                    required
                    placeholder="I chose this example because..."
                />
                <div v-else v-html="md.render(content)"></div>
            </section>

            <ol>
                <li v-for="(image, index) in imageFiles" :key="index">
                    <img
                        v-if="'file' in image"
                        :src="fileToUrl(image.file)"
                        :alt="image.alt"
                    />

                    <GraffitiGetFile
                        v-else
                        :url="image.graffitiFile"
                        v-slot="{ fileUrl }"
                    >
                        <img v-if="fileUrl" :src="fileUrl" :alt="image.alt" />
                    </GraffitiGetFile>

                    <label :for="`alt-${index}`">Alt text</label>
                    <textarea
                        :id="`alt-${index}`"
                        v-model="image.alt"
                        placeholder="An image of..."
                        required
                    ></textarea>
                    <button @click="imageFiles.splice(index, 1)">Remove</button>
                </li>
                <li>
                    <label for="image">Add image</label>
                    <input
                        id="image"
                        type="file"
                        accept="image/*"
                        @change="addImage"
                    />
                </li>
            </ol>

            <input
                type="submit"
                :value="isPutting ? 'Submitting...' : 'Submit'"
                :disabled="isPutting"
            />
            <aside>You can edit your submission after submitting it.</aside>
        </form>
    </template>
</template>

<style scoped>
section {
    border-radius: var(--pico-border-radius);
    border-top: var(--pico-border-width) solid var(--pico-border-color);

    fieldset {
        background-color: var(--pico-form-element-background-color);
        border: var(--pico-border-width) solid var(--pico-border-color);
        margin-bottom: 0;
        padding: var(--pico-form-element-spacing-vertical)
            var(--pico-form-element-spacing-horizontal);
        border-top-left-radius: var(--pico-border-radius);
        border-top-right-radius: var(--pico-border-radius);
    }

    textarea,
    div {
        min-height: 20em;
    }

    div {
        background-color: var(--pico-form-element-background-color);
        border: var(--pico-border-width) solid var(--pico-border-color);
        border-radius: var(--pico-border-radius);
        padding: var(--pico-form-element-spacing-vertical)
            var(--pico-form-element-spacing-horizontal);
    }
}
</style>
