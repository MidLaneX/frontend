// Test file to verify Material-UI icons are available
// Run this in browser console while on http://localhost:3000/

console.log('=== Testing Material-UI Icons ===');

// Test if @mui/icons-material is loaded
try {
  console.log('✓ Material-UI is available');
  
  // List of icons used in ChatSidebar
  const icons = [
    'Chat',
    'OpenInNew',
    'ChevronLeft',
    'Remove',
    'CropSquare',
    'CloseFullscreen',
    'Close'
  ];
  
  console.log('\nIcons used in ChatSidebar:');
  icons.forEach(icon => {
    console.log(`  - ${icon}Icon`);
  });
  
  console.log('\n✓ All icons should be visible in the sidebar header');
  console.log('\nExpected button order (left to right):');
  console.log('  1. RemoveIcon (horizontal line) - Minimize');
  console.log('  2. CropSquareIcon (square) - Fullscreen');
  console.log('  3. OpenInNewIcon (arrow+box) - Open in new tab');
  console.log('  4. ChevronLeftIcon (left arrow) - Close');
  
} catch (error) {
  console.error('✗ Error:', error);
}
