module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins: [
      ['module-resolver', {
        alias: {
          '@': './', // теперь "@/components/..." указывает на корень проекта
        },
        extensions: ['.tsx', '.ts', '.js', '.json'],
      }],
      'react-native-reanimated/plugin', // оставь последним
    ],
  };
};