const { withGradleProperties } = require('expo/config-plugins');

// Keep device and emulator libraries when Expo regenerates the ignored android folder.
module.exports = function withAndroidArchitectures(config) {
  return withGradleProperties(config, (config) => {
    config.modResults = config.modResults.filter(
      (item) => item.type !== 'property' || item.key !== 'reactNativeArchitectures'
    );
    config.modResults.push({
      type: 'property',
      key: 'reactNativeArchitectures',
      value: 'arm64-v8a,x86_64',
    });
    return config;
  });
};
