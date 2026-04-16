/**
 * Client-side unfollow tracker logic
 * Extracted from unfollowTracker.ts for use in browser
 */

export type AccountType = "Business/Brand" | "Creator/Theme" | "Personal" | "Unknown";
export type GenderGuess = "Girls" | "Boys" | "Unknown";

export type UnfollowProfile = {
  username: string;
  profileUrl: string;
  followedAt?: number;
  accountType: AccountType;
  genderGuess: GenderGuess;
};

function normalizeUsername(value: string): string {
  return value
    .replace(/^@+/, "")
    .replace(/^https?:\/\/(www\.)?instagram\.com\//, "")
    .replace(/^_u\//, "")
    .replace(/\?.*$/, "")
    .replace(/\/$/, "")
    .trim()
    .toLowerCase();
}

function usernameFromHref(href: string): string {
  const cleaned = href
    .replace(/^https?:\/\/(www\.)?instagram\.com\//, "")
    .replace(/\?.*$/, "")
    .replace(/\/$/, "");
  if (cleaned.startsWith("_u/")) {
    return normalizeUsername(cleaned.replace(/^_u\//, ""));
  }
  return normalizeUsername(cleaned.split("/")[0] || "");
}

function classifyAccountType(username: string): AccountType {
  if (!username || username.includes("__deleted__")) {
    return "Unknown";
  }

  const value = username.toLowerCase();
  const businessTokens = [
    "official",
    "store",
    "shop",
    "media",
    "news",
    "agency",
    "studio",
    "brand",
    "market",
    "autos",
    "biz",
  ];
  const creatorTokens = [
    "creator",
    "edit",
    "photography",
    "shots",
    "art",
    "design",
    "quotes",
    "motivation",
    "coding",
    "dev",
    "tech",
  ];

  if (businessTokens.some((token) => value.includes(token))) {
    return "Business/Brand";
  }

  if (creatorTokens.some((token) => value.includes(token))) {
    return "Creator/Theme";
  }

  return "Personal";
}

function classifyGenderGuess(username: string): GenderGuess {
  const value = username.toLowerCase();
  if (!value || value.includes("__deleted__")) {
    return "Unknown";
  }

  const girlTokens = [
    "girl",
    "queen",
    "princess",
    "lady",
    "fem",
    "women",
    "womens",
    "her",
    "she",
    "begum",
    "aishu",
    "fathima",
    "sana",
    "hana",
    "ayisha",
    "nisha",
    "anu",
    "diya",
    "amrutha",
  ];
  const boyTokens = [
    "boy",
    "king",
    "bro",
    "mr",
    "mhd",
    "muhd",
    "mohd",
    "abdul",
    "rahul",
    "amal",
    "ajmal",
    "hadi",
    "shan",
    "akhil",
    "arjun",
    "vishnu",
  ];

  if (girlTokens.some((token) => value.includes(token))) {
    return "Girls";
  }
  if (boyTokens.some((token) => value.includes(token))) {
    return "Boys";
  }
  return "Unknown";
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseFollowerUsernames(payload: unknown): Set<string> {
  const followers = new Set<string>();
  if (!Array.isArray(payload)) {
    return followers;
  }

  payload.forEach((item) => {
    if (!isObject(item) || !Array.isArray(item.string_list_data)) {
      return;
    }
    item.string_list_data.forEach((entry) => {
      if (!isObject(entry)) {
        return;
      }
      const value = typeof entry.value === "string" ? entry.value : "";
      const href = typeof entry.href === "string" ? entry.href : "";
      const username = normalizeUsername(value || usernameFromHref(href));
      if (username) {
        followers.add(username);
      }
    });
  });

  return followers;
}

function parseFollowingProfiles(payload: unknown): Map<string, UnfollowProfile> {
  const following = new Map<string, UnfollowProfile>();

  if (!isObject(payload) || !Array.isArray(payload.relationships_following)) {
    return following;
  }

  payload.relationships_following.forEach((item) => {
    if (!isObject(item)) {
      return;
    }

    const title = typeof item.title === "string" ? item.title : "";
    const first =
      Array.isArray(item.string_list_data) && isObject(item.string_list_data[0])
        ? item.string_list_data[0]
        : null;
    const href = first && typeof first.href === "string" ? first.href : "";
    const username = normalizeUsername(title || usernameFromHref(href));
    const followedAt =
      first && typeof first.timestamp === "number" ? first.timestamp : undefined;

    if (!username) {
      return;
    }

    following.set(username, {
      username,
      profileUrl: `https://www.instagram.com/${username}/`,
      followedAt,
      accountType: classifyAccountType(username),
      genderGuess: classifyGenderGuess(username),
    });
  });

  return following;
}

export function buildUnfollowReport(
  followersPayload: unknown,
  followingPayload: unknown,
): {
  followersCount: number;
  followingCount: number;
  unfollowCount: number;
  profiles: UnfollowProfile[];
  groupedByGender: Record<GenderGuess, UnfollowProfile[]>;
} {
  const followerSet = parseFollowerUsernames(followersPayload);
  const followingMap = parseFollowingProfiles(followingPayload);

  const profiles = [...followingMap.values()]
    .filter((profile) => !followerSet.has(profile.username))
    .sort((a, b) => a.username.localeCompare(b.username));

  const groupedByGender: Record<GenderGuess, UnfollowProfile[]> = {
    Girls: [],
    Boys: [],
    Unknown: [],
  };

  profiles.forEach((profile) => {
    groupedByGender[profile.genderGuess].push(profile);
  });

  return {
    followersCount: followerSet.size,
    followingCount: followingMap.size,
    unfollowCount: profiles.length,
    profiles,
    groupedByGender,
  };
}
