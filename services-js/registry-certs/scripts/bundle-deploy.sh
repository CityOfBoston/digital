#!/bin/sh

# Makes a zip of all of our source directory that's in git
# (Excludes node_modules, .git, and any other generated files)
git archive -o deploy.zip HEAD

# Compile our server and client JS
gulp build

# Add server and client JS to the deploy zip
zip -r deploy.zip build .next
