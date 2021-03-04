const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = (_, argv) => {
  return {
    entry: './index.js',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: `hls-parser${argv.mode === 'production' ? '.min' : ''}.js`,
      library: 'HLS',
      libraryTarget: 'umd'
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      ]
    },
    devtool: argv.mode === 'production' ? 'source-map' : false,
    optimization: {
      minimize: argv.mode === 'production',
      minimizer: [
        new TerserPlugin()
      ]
    }
  };
};
