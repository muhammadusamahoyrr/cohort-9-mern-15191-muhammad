// Babel is only used by Jest. Vite compiles JSX with esbuild and never reads this file.
//
// Why CJS output instead of ESM + --experimental-vm-modules:
//   The project is JavaScript (assignment brief, no TypeScript), so we lean on
//   babel-jest to transpile ES modules to CommonJS for Jest's default runner.
//   This avoids the experimental Node flag and jest.unstable_mockModule rewrites
//   while the tests pass and coverage stays above threshold. Revisit if Jest's
//   native ESM support stabilises in a future major.
module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    ['@babel/preset-react', { runtime: 'automatic' }],
  ],
};
