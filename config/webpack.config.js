const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const {merge} = require('webpack-merge');

const config = {
    entry: path.resolve(__dirname, '../src/app.js'),
    module: {
        rules: [
            {
                test: /\.m?js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                    presets: ['@babel/preset-env']
                    }
                }
            }
        ],   
    },
};

const umd = {
    name: 'umd',
    output: {
        filename: 'sevejs.umd.js',
        path: path.resolve(__dirname, '../dist'),
        library: 'Sevejs',
        libraryTarget: 'umd'
    },
 
};
const global =  {
    name: 'global',
    output: {
        filename: 'sevejs.min.js',
        path: path.resolve(__dirname, '../dist'),
        libraryTarget: 'window'
    }
};

module.exports = [merge(config, umd), merge(config, global)];