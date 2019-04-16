# storybook-common

## Manually setting up a new project
1. Copy `.storybook/` and its contents to the project root

2. In the new project, update `.storybook/config.js` with the project name:
    ```
    addParameters(storybookOptions('project-name'));
    
    ```

3. Add the following packages to the project’s `package.json`:
    ```
    "devDependencies": {
        "@cityofboston/storybook-common": "^0.0.0",
        "@percy/storybook": "^3.0.2",
        "@storybook/addon-actions": "5.0.8",
        "@storybook/addon-storyshots": "5.0.8",
        "@storybook/addons": "5.0.8",
        "@storybook/react": "5.0.8",
    ```

4. Add the following scripts to the project’s `package.json`:
    ```
    "scripts": {
        "storybook": "start-storybook -p 9001 -s static",
        "prepare-deploy": "build-storybook -s static",
    ```
