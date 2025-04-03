import { type Metadata } from "next";
import { TRPCReactProvider } from "~/common/trpc/client";
import "~/common/styles/globals.css";

export const metadata: Metadata = {
  title: "Kraken Demo",
  description: "Basic demonstration",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <TRPCReactProvider>{children}</TRPCReactProvider>
      </body>
    </html>
  );
}
