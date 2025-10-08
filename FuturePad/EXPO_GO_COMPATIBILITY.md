# Expo Go Compatibility Guide

## The FileSystem Error Explained

### What is the Error?
```
ERROR [runtime not ready]: Error: Cannot find native module 'FileSystem', js engine: hermes
```

### Why Does This Happen?

1. **Expo Go Limitations**: Expo Go is a sandboxed environment that doesn't include all native modules
2. **FileSystem Module**: `expo-file-system` requires native code that's not available in Expo Go
3. **SDK 53 Changes**: Push notifications and file system access were removed from Expo Go in SDK 53

### What We Use FileSystem For

The `expo-file-system` module is used in our `backupService.ts` for:

1. **Creating Backup Files**: Writing backup data to device storage
2. **Reading Backup Files**: Loading backup data from files
3. **File Sharing**: Sharing backup files with other apps
4. **File Management**: Checking file existence and size

## Our Solution

### 1. Conditional Imports
```typescript
// Conditional imports for Expo Go compatibility
let FileSystem: any = null;
let Sharing: any = null;

try {
  FileSystem = require('expo-file-system');
  Sharing = require('expo-sharing');
} catch (error) {
  console.warn('FileSystem and Sharing modules not available in Expo Go');
}
```

### 2. Fallback Functionality
- **Backup Creation**: Works with AsyncStorage (always available)
- **Backup Export**: Uses React Native's Share API for Expo Go
- **File Operations**: Gracefully handles missing FileSystem module

### 3. Alternative Backup Method
For Expo Go, we provide:
- Text-based backup export via Share API
- Manual copy/paste import functionality
- Full backup/restore capabilities without file system

## Current Status

### ✅ What Works in Expo Go
- All core app functionality
- Letter creation, reading, editing, deletion
- Notification scheduling (limited)
- Data persistence with AsyncStorage
- Backup export via Share API
- Import via text input

### ⚠️ What's Limited in Expo Go
- File system operations
- Direct file sharing
- Full notification functionality
- Some advanced backup features

### 🔧 What Requires Development Build
- Full file system access
- Complete notification functionality
- Native file sharing
- All advanced features

## How to Use the App in Expo Go

### 1. Basic Usage
- Create and manage letters ✅
- Set delivery dates ✅
- Add images and captions ✅
- Search and filter letters ✅

### 2. Backup/Restore
1. **Export**: Go to Settings → Export Backup
2. **Share**: Use the share button to save backup data
3. **Import**: Go to Settings → Import Backup → Paste data

### 3. Notifications
- Notifications will be scheduled but may not work fully in Expo Go
- For full notification support, use a development build

## Migration to Development Build

### Why Use Development Build?
- Full native module support
- Complete notification functionality
- File system access
- All advanced features

### How to Create Development Build
```bash
# Install EAS CLI
npm install -g @expo/eas-cli

# Login to Expo
eas login

# Configure project
eas build:configure

# Build for development
eas build --profile development --platform ios
eas build --profile development --platform android
```

### Benefits of Development Build
- Full FileSystem support
- Complete notification functionality
- Native file sharing
- All backup features
- Better performance
- Access to all native modules

## Alternative Solutions

### 1. Use React Native CLI
Instead of Expo Go, use React Native CLI for full native support.

### 2. Expo Development Build
Create a custom development build with all required native modules.

### 3. Expo Bare Workflow
Eject from Expo managed workflow to bare React Native for full control.

## Troubleshooting

### Common Issues
1. **FileSystem not found**: Expected in Expo Go, use development build
2. **Notifications not working**: Limited support in Expo Go
3. **File sharing issues**: Use Share API instead

### Solutions
1. **For Development**: Use development build
2. **For Testing**: Use Expo Go with limited features
3. **For Production**: Always use development build

## Best Practices

### 1. Development
- Use development build for full feature testing
- Test in Expo Go for basic functionality
- Use conditional imports for compatibility

### 2. Production
- Always use development build
- Test all features thoroughly
- Provide fallbacks for missing modules

### 3. User Experience
- Graceful degradation in Expo Go
- Clear error messages
- Alternative workflows for missing features

## Summary

The FileSystem error is expected in Expo Go due to SDK 53 limitations. Our app is designed to work in both environments:

- **Expo Go**: Core functionality with text-based backup
- **Development Build**: Full functionality with file system support

The app gracefully handles the missing modules and provides alternative workflows for all features.
