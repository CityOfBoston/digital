#!/bin/sh

curl "https://intake.opbeat.com/api/v1/organizations/$OPBEAT_ORGANIZATION_ID/apps/$OPBEAT_APP_ID/releases/" \
-H "Authorization: Bearer $OPBEAT_SECRET_TOKEN" \
-d rev=`git log -n 1 --pretty=format:%H` \
-d branch=`git rev-parse --abbrev-ref HEAD` \
-d status=completed
