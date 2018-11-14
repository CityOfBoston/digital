module.exports = {
  "parser": "babel-eslint",
  "env": {
    "browser": true,
    "jest": true,
    "es6": true,
    "node": true
  },
  "plugins": [
    "flowtype",
    "import",
    "react",
    "prettier",
    "jsx-a11y"
  ],
  "extends": [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:flowtype/recommended",
    "plugin:jsx-a11y/recommended",
    "prettier",
    "prettier/flowtype",
    "prettier/react"
  ],
  "rules": {
    // Trips up with next/link, which adds the href automatically
    "jsx-a11y/anchor-is-valid": 0,
    // Seems broken in v6.0.0
    "jsx-a11y/label-has-for": 0,
    // IE9+10 don't have the value set when onInput fires
    "jsx-a11y/no-onchange": 0,
    "prettier/prettier": ["error", {
      "singleQuote": true,
      "trailingComma": "es5"
    }]
  }
};
