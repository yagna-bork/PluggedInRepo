module.exports = {
  extends: 'universe/native',
  plugins: ['react', 'react-native'],
  rules: {
    'react/jsx-closing-bracket-location': 2,
    'brace-style': [2, '1tbs'],
    'react/jsx-max-props-per-line': [
      'error',
      { maximum: 1, when: 'multiline' }
    ],
    'react/no-multi-comp': ['error', { ignoreStateless: true }],
    'react/prefer-es6-class': ['error', 'always'],
    'react/require-render-return': 'error',
    'react/jsx-wrap-multilines': [
      'error',
      {
        declaration: 'parens-new-line',
        assignment: 'parens-new-line',
        return: 'parens-new-line',
        arrow: 'parens-new-line',
        condition: 'parens-new-line',
        logical: 'parens-new-line',
        prop: 'parens-new-line'
      }
    ],
    'react/jsx-first-prop-new-line': ['error', 'multiline-multiprop'],
    'react/jsx-equals-spacing': ['error', 'never'],
    'react/jsx-indent': ['error', 2],
    'react/jsx-tag-spacing': [
      'error',
      {
        closingSlash: 'never',
        beforeSelfClosing: 'always',
        afterOpening: 'never',
        beforeClosing: 'never'
      }
    ],
    'react-native/no-inline-styles': 2,
    'react-native/no-unused-styles': 2,
    'react/jsx-space-before-closing': ['off', 'always'],
    'react/no-unused-state': 'error',
    'no-unexpected-multiline': 'error'
  }
};