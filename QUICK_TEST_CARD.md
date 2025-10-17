# Quick Test Card - Modal Auto-Close

## 🎯 What to Test
Modal should close automatically after creating a project (success or failure)

---

## ⚡ Quick Test (30 seconds)

### Steps:
1. **Open Console** (Press F12)
2. **Click** "Create New Project"
3. **Fill** Name="Test", Key="TST", Dates=any valid range
4. **Click** "Create Project"
5. **Watch** for green alert
6. **Count** 2 seconds
7. **Verify** modal disappears

---

## ✅ Expected Results

### Console Should Show:
```
📂 Modal opened, resetting form
🔔 Auto-close triggered for: success
⏰ Auto-close timeout fired, closing modal now
🧹 Cleaning up auto-close timeout
```

### Visual Should Show:
- ✓ Green alert appears
- ✓ "Project created successfully!"
- ✓ "Closing in 2 seconds..."
- ✓ Modal disappears automatically
- ✓ Project appears in dashboard
- ✓ Dates show correctly (not "Invalid Date")

---

## ❌ If It Fails

### Modal Doesn't Close?
- Check console for `🔔` emoji
- If missing: submit might have failed silently
- Look for red error messages in console

### Dates Show "Invalid Date"?
- Check backend is running
- Verify dates were sent in ISO format
- Look in Network tab → Payload

### Form Has Old Data?
- Check console for `📂 Modal opened`
- If missing: state not resetting
- Try closing and reopening

---

## 🐛 Debug Emojis

| Emoji | Meaning |
|-------|---------|
| 📂 | Modal opened fresh |
| 🔔 | Auto-close scheduled |
| ⏰ | Auto-close fired |
| 🧹 | Cleanup done |
| 🚪 | Manual close |
| ⚠️ | Close prevented |

---

## 🎉 Success Criteria

All must be true:
- [ ] Modal closes in 2 seconds on success
- [ ] Modal closes in 3 seconds on error  
- [ ] Form is empty when reopened
- [ ] Dates display correctly
- [ ] Team assignment works
- [ ] Console shows emoji logs

---

**Status:** READY TO TEST ✓  
**Time Needed:** 30 seconds  
**Difficulty:** Easy 🟢
