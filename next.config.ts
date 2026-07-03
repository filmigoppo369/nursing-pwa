import withPWA from "@ducanh2912/next-pwa";

const config = {
  turbopack: {},
};

export default withPWA({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
})(config);