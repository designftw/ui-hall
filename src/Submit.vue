<script setup lang="ts">
import { ref, type Ref } from "vue";
import type { GraffitiSession } from "@graffiti-garden/api";
import { useGraffiti } from "@graffiti-garden/wrapper-vue";
import { channels, submissionSchema } from "./schemas";
import { useRouter } from "vue-router";
import { uploadFile } from "./files/index";

const router = useRouter();

const title = ref("");
const content = ref("");
const url = ref("");
const fameOrShame: Ref<"fame" | "shame" | undefined> = ref();

const graffiti = useGraffiti();

const loggingIn = ref(false);

const imageFiles = ref<
    {
        file: File;
        alt: string;
    }[]
>([]);

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
    const imageUris = await Promise.allSettled(
        imageFiles.value.map((image) =>
            uploadFile(graffiti, image.file, session),
        ),
    );
    for (const imageUri of imageUris) {
        if (imageUri.status === "fulfilled") {
            images.push({
                alt: imageFiles.value[imageUris.indexOf(imageUri)].alt,
                graffitiFile: imageUri.value,
            });
        } else {
            alert("Failed to upload image: " + imageUri.reason);
            return;
        }
    }

    try {
        await graffiti.put<typeof submissionSchema>(
            {
                value: {
                    title: title.value,
                    content: content.value,
                    urls: [url.value],
                    tags: [fameOrShame.value],
                    createdAt: new Date().getTime(),
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
            <input id="title" v-model="title" required />

            <label for="content">
                Why should this be in the hall of
                <strong>{{
                    fameOrShame === "fame"
                        ? "fame"
                        : fameOrShame === "shame"
                          ? "shame"
                          : "fame or shame"
                }}</strong
                >?
            </label>
            <textarea id="content" v-model="content" required />

            <label for="url">Link to example (optional)</label>
            <input
                id="url"
                v-model="url"
                type="url"
                placeholder="https://example.com"
            />

            <ol>
                <li v-for="(image, index) in imageFiles" :key="index">
                    <img :src="fileToUrl(image.file)" :alt="image.alt" />
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
        </form>
    </template>
</template>

<style scoped>
/* form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 30rem;
}

label + :is(input, textarea) {
    margin-top: -1rem;
}

fieldset {
    display: flex;
    gap: 1rem;
}

input[type="radio"] {
    margin: 0;
}

ol {
    list-style: decimal;
    padding-inline-start: 0;
    display: flex;
    flex-direction: column;
    gap: 1rem;

    li {
        display: flex;
        gap: 1rem;
        align-items: center;

        img {
            max-width: 10rem;
            max-height: 10rem;
        }
    }
} */
</style>
