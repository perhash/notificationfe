import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, Smartphone, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const MobilePushNotification = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState<any>(null);

  useEffect(() => {
    checkSupport();
    checkPermission();
    checkSubscription();
  }, []);

  const checkSupport = () => {
    // More comprehensive support check
    const hasNotification = 'Notification' in window;
    const hasServiceWorker = 'serviceWorker' in navigator;
    const hasPushManager = 'PushManager' in window;
    const hasNavigator = 'navigator' in window;
    
    const supported = hasNotification && hasServiceWorker && hasPushManager && hasNavigator;
    setIsSupported(supported);
    
    // Get device info
    const userAgent = navigator.userAgent;
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const isIOS = /iPad|iPhone|iPod/.test(userAgent);
    const isAndroid = /Android/.test(userAgent);
    const isChrome = /Chrome/.test(userAgent);
    const isSafari = /Safari/.test(userAgent) && !/Chrome/.test(userAgent);
    const isFirefox = /Firefox/.test(userAgent);
    
    setDeviceInfo({
      isMobile,
      isIOS,
      isAndroid,
      isChrome,
      isSafari,
      isFirefox,
      userAgent,
      supportDetails: {
        hasNotification,
        hasServiceWorker,
        hasPushManager,
        hasNavigator
      }
    });
    
    console.log('Support check:', {
      supported,
      hasNotification,
      hasServiceWorker,
      hasPushManager,
      hasNavigator,
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

  const requestPermission = async () => {
    if (!isSupported) {
      toast.error('Push notifications not supported on this device');
      return;
    }

    setIsLoading(true);
    try {
      // Check current permission first
      const currentPermission = Notification.permission;
      console.log('Current permission:', currentPermission);
      
      if (currentPermission === 'granted') {
        setPermission('granted');
        toast.success('Notification permission already granted!');
        return;
      }
      
      if (currentPermission === 'denied') {
        setPermission('denied');
        toast.error('Notification permission was previously denied. Please enable it in your browser settings.');
        return;
      }

      // Request permission
      const permission = await Notification.requestPermission();
      console.log('Permission result:', permission);
      setPermission(permission);
      
      if (permission === 'granted') {
        toast.success('Notification permission granted!');
      } else if (permission === 'denied') {
        toast.error('Notification permission denied. Please enable notifications in your browser settings and refresh the page.');
      } else {
        toast.error('Notification permission request was dismissed. Please try again.');
      }
    } catch (error) {
      console.error('Error requesting permission:', error);
      toast.error('Failed to request permission. Please check your browser settings.');
    } finally {
      setIsLoading(false);
    }
  };

  const subscribe = async () => {
    if (!isSupported || permission !== 'granted') {
      toast.error('Cannot subscribe: notifications not supported or permission not granted');
      return;
    }

    setIsLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      
      // Check if already subscribed
      const existingSubscription = await registration.pushManager.getSubscription();
      if (existingSubscription) {
        setIsSubscribed(true);
        toast.info('Already subscribed to push notifications');
        return;
      }

      // Try to subscribe
      let subscription;
      try {
        // Try with VAPID key first
        const vapidKey = 'BEl62iUYgUivxIkv69yViEuiBIa40HI0FyHnQ3UzHfe3E3X5gQ7MvL8iJ8qK1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6';
        const applicationServerKey = urlBase64ToUint8Array(vapidKey);
        
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: applicationServerKey
        });
      } catch (vapidError) {
        console.log('VAPID subscription failed, trying without VAPID key:', vapidError);
        
        // Try without VAPID key for some mobile browsers
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true
        });
      }

      if (subscription) {
        setIsSubscribed(true);
        toast.success('Successfully subscribed to push notifications!');
        console.log('Subscription:', subscription);
      } else {
        toast.error('Failed to subscribe to push notifications');
      }
    } catch (error) {
      console.error('Error subscribing:', error);
      toast.error('Failed to subscribe to push notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const unsubscribe = async () => {
    setIsLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        const success = await subscription.unsubscribe();
        if (success) {
          setIsSubscribed(false);
          toast.success('Successfully unsubscribed from push notifications');
        } else {
          toast.error('Failed to unsubscribe');
        }
      } else {
        toast.info('Not subscribed to push notifications');
      }
    } catch (error) {
      console.error('Error unsubscribing:', error);
      toast.error('Failed to unsubscribe');
    } finally {
      setIsLoading(false);
    }
  };

  const showTestNotification = () => {
    if (permission === 'granted') {
      new Notification('Test Notification', {
        body: 'This is a test notification from Smart Supply PWA',
        icon: '/pwa-192x192.png',
        badge: '/pwa-192x192.png',
        vibrate: [200, 100, 200],
        tag: 'test-notification'
      });
      toast.info('Test notification sent!');
    } else {
      toast.error('Notification permission not granted');
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
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Mobile Push Notifications
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
            <div className="space-y-1 text-xs text-muted-foreground">
              <div>Mobile: {deviceInfo.isMobile ? 'Yes' : 'No'}</div>
              <div>iOS: {deviceInfo.isIOS ? 'Yes' : 'No'}</div>
              <div>Android: {deviceInfo.isAndroid ? 'Yes' : 'No'}</div>
            </div>
          </div>
        )}

        {/* Support Status */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm">Push Support</span>
            <Badge variant={isSupported ? "default" : "destructive"}>
              {isSupported ? "Supported" : "Not Supported"}
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
              {isSubscribed ? "Subscribed" : "Not Subscribed"}
            </Badge>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          {permission !== 'granted' && (
            <Button 
              onClick={requestPermission} 
              disabled={!isSupported || isLoading}
              className="w-full"
            >
              {isLoading ? "Requesting..." : "Request Permission"}
            </Button>
          )}
          
          {permission === 'granted' && !isSubscribed && (
            <Button 
              onClick={subscribe} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? "Subscribing..." : "Subscribe to Notifications"}
            </Button>
          )}
          
          {isSubscribed && (
            <Button 
              onClick={unsubscribe} 
              disabled={isLoading}
              variant="outline"
              className="w-full"
            >
              {isLoading ? "Unsubscribing..." : "Unsubscribe"}
            </Button>
          )}
          
          {permission === 'granted' && (
            <Button 
              onClick={showTestNotification} 
              variant="secondary"
              className="w-full"
            >
              Test Notification
            </Button>
          )}
        </div>

        {/* Help Text */}
        {!isSupported && (
          <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
            <div className="text-xs text-yellow-800 dark:text-yellow-200">
              <div className="font-medium mb-1">Push notifications not supported</div>
              <div className="space-y-1">
                {deviceInfo?.isIOS && !deviceInfo?.isSafari && (
                  <div>• Use Safari browser on iOS (not Chrome)</div>
                )}
                {deviceInfo?.isAndroid && !deviceInfo?.isChrome && (
                  <div>• Try Chrome browser on Android</div>
                )}
                <div>• Make sure you're using HTTPS</div>
                <div>• Try refreshing the page</div>
                {deviceInfo?.supportDetails && (
                  <div className="mt-2 text-xs opacity-75">
                    Support: Notifications: {deviceInfo.supportDetails.hasNotification ? '✓' : '✗'}, 
                    ServiceWorker: {deviceInfo.supportDetails.hasServiceWorker ? '✓' : '✗'}, 
                    PushManager: {deviceInfo.supportDetails.hasPushManager ? '✓' : '✗'}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {isSupported && permission === 'denied' && (
          <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
            <div className="text-xs text-red-800 dark:text-red-200">
              <div className="font-medium mb-1">Notification permission denied</div>
              <div className="space-y-1">
                <div>• Go to browser settings</div>
                <div>• Find "Notifications" or "Site Settings"</div>
                <div>• Enable notifications for this site</div>
                <div>• Refresh the page and try again</div>
                {deviceInfo?.isIOS && (
                  <div>• On iOS: Settings → Safari → Notifications</div>
                )}
                {deviceInfo?.isAndroid && (
                  <div>• On Android: Chrome → Settings → Site Settings → Notifications</div>
                )}
              </div>
            </div>
          </div>
        )}

        {isSupported && permission === 'default' && (
          <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5" />
            <div className="text-xs text-blue-800 dark:text-blue-200">
              <div className="font-medium mb-1">Ready to enable notifications</div>
              <div>Click "Request Permission" to enable push notifications for this app.</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MobilePushNotification;
