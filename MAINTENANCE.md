# RestoFlow Maintenance & Documentation Rules

This document establishes the workflow for keeping the project documentation (especially `todo2.md`) accurate and up-to-date.

---

## Rule 1: Update todo2.md After Every Feature Completion

**When:** Immediately after a feature is built and tested
**Who:** The developer who built the feature
**How:**

1. Open `todo2.md`
2. Find the feature in the appropriate module section
3. Change the checkbox from `[ ]` to `[x]`
4. If partial, use `[~]` and add a note about what's missing
5. Update the completion percentage at the top of the file:
   - Count all `[x]` items across all modules
   - Count all `[~]` items
   - Calculate: `(Built + Partial) / Total * 100%`
6. Update the "Last Updated" date to today
7. Commit with a clear message:
   ```bash
   git add todo2.md
   git commit -m "Update todo2.md: [Feature Name] completed ([x] mark)"
   ```

**Example:**
```
- [x] Offline mode — orders sync when internet restored
```

---

## Rule 2: Weekly Accuracy Audit (Every Friday)

**When:** End of work week (Friday afternoon)
**Who:** Project lead or senior developer
**How:**

1. Review the codebase for new features added since last Friday
2. Cross-reference with `todo2.md`:
   - Check if all built features are marked `[x]`
   - Check if any `[x]` features have been removed or broken
   - Verify `[~]` items still have partial implementation
3. If discrepancies found:
   - Update `todo2.md` to match actual code state
   - Add a note in the commit explaining the correction
4. Commit:
   ```bash
   git add todo2.md
   git commit -m "Weekly audit: Verify todo2.md accuracy (Friday check)"
   ```

**Audit Checklist:**
- [ ] All router procedures in `server/routers.ts` are accounted for
- [ ] All DB helpers in `server/db.ts` are accounted for
- [ ] All frontend pages in `client/src/pages/` are accounted for
- [ ] No broken features marked as `[x]`
- [ ] Completion percentage is accurate

---

## Rule 3: Update Before Every Checkpoint

**When:** Before calling `webdev_save_checkpoint`
**Who:** The developer saving the checkpoint
**How:**

1. Run the weekly audit (Rule 2) if not done recently
2. Ensure all completed work is marked `[x]`
3. Update the "Last Updated" date to today
4. Verify the completion percentage is correct
5. Commit `todo2.md` if any changes were made
6. Then proceed with `webdev_save_checkpoint`

**Checkpoint Commit Message:**
```bash
git add todo2.md
git commit -m "Pre-checkpoint: Update todo2.md to [X]% completion"
```

---

## Rule 4: Document Partial Features Clearly

**When:** A feature is partially implemented
**Who:** The developer working on the feature
**How:**

Use `[~]` mark and add a comment explaining what's missing:

```markdown
- [~] Card payments (Stripe schema exists, needs API key activation)
- [~] Real-time inventory levels (DB helpers built, UI pending)
- [~] Demand forecasting (schema exists, ML model pending)
```

**Partial Status Examples:**
- Backend exists, UI incomplete
- UI exists, backend incomplete
- Feature works but has TS errors that don't block runtime
- Feature needs external service activation (API keys, webhooks)
- Feature needs external audit or compliance work

---

## Rule 5: When Removing or Reverting Features

**When:** A feature is removed, disabled, or reverted
**Who:** The developer making the change
**How:**

1. Change the mark from `[x]` back to `[ ]`
2. Add a brief note explaining why:
   ```markdown
   - [ ] Feature Name — removed due to [reason]
   ```
3. Commit with explanation:
   ```bash
   git commit -m "Remove [Feature Name]: [reason]"
   ```

**Reasons to document:**
- Removed due to scope change
- Disabled due to bug
- Reverted to previous version
- Replaced with different approach
- Deferred to later phase

---

## Rule 6: Module Completion Summary

**When:** After completing an entire module
**Who:** Project lead
**How:**

1. Update the module row in the "Summary by Module" table
2. Recalculate overall completion percentage
3. Add a note about module status:
   ```markdown
   | 5.1 POS & Orders | 45 | 39 | 2 | 4 | 91% | ✅ Mostly complete |
   ```
4. Commit:
   ```bash
   git commit -m "Module 5.1 complete: [X]% of features built"
   ```

---

## Rule 7: Automated Checks (Future)

**Planned:** Implement CI/CD checks to validate todo2.md

- [ ] GitHub Actions workflow to verify todo2.md syntax
- [ ] Count actual router procedures and compare to `[x]` marks
- [ ] Count actual DB helpers and compare to `[x]` marks
- [ ] Count actual pages and compare to `[x]` marks
- [ ] Warn if completion percentage is inaccurate

---

## Quick Reference: Completion Status Symbols

| Symbol | Meaning | Example |
|--------|---------|---------|
| `[x]` | **Built** — Feature is complete, tested, and working | Multi-device POS support |
| `[~]` | **Partial** — Backend or UI exists, but not fully complete | Card payments (needs Stripe key) |
| `[ ]` | **Pending** — Not yet implemented | Apple Pay integration |

---

## File Structure for Documentation

```
restaurant-management-platform/
├── todo2.md              ← Feature audit (THIS FILE)
├── MAINTENANCE.md        ← Rules for keeping docs current (THIS FILE)
├── todo.md               ← Dev team task list
├── README.md             ← Project overview
├── ARCHITECTURE.md       ← System design (future)
└── CHANGELOG.md          ← Release notes (future)
```

---

## Commit Message Convention

All todo2.md commits should follow this pattern:

```
Update todo2.md: [Feature Name] [status]

- Changed [Feature Name] from [ ] to [x]
- Updated completion: X% → Y%
- Module [5.X] now Z% complete
```

**Example:**
```
Update todo2.md: Offline mode completed

- Changed "Offline mode" from [ ] to [x]
- Updated completion: 35% → 36%
- Module 5.1 now 91% complete
```

---

## Contact & Questions

If you have questions about:
- **Feature status:** Check todo2.md and the "Maintenance Rule" section
- **What to build next:** Check "Next Priority Features" section in todo2.md
- **How to update docs:** See Rule 1-7 in this file
- **Breaking changes:** Document in CHANGELOG.md (when created)

---

**Last Updated:** 2026-02-19
**Maintained By:** Development Team
