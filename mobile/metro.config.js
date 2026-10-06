const path = require('path');
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

const reactNativeShimPath = path.resolve(__dirname, 'src/shims/ReactNativeShim.js');
const featureFlagsShimPath = path.resolve(__dirname, 'src/shims/ReactNativeFeatureFlagsShim.js');

const config = {
  resolver: {
    resolveRequest: (context, moduleName, platform) => {
      if (
        moduleName === 'react-native/Libraries/Renderer/shims/ReactNative' ||
        moduleName.endsWith('/Libraries/Renderer/shims/ReactNative')
      ) {
        return {
          filePath: reactNativeShimPath,
          type: 'sourceFile',
        };
      }
      if (moduleName.includes('ReactNativeFeatureFlags')) {
        return {
          filePath: featureFlagsShimPath,
          type: 'sourceFile',
        };
      }
      return context.resolveRequest(context, moduleName, platform);
    },
  },
};

module.exports = mergeConfig(defaultConfig, config);
