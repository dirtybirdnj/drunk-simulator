# Instructions for AI Agents (Claude Code)

## CRITICAL: Commit Hash Updates

**After EVERY git commit, you MUST manually update the commit hash.**

### Process:

1. Make your code changes
2. Commit normally: `git add -A && git commit -m "message"`
3. **IMMEDIATELY after committing**, run:
   ```bash
   HASH=$(git log -1 --format="%h") && sed -i '' "s/const commitHash = '[^']*'; \/\/ Current commit ID/const commitHash = '$HASH'; \/\/ Current commit ID/" src/scenes/GameScene.ts
   ```
4. Add and commit the hash update:
   ```bash
   git add src/scenes/GameScene.ts && git commit -m "Update commit hash to $HASH"
   ```

### Why This Matters

The game displays the commit hash in the top-right corner. This lets the user (and you) verify that the latest code is running. Without this, there's no way to know if hot-reload worked or if the browser cached old code.

### Location

**File**: `src/scenes/GameScene.ts`
**Line**: ~87
**Pattern**: `const commitHash = 'xxxxxxx'; // Current commit ID`

### Quick Command

```bash
HASH=$(git log -1 --format="%h") && \
sed -i '' "s/const commitHash = '[^']*'; \/\/ Current commit ID/const commitHash = '$HASH'; \/\/ Current commit ID/" src/scenes/GameScene.ts && \
git add src/scenes/GameScene.ts && \
git commit -m "Update commit hash to $HASH"
```

Copy/paste this after every commit!
