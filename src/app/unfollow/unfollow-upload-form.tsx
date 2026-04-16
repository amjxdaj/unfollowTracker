"use client";

import { useState } from "react";
import { buildUnfollowReport, type UnfollowProfile, type GenderGuess } from "@/lib/unfollowTrackerClient";
import UnfollowResults from "./unfollow-results";

type UploadStatus = "idle" | "processing" | "error" | "complete";

export default function UnfollowUploadForm() {
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [error, setError] = useState<string>("");
  const [followersFile, setFollowersFile] = useState<File | null>(null);
  const [followingFile, setFollowingFile] = useState<File | null>(null);
  const [report, setReport] = useState<{
    followersCount: number;
    followingCount: number;
    unfollowCount: number;
    profiles: UnfollowProfile[];
    groupedByGender: Record<GenderGuess, UnfollowProfile[]>;
  } | null>(null);

  const handleFollowersUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    if (file) {
      if (!file.name.includes("followers")) {
        setError("This file doesn't look like followers.json. Please check the filename.");
        return;
      }
      setFollowersFile(file);
      setError("");
    }
  };

  const handleFollowingUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    if (file) {
      if (!file.name.includes("following")) {
        setError("This file doesn't look like following.json. Please check the filename.");
        return;
      }
      setFollowingFile(file);
      setError("");
    }
  };

  const handleProcess = async () => {
    if (!followersFile || !followingFile) {
      setError("Please upload both followers and following files");
      return;
    }

    setError("");
    setStatus("processing");

    try {
      const followersText = await followersFile.text();
      const followersData = JSON.parse(followersText);

      const followingText = await followingFile.text();
      const followingData = JSON.parse(followingText);

      // Build report
      const unfollowReport = buildUnfollowReport(followersData, followingData);
      setReport(unfollowReport);
      setStatus("complete");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to process files";
      setError(message);
      setStatus("error");
    }
  };

  if (report) {
    return (
      <div>
        <button
          onClick={() => {
            setReport(null);
            setStatus("idle");
            setError("");
            setFollowersFile(null);
            setFollowingFile(null);
          }}
          className="mb-4 inline-flex items-center gap-2 rounded-lg bg-zinc-100 px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-200"
        >
          ← Upload Different Files
        </button>
        <UnfollowResults report={report} />
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Followers Upload */}
      <div className="rounded-2xl border border-[var(--line)] bg-white p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-600">
            1
          </div>
          <h3 className="text-base font-semibold text-zinc-900">Upload followers.json</h3>
        </div>

        <label className="mt-4 flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-orange-200 bg-orange-50 px-4 py-6 transition hover:border-orange-400 hover:bg-orange-100">
          <svg className="h-6 w-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
          </svg>
          <div className="text-center">
            <p className="text-sm font-medium text-orange-600">
              {followersFile ? followersFile.name : "Click to upload"}
            </p>
            <p className="text-xs text-orange-500">followers_1.json from your export</p>
          </div>
          <input
            type="file"
            accept=".json"
            onChange={handleFollowersUpload}
            disabled={status === "processing"}
            className="hidden"
          />
        </label>
      </div>

      {/* Following Upload */}
      <div className="rounded-2xl border border-[var(--line)] bg-white p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-600">
            2
          </div>
          <h3 className="text-base font-semibold text-zinc-900">Upload following.json</h3>
        </div>

        <label className="mt-4 flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-orange-200 bg-orange-50 px-4 py-6 transition hover:border-orange-400 hover:bg-orange-100">
          <svg className="h-6 w-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
          </svg>
          <div className="text-center">
            <p className="text-sm font-medium text-orange-600">
              {followingFile ? followingFile.name : "Click to upload"}
            </p>
            <p className="text-xs text-orange-500">following.json from your export</p>
          </div>
          <input
            type="file"
            accept=".json"
            onChange={handleFollowingUpload}
            disabled={status === "processing"}
            className="hidden"
          />
        </label>
      </div>

      {/* Process Button */}
      <button
        onClick={handleProcess}
        disabled={!followersFile || !followingFile || status === "processing"}
        className="w-full rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-3 font-medium text-white transition disabled:opacity-50 disabled:cursor-not-allowed hover:from-orange-600 hover:to-orange-700"
      >
        {status === "processing" ? (
          <span className="flex items-center justify-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            Processing...
          </span>
        ) : (
          "Analyze"
        )}
      </button>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      <p className="text-xs text-zinc-500">
        ✓ Your files are processed locally in your browser. No data is sent anywhere.
      </p>
    </div>
  );
}
