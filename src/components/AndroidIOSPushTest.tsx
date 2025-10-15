import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, Smartphone, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

const AndroidIOSPushTest = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<string[]>([]);
  const [deviceInfo, setDeviceInfo] = useState<any>(null);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    detectDevice();
    checkPermission();
    checkSubscription();
  }, []);

  const detectDevice = () => {
    const userAgent = navigator.userAgent;
    const isAndroid = /Android/i.test(userAgent);
    const isIOS = /iPad|iPhone|iPod/i.test(userAgent);
    const isChrome = /Chrome/i.test(userAgent) && !/Edge/i.test(userAgent);
    const isSafari = /Safari/i.test(userAgent) && !/Chrome/i.test(userAgent);
    const isFirefox = /Firefox/i.test(userAgent);
    const isMobile = /Android|iPad|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    
    setDeviceInfo({
      isAndroid,
      isIOS,
      isChrome,
      isSafari,
      isFirefox,
      isMobile,
      userAgent
    });
  };

  const checkPermission = () => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  };

  const checkSubscription = async () => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        setIsSubscribed(!!subscription);
      } catch (error) {
        console.error('Error checking subscription:', error);
      }
    }
  };

  const addResult = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setTestResults(prev => [...prev, `[${timestamp}] ${message}`]);
    console.log(`[PushTest] ${message}`);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const requestPermission = async () => {
    addResult('🔔 Requesting notification permission...');
    
    if (!('Notification' in window)) {
      addResult('❌ Notification API not available');
      toast.error('Notification API not available');
      return;
    }

    try {
      const currentPermission = Notification.permission;
      addResult(`Current permission: ${currentPermission}`);
      
      if (currentPermission === 'granted') {
        addResult('✅ Permission already granted');
        setPermission('granted');
        toast.success('Permission already granted');
        return;
      }
      
      if (currentPermission === 'denied') {
        addResult('❌ Permission was previously denied');
        toast.error('Permission was previously denied. Please enable in browser settings.');
        return;
      }

      const permission = await Notification.requestPermission();
      addResult(`Permission result: ${permission}`);
      setPermission(permission);
      
      if (permission === 'granted') {
        addResult('✅ Permission granted successfully');
        toast.success('Permission granted!');
      } else {
        addResult(`❌ Permission ${permission}`);
        toast.error(`Permission ${permission}`);
      }
    } catch (error) {
      addResult(`❌ Permission request failed: ${error.message}`);
      toast.error(`Permission request failed: ${error.message}`);
    }
  };

  const testBasicNotification = () => {
    addResult('🔔 Testing basic notification...');
    
    if (!('Notification' in window)) {
      addResult('❌ Notification API not available');
      return;
    }

    if (Notification.permission !== 'granted') {
      addResult('❌ Permission not granted');
      return;
    }

    try {
      const notification = new Notification('Smart Supply Test', {
        body: 'This is a test notification from Smart Supply PWA',
        icon: '/pwa-192x192.png',
        badge: '/pwa-192x192.png',
        tag: 'test-notification',
        requireInteraction: true,
        vibrate: [200, 100, 200]
      });
      
      addResult('✅ Basic notification created successfully');
      toast.success('Test notification sent!');
      
      notification.onclick = () => {
        addResult('✅ Notification clicked');
        notification.close();
      };
      
      notification.onerror = (error) => {
        addResult(`❌ Notification error: ${error}`);
      };
    } catch (error) {
      addResult(`❌ Basic notification failed: ${error.message}`);
      toast.error(`Basic notification failed: ${error.message}`);
    }
  };

  const testServiceWorker = async () => {
    addResult('🔧 Testing service worker...');
    
    if (!('serviceWorker' in navigator)) {
      addResult('❌ Service Worker not available');
      return;
    }

    try {
      // Check if service worker is registered
      const registrations = await navigator.serviceWorker.getRegistrations();
      addResult(`Found ${registrations.length} service worker(s)`);
      
      if (registrations.length === 0) {
        addResult('⚠️ No service workers registered');
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      addResult('✅ Service Worker ready');
      addResult(`Scope: ${registration.scope}`);
      addResult(`Update via cache: ${registration.updateViaCache}`);
      
      // Check if push manager is available
      if ('PushManager' in window) {
        addResult('✅ PushManager available');
      } else {
        addResult('❌ PushManager not available');
      }
    } catch (error) {
      addResult(`❌ Service Worker error: ${error.message}`);
    }
  };

  const testSubscription = async () => {
    addResult('📱 Testing push subscription...');
    
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      addResult('❌ Required APIs not available');
      return;
    }

    if (Notification.permission !== 'granted') {
      addResult('❌ Permission not granted');
      return;
    }

    setIsLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      addResult('✅ Service Worker ready');
      
      // Check existing subscription
      const existingSubscription = await registration.pushManager.getSubscription();
      if (existingSubscription) {
        addResult('✅ Already subscribed to push notifications');
        addResult(`Endpoint: ${existingSubscription.endpoint.substring(0, 50)}...`);
        setIsSubscribed(true);
        return;
      }

      // Try different subscription methods based on device
      let subscription = null;
      let method = '';

      if (deviceInfo?.isAndroid && deviceInfo?.isChrome) {
        // Android Chrome - try with VAPID first
        method = 'Android Chrome with VAPID';
        addResult(`Trying ${method}...`);
        
        try {
          const vapidKey = 'BEl62iUYgUivxIkv69yViEuiBIa40HI0FyHnQ3UzHfe3E3X5gQ7MvL8iJ8qK1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6';
          const applicationServerKey = urlBase64ToUint8Array(vapidKey);
          
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: applicationServerKey
          });
          addResult(`✅ ${method} successful`);
        } catch (error) {
          addResult(`❌ ${method} failed: ${error.message}`);
          
          // Fallback to no VAPID
          method = 'Android Chrome without VAPID';
          addResult(`Trying ${method}...`);
          try {
            subscription = await registration.pushManager.subscribe({
              userVisibleOnly: true
            });
            addResult(`✅ ${method} successful`);
          } catch (fallbackError) {
            addResult(`❌ ${method} failed: ${fallbackError.message}`);
          }
        }
      } else if (deviceInfo?.isIOS && deviceInfo?.isSafari) {
        // iOS Safari - try without VAPID
        method = 'iOS Safari without VAPID';
        addResult(`Trying ${method}...`);
        
        try {
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true
          });
          addResult(`✅ ${method} successful`);
        } catch (error) {
          addResult(`❌ ${method} failed: ${error.message}`);
        }
      } else {
        // Other browsers - try both methods
        method = 'Generic browser with VAPID';
        addResult(`Trying ${method}...`);
        
        try {
          const vapidKey = 'BEl62iUYgUivxIkv69yViEuiBIa40HI0FyHnQ3UzHfe3E3X5gQ7MvL8iJ8qK1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6';
          const applicationServerKey = urlBase64ToUint8Array(vapidKey);
          
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: applicationServerKey
          });
          addResult(`✅ ${method} successful`);
        } catch (error) {
          addResult(`❌ ${method} failed: ${error.message}`);
          
          // Fallback to no VAPID
          method = 'Generic browser without VAPID';
          addResult(`Trying ${method}...`);
          try {
            subscription = await registration.pushManager.subscribe({
              userVisibleOnly: true
            });
            addResult(`✅ ${method} successful`);
          } catch (fallbackError) {
            addResult(`❌ ${method} failed: ${fallbackError.message}`);
          }
        }
      }

      if (subscription) {
        addResult('✅ Push subscription successful!');
        addResult(`Method used: ${method}`);
        addResult(`Endpoint: ${subscription.endpoint.substring(0, 50)}...`);
        addResult(`Keys: ${Object.keys(subscription.getKey ? subscription.getKey('p256dh') : {})}`);
        setIsSubscribed(true);
        toast.success('Push subscription successful!');
      } else {
        addResult('❌ All subscription methods failed');
        toast.error('Push subscription failed');
      }
    } catch (error) {
      addResult(`❌ Subscription error: ${error.message}`);
      toast.error(`Subscription error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const unsubscribe = async () => {
    addResult('🔕 Unsubscribing from push notifications...');
    
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        const success = await subscription.unsubscribe();
        if (success) {
          addResult('✅ Successfully unsubscribed');
          setIsSubscribed(false);
          toast.success('Unsubscribed successfully');
        } else {
          addResult('❌ Failed to unsubscribe');
          toast.error('Failed to unsubscribe');
        }
      } else {
        addResult('ℹ️ Not subscribed');
        toast.info('Not subscribed');
      }
    } catch (error) {
      addResult(`❌ Unsubscribe error: ${error.message}`);
      toast.error(`Unsubscribe error: ${error.message}`);
    }
  };

  // Helper function to convert VAPID key
  const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="h-5 w-5" />
          Android & iOS Push Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Device Info */}
        {deviceInfo && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              <span className="text-sm font-medium">Device Info</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>Mobile: {deviceInfo.isMobile ? 'Yes' : 'No'}</div>
              <div>Android: {deviceInfo.isAndroid ? 'Yes' : 'No'}</div>
              <div>iOS: {deviceInfo.isIOS ? 'Yes' : 'No'}</div>
              <div>Chrome: {deviceInfo.isChrome ? 'Yes' : 'No'}</div>
              <div>Safari: {deviceInfo.isSafari ? 'Yes' : 'No'}</div>
              <div>Firefox: {deviceInfo.isFirefox ? 'Yes' : 'No'}</div>
            </div>
          </div>
        )}

        {/* Status */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm">Notification API</span>
            <Badge variant={'Notification' in window ? "default" : "destructive"}>
              {'Notification' in window ? 'Available' : 'Not Available'}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm">Service Worker</span>
            <Badge variant={'serviceWorker' in navigator ? "default" : "destructive"}>
              {'serviceWorker' in navigator ? 'Available' : 'Not Available'}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm">Push Manager</span>
            <Badge variant={'PushManager' in window ? "default" : "destructive"}>
              {'PushManager' in window ? 'Available' : 'Not Available'}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm">Permission</span>
            <Badge variant={
              permission === 'granted' ? "default" : 
              permission === 'denied' ? "destructive" : 
              "secondary"
            }>
              {permission}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm">Subscription</span>
            <Badge variant={isSubscribed ? "default" : "secondary"}>
              {isSubscribed ? 'Subscribed' : 'Not Subscribed'}
            </Badge>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <Button 
            onClick={requestPermission} 
            className="w-full"
            disabled={!('Notification' in window)}
          >
            Request Permission
          </Button>
          
          <Button 
            onClick={testBasicNotification} 
            variant="outline"
            className="w-full"
            disabled={permission !== 'granted'}
          >
            Test Basic Notification
          </Button>
          
          <Button 
            onClick={testServiceWorker} 
            variant="outline"
            className="w-full"
          >
            Test Service Worker
          </Button>
          
          <Button 
            onClick={testSubscription} 
            variant="outline"
            className="w-full"
            disabled={isLoading || permission !== 'granted'}
          >
            {isLoading ? "Testing..." : "Test Push Subscription"}
          </Button>
          
          {isSubscribed && (
            <Button 
              onClick={unsubscribe} 
              variant="destructive"
              className="w-full"
            >
              Unsubscribe
            </Button>
          )}
          
          <Button 
            onClick={clearResults} 
            variant="ghost"
            className="w-full"
          >
            Clear Results
          </Button>
        </div>

        {/* Results */}
        {testResults.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium">Test Results:</div>
            <div className="max-h-60 overflow-y-auto space-y-1 text-xs bg-gray-50 dark:bg-gray-900 p-2 rounded">
              {testResults.map((result, index) => (
                <div key={index} className="font-mono text-xs">
                  {result}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Help Text */}
        {deviceInfo?.isIOS && !deviceInfo?.isSafari && (
          <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
            <div className="text-xs text-yellow-800 dark:text-yellow-200">
              <div className="font-medium mb-1">iOS Device Detected</div>
              <div>Use Safari browser (not Chrome) for push notifications on iOS.</div>
            </div>
          </div>
        )}

        {deviceInfo?.isAndroid && !deviceInfo?.isChrome && (
          <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
            <div className="text-xs text-blue-800 dark:text-blue-200">
              <div className="font-medium mb-1">Android Device Detected</div>
              <div>Chrome browser is recommended for the best push notification support.</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AndroidIOSPushTest;
