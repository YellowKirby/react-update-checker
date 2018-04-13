module.exports = {
  presets: ['@babel/preset-env'],
  plugins: ['lodash', '@babel/proposal-object-rest-spread'],
  env: {
    esm: {
      presets: [['@babel/preset-env', { modules: false }]]
    }
  }
};
