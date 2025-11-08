# Update Commit Hash

After making a commit, update the commit hash displayed in the game.

Run this command to update the hash in GameScene.ts:

```bash
HASH=$(git log -1 --format="%h") && sed -i '' "s/const commitHash = '[^']*'; \/\/ Current commit ID/const commitHash = '$HASH'; \/\/ Current commit ID/" src/scenes/GameScene.ts && git add src/scenes/GameScene.ts && git commit --amend --no-edit --no-verify
```

This ensures the game always displays the current commit ID in the top-right corner.
