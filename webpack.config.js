const path = require('path');

module.exports = {
    entry: './scripts/contentScript.js',   // Entry point for the content script
    output: {
        filename: 'bundle.js',      // Output file name
        path: path.resolve(__dirname, 'dist'), // Output directory
    },
    mode: 'production',              // Production mode for optimized code
    module: {
        rules: [
            {
                test: /\.js$/,       // Transpile JavaScript files
                exclude: /node_modules/,  // Exclude node_modules
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'],  // Transpile for compatibility
                    },
                },
            },
        ],
    },
};
