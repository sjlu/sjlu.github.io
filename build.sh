#!/bin/bash

set -e

node download-contentful.js
bundle exec jekyll build
