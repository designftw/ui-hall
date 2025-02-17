import { toValue, computed, type MaybeRefOrGetter } from "vue";
import { useGraffitiDiscover } from "@graffiti-garden/wrapper-vue";
import { likeSchema } from "./schemas";

export function useLikeActorsPerTarget(
  targets: MaybeRefOrGetter<string[]>,
  channels: MaybeRefOrGetter<string[]>,
) {
  const { results: likes } = useGraffitiDiscover(channels, () =>
    likeSchema({ targets: toValue(targets) }),
  );

  return computed(() => {
    const likeActorsPerTarget = new Map<string, Set<string>>();

    for (const like of likes.value) {
      const target = like.value.target;
      const actors = likeActorsPerTarget.get(target);
      if (actors) {
        actors.add(like.actor);
      } else {
        likeActorsPerTarget.set(target, new Set([like.actor]));
      }
    }
    return likeActorsPerTarget;
  });
}

export function useLikeCountPerTarget(
  targets: MaybeRefOrGetter<string[]>,
  channels: MaybeRefOrGetter<string[]>,
) {
  const likeActorsPerTarget = useLikeActorsPerTarget(targets, channels);

  return computed(() => {
    const likeCountPerTarget = new Map<string, number>();
    for (const [target, actors] of likeActorsPerTarget.value) {
      likeCountPerTarget.set(target, actors.size);
    }
    return likeCountPerTarget;
  });
}

export function useLikeCount(
  target: MaybeRefOrGetter<string>,
  channels: MaybeRefOrGetter<string[]>,
) {
  const likeCountPerTarget = useLikeCountPerTarget(
    () => [toValue(target)],
    channels,
  );
  return computed(() => likeCountPerTarget.value.get(toValue(target)) ?? 0);
}
