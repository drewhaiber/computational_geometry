module.exports = {
    mode: "production",
    entry: './delaunay-triangulation.ts',
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/
            },
        ],
    },
    resolve: {
        extensions: [ '.ts', '.tsx', '.js', '.jsx' ]
    },
    output: {
        filename: 'delaunay-triangulation.js',
        path: __dirname,
    }
};