const ReactFabric = require('react-native/Libraries/Renderer/shims/ReactFabric');

module.exports = {
  findHostInstance_DEPRECATED: ReactFabric.findHostInstance_DEPRECATED || function(component) { return component; },
  ReactFabric: ReactFabric,
};
