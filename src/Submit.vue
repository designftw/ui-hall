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
                    <img
                        v-if="'file' in image"
                        :src="fileToUrl(image.file)"
                        :alt="image.alt"
                    />

                    <GraffitiGetFile
                        v-else
                        :locationOrUri="image.graffitiFile"
                        v-slot="{ fileUrl }"
                    >
                        <img :src="fileUrl" :alt="image.alt" />
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
