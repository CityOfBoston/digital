# Permit Finder

Conversion of old PHP/jQuery app built by Qlarion.

Data comes from Civis and is SFTPed to an S3 bucket every 30 minutes. This app
periodically downloads the objects in the bucket and uses them to update a local
Level database.

The amount of data is in a bit of a spot where it’s not big enough that we’d
want to stand up a Redis cluster or something, and even scanning flat files is a
bit slow. But, it’s too much data to comfortably keep in memory in a Node
process (600mb or so loaded, and double that during new data fetching).

Level gives us a very fast key-value store that can store parsed versions of the
CSV files on disk.

The Level DB is created in a temporary directory (see the service configuration
in Terraform where a separate volume is mounted over /tmp to get the DB access
out of the container’s filesystem).

## URLs

### Localhost
http://localhost:3000/

### Staging
DEV: https://permit-finder.dev.digital-staging.boston.gov/
TEST: http://permit-finder.test.digital-staging.boston.gov/

### PROD
https://permit-finder.boston.gov/

### Deploys

- 2020.09.30: Security Patch: Remove hardcoded ssl pass in deploy script
- 2021.03.26: Post Security Patch test deploys
- 2022.08.11: PROD deploy - Push-through Docker Image Sizing Fix
