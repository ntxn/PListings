const babelLoader = {
  loader: 'babel-loader',
  options: {
    cacheDirectory: true,
    presets: ['@babel/preset-react', '@babel/preset-env'],
  },
};

module.exports = {
  cache: true,
  // Tell webpack to run ts-loader on every file it runs through
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: [babelLoader, 'ts-loader'],
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [babelLoader],
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
};
