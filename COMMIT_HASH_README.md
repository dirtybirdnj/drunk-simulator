# Commit Hash Auto-Update System

## For Claude/AI Agents

**IMPORTANT**: After every git commit, you MUST update the commit hash in the game.

### Automatic Process (Post-Commit Hook Installed)

A git post-commit hook is installed at `.git/hooks/post-commit` that automatically:
1. Gets the latest commit hash
2. Updates `src/scenes/GameScene.ts` line 87
3. Amends the commit with the updated hash

### Manual Process (If Hook Fails)

If the automatic hook doesn't work, manually run:

```bash
# Get the latest commit hash
HASH=$(git log -1 --format="%h")

# Update the file
sed -i '' "s/const commitHash = '[^']*'; \/\/ Current commit ID/const commitHash = '$HASH'; \/\/ Current commit ID/" src/scenes/GameScene.ts

# Commit the update
git add src/scenes/GameScene.ts
git commit --amend --no-edit --no-verify
```

### For Every Code Change

**WORKFLOW:**
1. Make code changes
2. Stage files: `git add -A`
3. Commit: `git commit -m "message"`
4. The hook automatically updates the hash and amends the commit
5. The game will now display the correct commit ID

### Verification

Check the top-right corner of the game screen. It should show:
```
[commit-hash] | [time] [date]
```

If it shows an old hash, the hook didn't run properly.

### Why This Matters

The commit hash display ensures:
- The user knows exactly what version is running
- AI agents can verify their changes are loaded
- Debugging is easier with version tracking
- Hot reload issues are immediately visible

### Current Commit Hash Location

**File**: `src/scenes/GameScene.ts`
**Line**: ~87
**Pattern**: `const commitHash = 'xxxxxxx'; // Current commit ID`

Always update this line after committing!
