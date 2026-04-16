import { getJsonFilesForSection, readJsonByRelativePath } from "@/lib/instagramExport";

type CommentItem = {
  text: string;
  mediaOwner: string;
  timestamp?: number;
  targetUrl: string;
  source: "Post Comment" | "Reel Comment";
  score: number;
};

type LikeItem = {
  owner: string;
  targetUrl: string;
  timestamp?: number;
  source: "Liked Post" | "Liked Comment";
};

function isObject(input: unknown): input is Record<string, unknown> {
  return typeof input === "object" && input !== null && !Array.isArray(input);
}

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

function extractOwnerProfileUrl(owner: string): string {
  const username = normalizeUsername(owner);
  return username ? `https://www.instagram.com/${username}/` : "https://www.instagram.com/";
}

function readStringMap(obj: Record<string, unknown>, key: string): string {
  const map = obj.string_map_data;
  if (!isObject(map) || !isObject(map[key])) {
    return "";
  }
  const item = map[key];
  return typeof item.value === "string" ? item.value : "";
}

function readTime(obj: Record<string, unknown>): number | undefined {
  const map = obj.string_map_data;
  if (!isObject(map) || !isObject(map.Time)) {
    return undefined;
  }
  return typeof map.Time.timestamp === "number" ? map.Time.timestamp : undefined;
}

function commentScore(text: string, timestamp?: number): number {
  let score = 0;
  const lower = text.toLowerCase();
  if (text.includes("@")) {
    score += 2;
  }
  if (text.length <= 4) {
    score += 2;
  }
  if (["dm", "follow", "like back", "spam"].some((term) => lower.includes(term))) {
    score += 2;
  }
  if (!/[a-zA-Z]/.test(text)) {
    score += 1;
  }
  if (timestamp) {
    const ageDays = Math.floor((Date.now() - timestamp * 1000) / (1000 * 60 * 60 * 24));
    if (ageDays > 365) {
      score += 1;
    }
  }
  return score;
}

export async function buildCommentCleanupReport(): Promise<{
  total: number;
  suggested: CommentItem[];
  recent: CommentItem[];
  topOwners: Array<{ owner: string; count: number }>;
}> {
  const files = await getJsonFilesForSection("your_instagram_activity", "comments");
  const postFiles = files.filter((file) => file.fileName.startsWith("post_comments"));
  const reelsFile = files.find((file) => file.fileName === "reels_comments.json");
  const comments: CommentItem[] = [];

  for (const file of postFiles) {
    const payload = await readJsonByRelativePath(file.relativePath);
    if (!Array.isArray(payload)) {
      continue;
    }
    payload.forEach((item) => {
      if (!isObject(item)) {
        return;
      }
      const text = readStringMap(item, "Comment");
      const mediaOwner = readStringMap(item, "Media Owner");
      const timestamp = readTime(item);
      const mediaList = Array.isArray(item.media_list_data) ? item.media_list_data : [];
      const first = mediaList[0];
      const uri = isObject(first) && typeof first.uri === "string" ? first.uri : "";
      const targetUrl = uri || extractOwnerProfileUrl(mediaOwner);

      if (!text) {
        return;
      }
      comments.push({
        text,
        mediaOwner,
        timestamp,
        targetUrl,
        source: "Post Comment",
        score: commentScore(text, timestamp),
      });
    });
  }

  if (reelsFile) {
    const payload = await readJsonByRelativePath(reelsFile.relativePath);
    const rows =
      isObject(payload) && Array.isArray(payload.comments_reels_comments)
        ? payload.comments_reels_comments
        : [];
    rows.forEach((item) => {
      if (!isObject(item)) {
        return;
      }
      const text = readStringMap(item, "Comment");
      const mediaOwner = readStringMap(item, "Media Owner");
      const timestamp = readTime(item);
      const targetUrl = extractOwnerProfileUrl(mediaOwner);
      if (!text) {
        return;
      }
      comments.push({
        text,
        mediaOwner,
        timestamp,
        targetUrl,
        source: "Reel Comment",
        score: commentScore(text, timestamp),
      });
    });
  }

  const topOwnersMap = new Map<string, number>();
  comments.forEach((item) => {
    const key = item.mediaOwner || "unknown";
    topOwnersMap.set(key, (topOwnersMap.get(key) || 0) + 1);
  });

  const sortedByTime = [...comments].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  const suggested = [...comments]
    .sort((a, b) => b.score - a.score || (b.timestamp || 0) - (a.timestamp || 0))
    .slice(0, 80);

  return {
    total: comments.length,
    suggested,
    recent: sortedByTime.slice(0, 80),
    topOwners: [...topOwnersMap.entries()]
      .map(([owner, count]) => ({ owner, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 12),
  };
}

export async function buildLikeCleanupReport(): Promise<{
  total: number;
  suggested: LikeItem[];
  bySource: Record<"Liked Post" | "Liked Comment", LikeItem[]>;
  topOwners: Array<{ owner: string; count: number }>;
}> {
  const files = await getJsonFilesForSection("your_instagram_activity", "likes");
  const likedPostsFile = files.find((file) => file.fileName === "liked_posts.json");
  const likedCommentsFile = files.find((file) => file.fileName === "liked_comments.json");

  const likes: LikeItem[] = [];

  if (likedPostsFile) {
    const payload = await readJsonByRelativePath(likedPostsFile.relativePath);
    if (Array.isArray(payload)) {
      payload.forEach((row) => {
        if (!isObject(row)) {
          return;
        }
        const timestamp = typeof row.timestamp === "number" ? row.timestamp : undefined;
        const labelValues = Array.isArray(row.label_values) ? row.label_values : [];
        let targetUrl = "";
        let owner = "";

        labelValues.forEach((entry) => {
          if (!isObject(entry)) {
            return;
          }
          if (entry.label === "URL" && typeof entry.value === "string") {
            targetUrl = entry.value;
          }
          if (entry.title === "Owner" && Array.isArray(entry.dict)) {
            entry.dict.forEach((ownerBlock) => {
              if (!isObject(ownerBlock) || !Array.isArray(ownerBlock.dict)) {
                return;
              }
              ownerBlock.dict.forEach((meta) => {
                if (!isObject(meta)) {
                  return;
                }
                if (meta.label === "Username" && typeof meta.value === "string") {
                  owner = meta.value;
                }
              });
            });
          }
        });

        if (targetUrl) {
          likes.push({
            owner: normalizeUsername(owner) || "unknown",
            targetUrl,
            timestamp,
            source: "Liked Post",
          });
        }
      });
    }
  }

  if (likedCommentsFile) {
    const payload = await readJsonByRelativePath(likedCommentsFile.relativePath);
    const rows =
      isObject(payload) && Array.isArray(payload.likes_comment_likes)
        ? payload.likes_comment_likes
        : [];
    rows.forEach((row) => {
      if (!isObject(row)) {
        return;
      }
      const owner = typeof row.title === "string" ? normalizeUsername(row.title) : "unknown";
      const first =
        Array.isArray(row.string_list_data) && isObject(row.string_list_data[0])
          ? row.string_list_data[0]
          : null;
      const targetUrl = first && typeof first.href === "string" ? first.href : "";
      const timestamp =
        first && typeof first.timestamp === "number" ? first.timestamp : undefined;
      if (!targetUrl) {
        return;
      }
      likes.push({
        owner: owner || "unknown",
        targetUrl,
        timestamp,
        source: "Liked Comment",
      });
    });
  }

  const sortedOldestFirst = [...likes].sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
  const bySource: Record<"Liked Post" | "Liked Comment", LikeItem[]> = {
    "Liked Post": likes.filter((item) => item.source === "Liked Post"),
    "Liked Comment": likes.filter((item) => item.source === "Liked Comment"),
  };

  const ownerCount = new Map<string, number>();
  likes.forEach((item) => {
    ownerCount.set(item.owner, (ownerCount.get(item.owner) || 0) + 1);
  });

  return {
    total: likes.length,
    suggested: sortedOldestFirst.slice(0, 120),
    bySource,
    topOwners: [...ownerCount.entries()]
      .map(([owner, count]) => ({ owner, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 12),
  };
}
