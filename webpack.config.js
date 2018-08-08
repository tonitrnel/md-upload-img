// const webpack = require('webpack');
const path = require('path');
module.exports = {
    context: path.join(__dirname),
    entry:'./uploads.js',
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                    query: {
                        presets: ['@babel/preset-env']
                    }
                }
            }
        ]
    },
    output: {
        path: __dirname,
        filename: './bundle.js'
    }
};