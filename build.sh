#!/bin/bash
# Unzip the site into the publish directory for Netlify
mkdir -p publish
unzip -oq prenatal_updated_site.zip -d publish
