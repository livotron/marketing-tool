module.exports = {
    "env": {
        "browser": true,
        "es2021": true,
        "node": true
    },
    "extends": [
        "eslint:recommended",
        "plugin:react/recommended",
        "plugin:@typescript-eslint/recommended"
    ],
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "ecmaFeatures": {
            "jsx": true
        },
        "ecmaVersion": 12,
        "sourceType": "module"
    },
    "plugins": [
        "react",
        "@typescript-eslint"
    ],
    "rules": {
        "@typescript-eslint/explicit-function-return-type": ["off", {
            "allowTypedFunctionExpressions": true
        }],
        "@typescript-eslint/no-var-requires": 0,
        "react/prop-types": 0,
        "@typescript-eslint/ban-ts-comment": 0,
        "no-debugger": 0,

    }
};
