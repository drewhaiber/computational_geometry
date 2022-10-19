
module.exports = {
    mode: "production",
    entry: './src/delaunay-triangulation.ts',
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/
            },
            {
                test: /\.vert$/i,
                use: 'raw-loader',
            },
            {
                test: /\.frag$/i,
                use: 'raw-loader',
            },
        ],
    },
    resolve: {
        extensions: [ '.ts', '.tsx', '.js', '.jsx' ],
        alias: [

        ]
    },
    output: {
        filename: 'dist/delaunay-triangulation.js',
        path: __dirname,
    }
};
