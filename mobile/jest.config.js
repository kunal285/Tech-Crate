module.exports = {
  preset: '@react-native/jest-preset',
  setupFiles: ['./jest.setup.js'],
  setupFilesAfterEnv: ['./jest.setup.js'],
  transform: {
    '^.+\\.(js|jsx|ts|tsx|mjs)$': 'babel-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|react-native-toast-message|@react-navigation|react-native-vector-icons|react-native-linear-gradient|react-native-safe-area-context|react-native-screens|react-native-svg|react-native-paper|react-native-modal|lucide-react-native)/)',
  ],
};



