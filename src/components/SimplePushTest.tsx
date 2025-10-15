import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

const SimplePushTest = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<string[]>([]);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const testBasicNotification = () => {
    addResult('Testing basic notification...');
    
    if (!('Notification' in window)) {
      addResult('❌ Notification API not available');
      toast.error('Notification API not available');
      return;
    }

    if (Notification.permission === 'denied') {
      addResult('❌ Notification permission denied');
      toast.error('Notification permission denied');
      return;
    }

    if (Notification.permission === 'default') {
      addResult('⚠️ Notification permission not requested yet');
      toast.error('Please request permission first');
      return;
    }

    try {
      const notification = new Notification('Test Notification', {
        body: 'This is a basic test notification',
        icon: '/pwa-192x192.png',
        tag: 'test-notification'
      });
      
      addResult('✅ Basic notification created successfully');
      toast.success('Basic notification sent!');
      
      notification.onclick = () => {
        addResult('✅ Notification clicked');
        notification.close();
      };
    } catch (error) {
      addResult(`❌ Basic notification failed: ${error.message}`);
      toast.error(`Basic notification failed: ${error.message}`);
    }
  };

  const testServiceWorker = async () => {
    addResult('Testing service worker...');
    
    if (!('serviceWorker' in navigator)) {
      addResult('❌ Service Worker not available');
      toast.error('Service Worker not available');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      addResult('✅ Service Worker ready');
      
      if ('PushManager' in window) {
        addResult('✅ PushManager available');
        
        try {
          const subscription = await registration.pushManager.getSubscription();
          if (subscription) {
            addResult('✅ Already subscribed to push notifications');
            addResult(`Subscription endpoint: ${subscription.endpoint.substring(0, 50)}...`);
          } else {
            addResult('ℹ️ Not subscribed to push notifications yet');
          }
        } catch (error) {
          addResult(`❌ PushManager error: ${error.message}`);
        }
      } else {
        addResult('❌ PushManager not available');
      }
    } catch (error) {
      addResult(`❌ Service Worker error: ${error.message}`);
      toast.error(`Service Worker error: ${error.message}`);
    }
  };

  const testSimpleSubscription = async () => {
    addResult('Testing simple subscription...');
    
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      addResult('❌ Required APIs not available');
      toast.error('Required APIs not available');
      return;
    }

    if (Notification.permission !== 'granted') {
      addResult('❌ Notification permission not granted');
      toast.error('Notification permission not granted');
      return;
    }

    setIsLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      addResult('✅ Service Worker ready');
      
      // Check existing subscription
      const existingSubscription = await registration.pushManager.getSubscription();
      if (existingSubscription) {
        addResult('✅ Already subscribed');
        toast.info('Already subscribed to push notifications');
        return;
      }

      // Try simple subscription without VAPID
      addResult('Trying simple subscription...');
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true
      });
      
      addResult('✅ Simple subscription successful!');
      addResult(`Endpoint: ${subscription.endpoint.substring(0, 50)}...`);
      toast.success('Simple subscription successful!');
      
    } catch (error) {
      addResult(`❌ Simple subscription failed: ${error.message}`);
      toast.error(`Simple subscription failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const requestPermission = async () => {
    addResult('Requesting notification permission...');
    
    if (!('Notification' in window)) {
      addResult('❌ Notification API not available');
      toast.error('Notification API not available');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      addResult(`Permission result: ${permission}`);
      
      if (permission === 'granted') {
        addResult('✅ Permission granted!');
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

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Simple Push Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
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
              Notification.permission === 'granted' ? "default" : 
              Notification.permission === 'denied' ? "destructive" : 
              "secondary"
            }>
              {Notification.permission}
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
            disabled={Notification.permission !== 'granted'}
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
            onClick={testSimpleSubscription} 
            variant="outline"
            className="w-full"
            disabled={isLoading || Notification.permission !== 'granted'}
          >
            {isLoading ? "Testing..." : "Test Simple Subscription"}
          </Button>
          
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
            <div className="max-h-40 overflow-y-auto space-y-1 text-xs">
              {testResults.map((result, index) => (
                <div key={index} className="font-mono">
                  {result}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SimplePushTest;
