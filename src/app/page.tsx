import UnfollowUploadForm from "@/app/unfollow/unfollow-upload-form";

export const metadata = {
  title: "Unfollow Tracker - Find Non-Reciprocal Followers",
  description: "Upload your Instagram followers data and find who doesn't follow you back. Fast, private, local processing.",
};

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-orange-50">
      {/* Main Content */}
      <div className="mx-auto w-full max-w-2xl px-4 py-8">
        <UnfollowUploadForm />

        {/* Info Section */}
        <section className="mt-12 space-y-6">
          <div className="rounded-xl bg-blue-50 p-4 sm:p-6">
            <h2 className="flex items-center gap-2 font-semibold text-blue-900">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd" />
              </svg>
              How to use
            </h2>
            <ol className="mt-3 space-y-2 text-sm text-blue-800">
              <li>
                <strong>1. Download your data</strong>
                <br />
                From Instagram Settings → Download your information → Download data as JSON
              </li>
              <li>
                <strong>2. Extract files</strong>
                <br />
                Look for <code className="rounded bg-white px-1 font-mono">followers_1.json</code> and{" "}
                <code className="rounded bg-white px-1 font-mono">following.json</code> in{" "}
                <code className="rounded bg-white px-1 font-mono">connections/followers_and_following/</code>
              </li>
              <li>
                <strong>3. Upload & view</strong>
                <br />
                Upload both files here to see who doesn't follow back
              </li>
            </ol>
          </div>

          <div className="rounded-xl bg-green-50 p-4 sm:p-6">
            <h2 className="flex items-center gap-2 font-semibold text-green-900">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Privacy
            </h2>
            <p className="mt-2 text-sm text-green-800">
              ✓ All processing happens in your browser<br />
              ✓ No data is sent to any server<br />
              ✓ Safe to use on any network<br />
              ✓ Your files are never stored
            </p>
          </div>

          <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 sm:p-6">
            <h2 className="flex items-center gap-2 font-semibold text-orange-900">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              Tips
            </h2>
            <ul className="mt-2 space-y-1 text-sm text-orange-800">
              <li>• Click any profile card to open it on Instagram</li>
              <li>• Accounts are classified as Business, Creator, or Personal</li>
              <li>• Gender is estimated from username patterns</li>
              <li>• Export updated data anytime to see new changes</li>
            </ul>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-12 border-t border-zinc-200 pt-6 text-center text-xs text-zinc-500">
          <p>Built for Instagram cleanup • No affiliation with Instagram/Meta</p>
        </footer>
      </div>
    </main>
  );
}
