const { NODE_ENV } = process.env;

const options = NODE_ENV === "test" ? { targets: { node: "current" } } : {};

module.exports = (api) => {
  const isESM = api.env("esm");

  return {
    presets: [
      [
        "@babel/preset-env",
        {
          ...options,
          modules: isESM ? false : "auto",
        },
      ],
    ],
  };
};
