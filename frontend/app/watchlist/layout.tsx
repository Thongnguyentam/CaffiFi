import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Watchlist | CaffiFi",
  description: "One-stop shop for all your meme coin needs",
};

export default function WatchlistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
