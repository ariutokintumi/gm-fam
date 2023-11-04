import "../styles/globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import { Montserrat } from "next/font/google";
import { ChakraProvider } from "@chakra-ui/react";
import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import type { AppProps } from "next/app";
import { configureChains, createConfig, WagmiConfig } from "wagmi";
import { foundry, sepolia } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";
import toast, { Toaster } from "react-hot-toast";

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [
    ...(process.env.NEXT_PUBLIC_ENABLE_LOCAL === "true"
      ? [foundry]
      : [sepolia]),
  ],
  [publicProvider()]
);

const { connectors } = getDefaultWallets({
  appName: "gmFam",
  projectId: process.env.NEXT_PUBLIC_ENABLE_PROJECT_ID ?? "",
  chains,
});

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
});

const fonts = Montserrat({
  subsets: ["latin-ext"],
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <div {...pageProps} className={fonts.className}>
      <ChakraProvider>
        <WagmiConfig config={wagmiConfig}>
          <RainbowKitProvider chains={chains}>
            <Toaster />
            {process.env.NEXT_PUBLIC_ENABLE_LOCAL === "true" && (
              <div
                style={{
                  padding: ".5rem",
                  backgroundColor: "#ff8a82",
                  color: "black",
                }}
              >
                <p>You are using anvil local network.</p>
              </div>
            )}
            <Component />
          </RainbowKitProvider>
        </WagmiConfig>
      </ChakraProvider>
    </div>
  );
}

export default MyApp;
