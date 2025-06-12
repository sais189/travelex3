import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Clock, RefreshCw } from "lucide-react";

// Import the same landmark images from DayByDayItinerary
const DESTINATION_LANDMARK_IMAGES = {
  "maldives_luxury_resort": {
    day1: "https://images.unsplash.com/photo-1504208434309-cb69f4fe52b0?w=800&h=600&fit=crop&auto=format&q=80",
    day2: "https://images.unsplash.com/photo-1571501679680-de32f1e7aad4?w=800&h=600&fit=crop&auto=format&q=80",
    day3: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop&auto=format&q=80",
    day4: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&h=600&fit=crop&auto=format&q=80",
    day5: "https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?w=800&h=600&fit=crop&auto=format&q=80",
    day6: "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=800&h=600&fit=crop&auto=format&q=80",
    day7: "https://images.unsplash.com/photo-1571501679680-de32f1e7aad4?w=800&h=600&fit=crop&auto=format&q=80",
    fallback: "https://images.unsplash.com/photo-1504208434309-cb69f4fe52b0?w=800&h=600&fit=crop&auto=format&q=80"
  },
  "tokyo_adventure": {
    day1: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800&h=600&fit=crop&auto=format&q=80",
    day2: "https://images.unsplash.com/photo-1480796927426-f609979314bd?w=800&h=600&fit=crop&auto=format&q=80",
    day3: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&h=600&fit=crop&auto=format&q=80",
    day4: "https://images.unsplash.com/photo-1560707303-4e980ce876ad?w=800&h=600&fit=crop&auto=format&q=80",
    day5: "https://images.unsplash.com/photo-1570459027562-4a916cc6113f?w=800&h=600&fit=crop&auto=format&q=80",
    day6: "https://images.unsplash.com/photo-1554797589-7241bb691973?w=800&h=600&fit=crop&auto=format&q=80",
    day7: "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800&h=600&fit=crop&auto=format&q=80",
    fallback: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800&h=600&fit=crop&auto=format&q=80"
  },
  "himalayan_expedition": {
    day1: "https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?w=800&h=600&fit=crop&auto=format&q=80",
    day2: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&h=600&fit=crop&auto=format&q=80",
    day3: "https://images.unsplash.com/photo-1464822759844-d150baef493e?w=800&h=600&fit=crop&auto=format&q=80",
    day4: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&auto=format&q=80",
    day5: "https://images.unsplash.com/photo-1568393691622-c7ba131d63b4?w=800&h=600&fit=crop&auto=format&q=80",
    day6: "https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?w=800&h=600&fit=crop&auto=format&q=80",
    day7: "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800&h=600&fit=crop&auto=format&q=80",
    fallback: "https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?w=800&h=600&fit=crop&auto=format&q=80"
  }
};

interface ImageTestResult {
  url: string;
  status: 'loading' | 'success' | 'error';
  loadTime?: number;
  destination: string;
  day: string;
}

export default function ImageValidationTest() {
  const [testResults, setTestResults] = useState<ImageTestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [summary, setSummary] = useState<{
    total: number;
    success: number;
    failed: number;
    avgLoadTime: number;
  }>({ total: 0, success: 0, failed: 0, avgLoadTime: 0 });

  const testImageLoad = (url: string, destination: string, day: string): Promise<ImageTestResult> => {
    const startTime = performance.now();
    
    return new Promise((resolve) => {
      const img = new Image();
      
      img.onload = () => {
        const loadTime = performance.now() - startTime;
        resolve({
          url,
          status: 'success',
          loadTime,
          destination,
          day
        });
      };
      
      img.onerror = () => {
        resolve({
          url,
          status: 'error',
          destination,
          day
        });
      };
      
      img.src = url;
    });
  };

  const runImageTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    
    const allTests: Promise<ImageTestResult>[] = [];
    
    // Create test promises for all destination images
    Object.entries(DESTINATION_LANDMARK_IMAGES).forEach(([destinationKey, days]) => {
      Object.entries(days).forEach(([day, url]) => {
        allTests.push(testImageLoad(url, destinationKey, day));
      });
    });
    
    // Initialize results with loading state
    const initialResults: ImageTestResult[] = [];
    Object.entries(DESTINATION_LANDMARK_IMAGES).forEach(([destinationKey, days]) => {
      Object.entries(days).forEach(([day, url]) => {
        initialResults.push({
          url,
          status: 'loading',
          destination: destinationKey,
          day
        });
      });
    });
    setTestResults(initialResults);
    
    // Execute all tests
    const results = await Promise.all(allTests);
    setTestResults(results);
    
    // Calculate summary
    const successful = results.filter(r => r.status === 'success');
    const failed = results.filter(r => r.status === 'error');
    const avgLoadTime = successful.length > 0 
      ? successful.reduce((sum, r) => sum + (r.loadTime || 0), 0) / successful.length 
      : 0;
    
    setSummary({
      total: results.length,
      success: successful.length,
      failed: failed.length,
      avgLoadTime
    });
    
    setIsRunning(false);
  };

  useEffect(() => {
    runImageTests();
  }, []);

  const getStatusIcon = (status: 'loading' | 'success' | 'error') => {
    switch (status) {
      case 'loading':
        return <Clock className="h-4 w-4 text-yellow-500 animate-spin" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusBadge = (status: 'loading' | 'success' | 'error') => {
    const variants = {
      loading: 'default',
      success: 'default',
      error: 'destructive'
    } as const;

    const colors = {
      loading: 'bg-yellow-100 text-yellow-800',
      success: 'bg-green-100 text-green-800',
      error: 'bg-red-100 text-red-800'
    };

    return (
      <Badge variant={variants[status]} className={colors[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Itinerary Images Validation Test</CardTitle>
          <Button onClick={runImageTests} disabled={isRunning} className="gap-2">
            <RefreshCw className={`h-4 w-4 ${isRunning ? 'animate-spin' : ''}`} />
            {isRunning ? 'Testing...' : 'Retest All'}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{summary.total}</div>
              <div className="text-sm text-muted-foreground">Total Images</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{summary.success}</div>
              <div className="text-sm text-muted-foreground">Successful</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">{summary.failed}</div>
              <div className="text-sm text-muted-foreground">Failed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">{Math.round(summary.avgLoadTime)}ms</div>
              <div className="text-sm text-muted-foreground">Avg Load Time</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6">
        {Object.entries(DESTINATION_LANDMARK_IMAGES).map(([destinationKey, days]) => (
          <Card key={destinationKey}>
            <CardHeader>
              <CardTitle className="capitalize">
                {destinationKey.replace(/_/g, ' ')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {Object.entries(days).map(([day, url]) => {
                  const result = testResults.find(r => r.url === url && r.destination === destinationKey);
                  
                  return (
                    <div key={`${destinationKey}-${day}`} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {result && getStatusIcon(result.status)}
                        <div>
                          <div className="font-medium capitalize">{day}</div>
                          <div className="text-sm text-muted-foreground truncate max-w-md">
                            {url}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {result?.loadTime && (
                          <span className="text-sm text-muted-foreground">
                            {Math.round(result.loadTime)}ms
                          </span>
                        )}
                        {result && getStatusBadge(result.status)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}