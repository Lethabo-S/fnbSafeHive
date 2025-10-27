# SAFEHIVE - React Native Mobile App Setup Guide

## Overview
This guide will help you convert the SAFEHIVE web app to React Native with local contact picking functionality.

## Prerequisites
- Node.js installed
- Expo CLI
- Android Studio (for Android) or Xcode (for iOS)

## Step 1: Create React Native Project

```bash
npx create-expo-app safehive-mobile --template blank-typescript
cd safehive-mobile
```

## Step 2: Install Dependencies

```bash
npm install @supabase/supabase-js expo-contacts expo-location @react-navigation/native @react-navigation/native-stack react-native-screens react-native-safe-area-context expo-linking expo-haptics
```

## Step 3: Configure Environment Variables

Create `.env` file:
```
EXPO_PUBLIC_SUPABASE_URL=https://gncnvlakcudvtmvhnmvw.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImduY252bGFrY3VkdnRtdmhubXZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyODY4MTgsImV4cCI6MjA3Njg2MjgxOH0.0BHnABndFNRrVjtXOBQzEu6RekxU_kfAkfZXgF_OV-c
```

## Step 4: Configure app.json

Update `app.json` with required permissions:

```json
{
  "expo": {
    "name": "SAFEHIVE",
    "slug": "safehive-mobile",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#DC2626"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.safehive.app",
      "infoPlist": {
        "NSContactsUsageDescription": "SAFEHIVE needs access to your contacts to help you quickly add emergency contacts.",
        "NSLocationWhenInUseUsageDescription": "SAFEHIVE needs your location to send accurate emergency alerts to your contacts."
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#DC2626"
      },
      "package": "com.safehive.app",
      "permissions": [
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION",
        "READ_CONTACTS",
        "VIBRATE"
      ]
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "plugins": [
      [
        "expo-contacts",
        {
          "contactsPermission": "Allow SAFEHIVE to access your contacts to add emergency contacts quickly."
        }
      ],
      [
        "expo-location",
        {
          "locationAlwaysAndWhenInUsePermission": "Allow SAFEHIVE to use your location to send accurate emergency alerts."
        }
      ]
    ]
  }
}
```

## Step 5: Create Project Structure

```
src/
├── lib/
│   └── supabase.ts          # Supabase client setup
├── contexts/
│   └── AuthContext.tsx      # Authentication context
├── screens/
│   ├── AuthScreen.tsx       # Login/signup screen
│   └── DashboardScreen.tsx  # Main dashboard
├── components/
│   ├── SOSButton.tsx        # Emergency SOS button
│   └── ContactsList.tsx     # Emergency contacts manager
└── App.tsx                  # Main app component
```

## Step 6: Create App.tsx

```typescript
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { AuthScreen } from './src/screens/AuthScreen';
import { DashboardScreen } from './src/screens/DashboardScreen';

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#DC2626" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="auto" />
      {user ? <DashboardScreen /> : <AuthScreen />}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
  },
});
```

## Key Features Implemented

### 1. **Local Contact Picker**
- Uses `expo-contacts` to access device contacts
- Allows users to pick contacts directly from their phone
- Manual entry option also available

### 2. **GPS Location Tracking**
- Uses `expo-location` for high-accuracy GPS
- Requests location permission on first use
- Generates Google Maps links for emergency alerts

### 3. **WhatsApp Integration**
- Opens WhatsApp with pre-filled emergency message
- Includes user's real-time location
- Works with multiple contacts sequentially

### 4. **Haptic Feedback**
- Vibration on button press
- Success/warning feedback patterns
- Enhanced user experience

### 5. **Offline Functionality**
- Supabase local caching
- Contact list stored locally
- Works without internet for core features

## Running the App

### Development Mode
```bash
# Start Expo
npm start

# Run on Android
npm run android

# Run on iOS (macOS only)
npm run ios

# Run on Web
npm run web
```

### Building for Production

#### Android APK
```bash
eas build --platform android --profile preview
```

#### iOS Build
```bash
eas build --platform ios --profile preview
```

## Testing Permissions

### Android
1. Install the app
2. Trigger SOS button - location permission prompt
3. Add contact - contacts permission prompt
4. Both permissions saved for future use

### iOS
1. Install the app
2. Same permission flow as Android
3. Permissions can be managed in Settings

## Security Features

1. **Row Level Security (RLS)**: All Supabase tables protected
2. **User Isolation**: Users can only access their own data
3. **Encrypted Storage**: Supabase handles encryption
4. **Secure Authentication**: Email/password with hashing

## Database Schema

Already set up in Supabase:
- `profiles` - User profile data
- `emergency_contacts` - Emergency contact list
- `sos_events` - Emergency alert history

## Troubleshooting

### Location Not Working
- Check app permissions in device settings
- Ensure location services enabled
- Test on physical device (not emulator)

### WhatsApp Not Opening
- Verify WhatsApp installed
- Check phone number format (+27...)
- Test deep link manually

### Contacts Not Loading
- Grant contacts permission
- Restart app after permission change
- Check contacts exist on device

## Competition-Ready Features

Based on South African GBV app competition requirements:

✅ **Social Impact**: Direct emergency response for GBV victims
✅ **Innovation**: Local contact integration + GPS + instant alerts
✅ **Usability**: Simple one-button SOS, offline capable
✅ **Sustainability**: Free, uses Supabase free tier
✅ **Community**: Peer-to-peer emergency network

## Next Steps

1. Add audio recording feature
2. Implement silent mode (discrete alerts)
3. Add safety tips and resources
4. Create admin dashboard for analytics
5. Add multilingual support (Zulu, Xhosa, Afrikaans)

## Support

For issues, refer to:
- Expo docs: https://docs.expo.dev
- Supabase docs: https://supabase.com/docs
- React Native docs: https://reactnative.dev
