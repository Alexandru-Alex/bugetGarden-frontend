const AVATAR_MAP: Record<string, number> = {
  gardener_1: require("../assets/avatars/gardener_1.png"),
  gardener_2: require("../assets/avatars/gardener_2.png"),
};

export const AVATAR_KEYS = Object.keys(AVATAR_MAP) as string[];

export function avatarSource(avatarUrl?: string | null): number {
  return AVATAR_MAP[avatarUrl ?? "gardener_1"] ?? AVATAR_MAP["gardener_1"];
}
