#!/bin/bash
WORKSPACE="$1/"

echo "ROOT DIR - /APP/SCRIPTS/.. - WORKSPACE: $WORKSPACE"

# CLEAN WEBAPPs
webApps=$( ls -1p /app/services-js/ | grep / | sed 's/^\(.*\)/\1/' )

for webapp in $webApps; do
  if [[ $WORKSPACE != $webapp ]]; then
    echo "DELETE DIR:" services-js/$webapp
    rm -rf /app/services-js/$webapp
  else
    echo "DELETE DIR for $WORKSPACE > node_modules"
    rm -rf /app/services-js/$WORKSPACE/node_modules
  fi
done

# CLEAN MODULES
modulesJs=$( ls -1p /app/modules-js/ | grep / | sed 's/^\(.*\)/\1/' )

for moduleJs in $modules; do
  echo "Removing Cleaning Modules-js - $moduleJs"
  rm -rf /app/services-js/$moduleJs/node_modules
done

# CLEAN APPs ROOT
rm -rf /app/node_modules

exit
