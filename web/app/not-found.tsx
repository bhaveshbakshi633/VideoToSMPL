import Link from "next/link";

export default function NotFound() {
  return (
    <section className="container-page flex min-h-[70vh] flex-col items-center justify-center text-center">
      <p className="font-mono text-sm text-fg-subtle">404</p>
      <h1 className="mt-2 text-4xl font-semibold">Page not found</h1>
      <p className="mt-3 max-w-md text-fg-muted">
        The page you&apos;re looking for doesn&apos;t exist. It might have moved or never
        existed in the first place.
      </p>
      <Link href="/" className="btn-primary mt-8">
        Back to home
      </Link>
    </section>
  );
}
