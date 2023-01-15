const path = require('path');
module.exports = [
  {
    name: 'single',
    entry: './src/index.ts',
    target: "node",
    mode: 'production',
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
      ],
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
      filename: 'bundle.js',
      path: path.resolve(__dirname, 'dist'),
    },
  },
  {
    name: 'balancer',
    entry: './src/index-balancer.ts',
    target: "node",
    mode: 'production',
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
      ],
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
      filename: 'bundle-balancer.js',
      path: path.resolve(__dirname, 'dist'),
    },
  },
];
