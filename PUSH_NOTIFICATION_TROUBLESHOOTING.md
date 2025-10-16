# Push Notification Troubleshooting Guide

## 🚨 **Common Issues & Solutions**

### **Issue 1: "Notification permission denied"**

#### **Causes:**
- User clicked "Block" when prompted
- Browser settings disabled notifications
- Previously denied permission

#### **Solutions:**
1. **Check Browser Settings:**
   - **Chrome (Android)**: Settings → Site Settings → Notifications → Allow
   - **Safari (iOS)**: Settings → Safari → Notifications → Allow
   - **Firefox (Android)**: Settings → Notifications → Allow

2. **Reset Permission:**
   - Go to browser settings
   - Find the site in "Blocked" or "Not Allowed" list
   - Remove it or change to "Allow"
   - Refresh the page

3. **Clear Site Data:**
   - Clear cookies and site data
   - Refresh the page
   - Try requesting permission again

### **Issue 2: "Push notifications not available"**

#### **Causes:**
- Browser doesn't support push notifications
- Not using HTTPS
- Service worker not registered
- Missing required APIs

#### **Solutions:**
1. **Check Browser Support:**
   - Use Chrome on Android
   - Use Safari on iOS (16.4+)
   - Avoid Chrome on iOS

2. **Check HTTPS:**
   - Make sure site is served over HTTPS
   - Vercel provides HTTPS automatically

3. **Check Service Worker:**
   - Open DevTools → Application → Service Workers
   - Should see service worker registered
   - If not, refresh the page

4. **Check Console:**
   - Look for error messages
   - Check if all required APIs are available

### **Issue 3: "Failed to subscribe"**

#### **Causes:**
- Invalid VAPID key
- Service worker not ready
- Network issues
- Browser limitations

#### **Solutions:**
1. **Check VAPID Key:**
   - Make sure VAPID key is valid
   - Try without VAPID key (fallback)

2. **Wait for Service Worker:**
   - Service worker needs time to register
   - Wait a few seconds before subscribing

3. **Check Network:**
   - Make sure you have internet connection
   - Check if backend is accessible

4. **Try Different Browser:**
   - Some browsers have limitations
   - Try Chrome on Android or Safari on iOS

## 📱 **Device-Specific Issues**

### **Android Issues:**

#### **Chrome on Android:**
- ✅ Usually works well
- ✅ Full push notification support
- ✅ Background notifications work

#### **Firefox on Android:**
- ⚠️ May work without VAPID key
- ⚠️ Limited background support
- ✅ Good for testing

#### **Other Android Browsers:**
- ❌ Limited or no support
- ❌ Use Chrome instead

### **iOS Issues:**

#### **Safari on iOS:**
- ✅ Works on iOS 16.4+
- ⚠️ Must be installed as PWA
- ⚠️ Limited background notifications
- ❌ No support on older iOS versions

#### **Chrome on iOS:**
- ❌ No push notification support
- ❌ Use Safari instead

#### **Other iOS Browsers:**
- ❌ No push notification support
- ❌ Use Safari instead

## 🔧 **Debug Steps**

### **Step 1: Check Support**
```javascript
console.log('Notification support:', 'Notification' in window);
console.log('ServiceWorker support:', 'serviceWorker' in navigator);
console.log('PushManager support:', 'PushManager' in window);
```

### **Step 2: Check Permission**
```javascript
console.log('Current permission:', Notification.permission);
```

### **Step 3: Check Service Worker**
```javascript
navigator.serviceWorker.ready.then(registration => {
  console.log('Service worker ready:', registration);
});
```

### **Step 4: Test Subscription**
```javascript
navigator.serviceWorker.ready.then(registration => {
  registration.pushManager.subscribe({
    userVisibleOnly: true
  }).then(subscription => {
    console.log('Subscription successful:', subscription);
  }).catch(error => {
    console.error('Subscription failed:', error);
  });
});
```

## 🛠️ **Manual Fixes**

### **Reset All Permissions:**
1. Go to browser settings
2. Find "Site Settings" or "Notifications"
3. Find your site
4. Remove or reset permissions
5. Refresh the page

### **Clear All Data:**
1. Go to browser settings
2. Find "Clear Browsing Data"
3. Select "Cookies and Site Data"
4. Clear data for your site
5. Refresh the page

### **Reinstall PWA:**
1. Remove from home screen
2. Clear browser data
3. Reinstall PWA
4. Try again

## 📋 **Testing Checklist**

### **Before Testing:**
- [ ] Using HTTPS
- [ ] Using supported browser
- [ ] Service worker registered
- [ ] No console errors

### **Permission Test:**
- [ ] Click "Request Permission"
- [ ] Check permission status
- [ ] If denied, check browser settings

### **Subscription Test:**
- [ ] Permission is granted
- [ ] Click "Subscribe"
- [ ] Check subscription status
- [ ] Test notification works

### **Background Test:**
- [ ] Subscribe successfully
- [ ] Close the app
- [ ] Send notification from admin
- [ ] Check if notification appears

## 🎯 **Expected Results**

### **Successful Setup:**
1. **Support**: "Supported" ✓
2. **Permission**: "granted" ✓
3. **Subscription**: "Subscribed" ✓
4. **Test**: Notification appears ✓

### **Failed Setup:**
1. **Support**: "Not Supported" ❌
2. **Permission**: "denied" ❌
3. **Subscription**: "Not Subscribed" ❌
4. **Test**: No notification ❌

## 🆘 **Still Not Working?**

1. **Check Console**: Look for error messages
2. **Try Different Device**: Test on another device
3. **Try Different Browser**: Use recommended browser
4. **Check Network**: Make sure backend is accessible
5. **Contact Support**: Provide console logs and device info

The enhanced troubleshooting should help identify and fix most push notification issues!

