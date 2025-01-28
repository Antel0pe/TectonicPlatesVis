import type { NextConfig } from "next";
import type { Configuration } from "webpack";
import CopyWebpackPlugin from "copy-webpack-plugin";
import path from "path";

const nextConfig: NextConfig = {
  webpack: (config: Configuration) => {
    if (!config.plugins) {
      config.plugins = [];
    }
    
    config.plugins.push(
      new CopyWebpackPlugin({
        patterns: [
          {
            from: path.join('node_modules', 'cesium', 'Build', 'Cesium'),
            to: path.join('static', 'cesium'),
          },
        ],
      })
    );

    if (!config.resolve) {
      config.resolve = {};
    }

    if (!config.resolve.alias) {
      config.resolve.alias = {};
    }

    config.resolve.alias['cesium'] = path.resolve('node_modules/cesium');

    return config;
  },
};

export default nextConfig;