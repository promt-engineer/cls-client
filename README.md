To install dependencies type

    npm i

For development use

    npm run local


Fork Alternative

    git remote add game {game_url}
    git push -u game master

Inside your forked repo, you can add the base slot as a remote with

    git remote add upstream { base_slot_url }

Then to update your fork with the latest changes from the base slot

    git fetch upstream
    git merge upstream/master
    git push