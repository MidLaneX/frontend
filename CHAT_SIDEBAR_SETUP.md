# Chat Sidebar - Quick Setup Guide

## What's New?
A floating chat button has been added to the frontend application that opens a sidebar containing the messaging app.

## Features
✅ Floating chat button in bottom-right corner  
✅ Collapsible sidebar (400px wide when open)  
✅ Embedded messaging app in iframe  
✅ Badge for unread messages (ready for integration)  
✅ Smooth animations and transitions  
✅ No changes to messaging app required  

## Setup Instructions

### 1. Configure Messaging App URL
Add this line to your `.env` file in the frontend folder:
```bash
VITE_MESSAGING_APP_URL=http://localhost:3001
```

Change the URL if your messaging app runs on a different port or domain.

### 2. Start Both Applications

**Terminal 1 - Frontend:**
```bash
cd frontend
npm install  # if needed
npm run dev
```

**Terminal 2 - Messaging App:**
```bash
cd Messaging-app
npm install  # if needed
npm start
```

### 3. Access the Feature
1. Open the frontend application (usually http://localhost:5173)
2. Log in to your account
3. Look for the floating chat button at the bottom-right corner
4. Click it to open the messaging sidebar

## How to Use

### Opening the Chat
- Click the floating chat button (💬) in the bottom-right corner

### Collapsing the Sidebar
- Click the collapse icon (◀) in the sidebar header to minimize it
- Click the expand icon (▶) to restore it

### Closing the Chat
- Click the close icon (✕) in the sidebar header
- Or click the floating chat button again

## Customization

### Change Sidebar Width
Edit `/frontend/src/components/layout/ChatSidebar.tsx` line ~76:
```tsx
width: isExpanded ? 400 : 60, // Change 400 to your preferred width
```

### Change Button Position
Edit `/frontend/src/components/layout/ChatSidebar.tsx` line ~32:
```tsx
bottom: 24,  // Distance from bottom in pixels
right: 24,   // Distance from right in pixels
```

### Change Colors
The sidebar uses your app's theme colors. To customize:
- Edit `/frontend/src/config/theme.ts` for global theme changes
- Or modify the `sx` props in `ChatSidebar.tsx` for component-specific changes

## Troubleshooting

### "Messaging app not loading"
- ✓ Ensure messaging app is running on the configured URL
- ✓ Check the `.env` file has the correct `VITE_MESSAGING_APP_URL`
- ✓ Restart the frontend dev server after changing `.env`

### "Chat button not visible"
- ✓ Make sure you're logged in (sidebar only shows for authenticated users)
- ✓ Check browser console for errors
- ✓ Try clearing browser cache and reloading

### "Sidebar appears behind other elements"
- ✓ The sidebar has `z-index: 1300` which should be above most elements
- ✓ If needed, adjust the z-index in `ChatSidebar.tsx`

## Files Modified

```
frontend/
├── src/
│   ├── App.tsx                           # Added ChatSidebar component
│   ├── components/
│   │   └── layout/
│   │       ├── ChatSidebar.tsx           # NEW: Chat sidebar component
│   │       └── index.ts                  # Exported ChatSidebar
│   └── config/
│       └── env.ts                        # Added MESSAGING_APP_URL config
├── .env                                  # Added VITE_MESSAGING_APP_URL
├── .env.example                          # Added VITE_MESSAGING_APP_URL
└── docs/
    └── chat-sidebar-integration.md       # NEW: Detailed documentation
```

## Next Steps

### For Development
1. Test the integration with your messaging app
2. Verify all messaging features work within the iframe
3. Test on different screen sizes and browsers

### For Production
1. Update `VITE_MESSAGING_APP_URL` to production URL
2. Ensure CORS settings in messaging app allow iframe embedding
3. Configure HTTPS for secure messaging
4. Implement real-time unread count integration

### Future Enhancements
- Real-time notifications for new messages
- User presence indicators
- Message previews in collapsed mode
- Keyboard shortcuts for quick access
- Theme synchronization between apps

## Support
For issues or questions:
1. Check the detailed documentation: `docs/chat-sidebar-integration.md`
2. Review the component code: `src/components/layout/ChatSidebar.tsx`
3. Check browser console for error messages

---

**No changes were made to the Messaging-app folder** - it works as-is! 🎉
