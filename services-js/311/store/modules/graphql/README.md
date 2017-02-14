This directory contains .graphql files for the GraphQL queries and mutations
used by action creators in the services directory.

**VERY IMPORTANT NOTE**: These files are cached by Babel, which cannot track
changes in them. To pick up changes to these files, touch the __importing__
file.

These files are split out so that the `apollo-codegen` utility can create
Flow types for them, which are available in the schema.flow.js file.

Run `yarn generate-graphql-flow` to create schema.flow.js.

The .graphql files are loaded as modules that export strings by the
`babel-plugin-inline-import` plugin, registered in .babelrc. (We use babel
rather than a webpack loader to support SSR loading of the queries.)
