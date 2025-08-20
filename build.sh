#!/bin/bash
set -euo pipefail

mkdir -p publish
unzip -oq prenatal_updated_site.zip -d publish

rm -rf publish/api
cp -r api publish/api
