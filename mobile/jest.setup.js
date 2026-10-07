import 'react-native-gesture-handler/jestSetup';

// Mock react-native-async-storage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock safe-area-context
jest.mock('react-native-safe-area-context', () => {
  const inset = { top: 0, right: 0, bottom: 0, left: 0 };
  return {
    SafeAreaProvider: jest.fn(({ children }) => children),
    SafeAreaConsumer: jest.fn(({ children }) => children(inset)),
    SafeAreaView: jest.fn(({ children }) => children),
    useSafeAreaInsets: jest.fn(() => inset),
    useSafeAreaFrame: jest.fn(() => ({ x: 0, y: 0, width: 390, height: 844 })),
  };
});

// Mock react-native-screens
jest.mock('react-native-screens', () => {
  const React = require('react');
  const View = require('react-native').View;
  return {
    enableScreens: jest.fn(),
    ScreenContainer: View,
    Screen: View,
    ScreenStack: View,
    NativeScreen: View,
    NativeScreenContainer: View,
  };
});

// Mock google-signin
jest.mock('@react-native-google-signin/google-signin', () => ({
  GoogleSignin: {
    configure: jest.fn(),
    hasPlayServices: jest.fn().mockResolvedValue(true),
    signIn: jest.fn().mockResolvedValue({ user: { id: '1' } }),
    signOut: jest.fn().mockResolvedValue(true),
    isSignedIn: jest.fn().mockResolvedValue(false),
  },
}));

// Mock vector icons
jest.mock('react-native-vector-icons/Ionicons', () => 'Icon');
jest.mock('react-native-vector-icons/MaterialIcons', () => 'Icon');
jest.mock('react-native-vector-icons/Feather', () => 'Icon');

// Mock toast message
jest.mock('react-native-toast-message', () => {
  const React = require('react');
  const View = require('react-native').View;
  const ToastComponent = (props) => React.createElement(View, props);
  ToastComponent.show = jest.fn();
  ToastComponent.hide = jest.fn();
  return ToastComponent;
});

// Mock lucide-react-native
jest.mock('lucide-react-native', () => {
  const React = require('react');
  const View = require('react-native').View;
  return new Proxy({}, {
    get: (_, prop) => (props) => React.createElement(View, props),
  });
});


// Mock react-native-linear-gradient
jest.mock('react-native-linear-gradient', () => 'LinearGradient');

