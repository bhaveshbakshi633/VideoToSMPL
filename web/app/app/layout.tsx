import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Control centre",
  description: "Drop a video, run the pipeline, download the artifacts.",
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
