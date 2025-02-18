import type { GraffitiObject, JSONSchema } from "@graffiti-garden/api";

export const channels = ["ui-hall-of-fame-or-shame"];

export const submissionSchema = {
  properties: {
    value: {
      required: ["title", "content", "createdAt", "tags"],
      properties: {
        title: {
          type: "string",
        },
        content: {
          type: "string",
        },
        createdAt: {
          type: "number",
        },
        tags: {
          type: "array",
          items: { type: "string" },
          contains: { enum: ["fame", "shame"] },
        },
        urls: {
          type: "array",
          items: { type: "string" },
        },
        images: {
          type: "array",
          items: {
            type: "object",
            required: ["graffitiFile", "alt"],
            properties: {
              alt: { type: "string" },
              graffitiFile: { type: "string" },
            },
          },
        },
      },
    },
  },
} as const satisfies JSONSchema;
