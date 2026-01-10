const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.sourceExts.push('ts', 'tsx', 'js', 'jsx', 'json');
config.resolver.extraNodeModules = {
  '@': __dirname,
};

module.exports = config;