#!/bin/sh
set -e

# setup ssh-agent and provide the GitHub deploy key
eval "$(ssh-agent -s)"
openssl aes-256-cbc -K $encrypted_f009e2359ef0_key -iv $encrypted_f009e2359ef0_iv -in deploykey.enc -out id_deploy -d
chmod 600 id_deploy
ssh-add id_deploy

./node_modules/.bin/gh-pages -d public -b gh-pages