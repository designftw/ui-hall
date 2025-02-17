import type { JSONSchema, GraffitiObject } from "@graffiti-garden/api";

/**
 * The JSON schema for a like GraffitiObject.
 */
export function likeSchema(options?: {
  /**
   * The URIs that the like is pointing to
   */
  targets?: string[];
  actors?: string[];
}) {
  return {
    properties: {
      value: {
        required: ["activity", "target"],
        properties: {
          activity: {
            type: "string",
            enum: ["like"],
          },
          target: {
            type: "string",
            ...(options?.targets
              ? {
                  enum: options.targets,
                }
              : {}),
          },
        },
      },
      actor: {
        ...(options?.actors
          ? {
              enum: options.actors,
            }
          : {}),
      },
    },
  } as const satisfies JSONSchema;
}

export type Like = GraffitiObject<ReturnType<typeof likeSchema>>;
