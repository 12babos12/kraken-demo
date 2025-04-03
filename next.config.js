import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
  async redirects() {
    return [
      {
        source: "/",
        destination: "/dashboard?asset=btc",
        permanent: true,
      },
    ];
  },
};

export default config;
