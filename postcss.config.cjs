module.exports = {
  plugins: [
    require("postcss-import"),
    require("postcss-nesting"),
    require("./postcss-breakpoints.cjs"),
    require("postcss-custom-media"),
    require("postcss-combine-duplicated-selectors"),
    require("postcss-discard-empty"),
    require("./postcss-whitespace.cjs"),
    require("autoprefixer"),
  ],
};
