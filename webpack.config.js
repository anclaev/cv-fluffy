/* eslint-disable no-undef */
const path = require("path")

const HtmlWebpackPlugin = require("html-webpack-plugin")
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const TerserPlugin = require("terser-webpack-plugin")
const OptimizeCssAssetsPlugin = require("optimize-css-assets-webpack-plugin")
const { CleanWebpackPlugin } = require("clean-webpack-plugin")

const isDev = process.env.NODE_ENV === "development"
const isProd = !isDev

const babelPresets = (extra = []) => {
  const presets = ["@babel/preset-env"]

  if (extra.indexOf("react") >= 0) {
    presets.push("@babel/preset-react")
  }

  if (extra.indexOf("ts") >= 0) {
    presets.push("@babel/preset-typescript")
  }

  return presets
}

const jsLoaders = (babelProps = []) => {
  const loaders = [
    {
      loader: "babel-loader",
      options: {
        presets: babelPresets(babelProps),
        plugins: ["@babel/plugin-proposal-class-properties"],
      },
    },
  ]

  if (isDev) {
    loaders.push("eslint-loader")
  }

  return loaders
}

const cssLoaders = (extra) => {
  const loaders = [
    {
      loader: MiniCssExtractPlugin.loader,
    },
    "css-loader",
  ]

  if (extra) {
    loaders.push(extra)
  }

  return loaders
}

const optimization = () => {
  const config = {
    splitChunks: {
      chunks: "all",
    },
  }

  if (isProd) {
    config.minimizer = [new OptimizeCssAssetsPlugin(), new TerserPlugin()]
  }

  return config
}

module.exports = {
  context: path.resolve(__dirname, "src"),
  entry: {
    main: "./index.ts",
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].[contenthash].bundle.js",
  },
  module: {
    rules: [
      {
        test: "/.css$/",
        use: cssLoaders(),
      },
      {
        test: /\.s[ac]ss$/,
        use: cssLoaders("sass-loader"),
      },
      {
        test: "/.(png|jpg|svg)$/",
        use: ["file-loader"],
      },
      {
        test: "/.(ttf|woff|woff2|eot)$/",
        use: ["file-loader"],
      },
      {
        test: "/.js$/",
        exclude: "/node_modules/",
        use: jsLoaders(),
      },
      {
        test: "/.ts$/",
        exclude: "/node_modules/",
        use: jsLoaders(["ts"]),
      },
      {
        test: "/.jsx$/",
        exclude: "/node_modules/",
        use: jsLoaders(["react"]),
      },
      {
        test: "/.tsx$/",
        exclude: "/node_modules/",
        use: jsLoaders(["ts", "react"]),
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".jsx", ".js"],
    alias: {
      Assets: path.resolve(__dirname, "./src/assets"),
      Styles: path.resolve(__dirname, "./src/styles"),
    },
  },
  optimization: optimization(),
  devServer: {
    port: 4000,
    hot: isDev,
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./index.html",
      minify: {
        collapseWhitespace: isProd,
        removeComments: isProd,
        removeRedundantAttributes: isProd,
        useShortDoctype: isProd,
      },
    }),
    new MiniCssExtractPlugin({
      filename: "[name].[contenthash].css",
    }),
    new CleanWebpackPlugin(),
  ],
}
