---
description: Update STATUS/DECISIONS/CLAUDE.md for this session and propose a commit
---

End-of-session housekeeping. Base everything on the actual code, `git status`, `git diff`, `git log` since the last STATUS update, and this conversation — not on assumptions.

1. **Rewrite `docs/STATUS.md`** from scratch (never append). Keep the existing sections, max ~50 lines:
   - Phase and goal
   - Done last session (max 5, this session's work)
   - Next 3 concrete steps
   - Open questions needing my decision (drop the ones resolved this session)
   - Known issues / tech debt
   - Last updated: today's date + short hash of HEAD (`git rev-parse --short HEAD`)

2. **Append to `docs/DECISIONS.md`** one entry per decision made this session, using the existing format and next number. Never edit or delete past entries; a reversal is a new entry that says which one it supersedes. Skip if no decisions were made.

3. **Edit `CLAUDE.md` / `frontend/CLAUDE.md` only if something stable changed**: a new command, folder, convention or working rule. Keep within line limits, no duplication — link to the source instead. Otherwise leave them alone.

4. **Show me** `git diff --stat` and the full diff of the files you changed, then propose a conventional commit message (`docs: …` unless code is included).

Do NOT commit, stage or push. Wait for my OK.
