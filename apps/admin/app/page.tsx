export default function AdminHomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="max-w-xl rounded-2xl border border-white/10 bg-white/5 p-10 text-center shadow-2xl">
        <p className="mb-3 text-sm uppercase tracking-[0.3em] text-emerald-300">
          UpDrafted Admin
        </p>
        <h1 className="text-4xl font-semibold">Hello world.</h1>
        <p className="mt-4 text-base text-slate-300">
          This workspace is ready for the future admin dashboard while the main app
          continues to run from the existing deployment flow.
        </p>
      </div>
    </main>
  );
}
