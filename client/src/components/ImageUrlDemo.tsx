import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle, AlertTriangle, Info } from "lucide-react";
import ImageUrlValidator from "./ImageUrlValidator";

export default function ImageUrlDemo() {
  const [imageUrl, setImageUrl] = useState("");
  const [validationResult, setValidationResult] = useState<{ isValid: boolean; isDuplicate: boolean } | null>(null);

  const handleValidationChange = (isValid: boolean, isDuplicate: boolean) => {
    setValidationResult({ isValid, isDuplicate });
  };

  const testUrls = [
    {
      url: "https://images.unsplash.com/photo-1522637733821-b4fb1c92fa1e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      description: "Existing URL (Tokyo Cherry Blossom Trip)",
      expected: "duplicate"
    },
    {
      url: "https://images.unsplash.com/photo-1234567890123?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      description: "New unique URL",
      expected: "valid"
    }
  ];

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Info className="w-5 h-5" />
          <span>Image URL Validation Demo</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            This system prevents duplicate image URLs across destinations. The database has a unique constraint 
            and real-time validation checks for duplicates before allowing new URLs.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Test Image URL Validation</h3>
          
          <ImageUrlValidator
            value={imageUrl}
            onChange={setImageUrl}
            destinationName="Test Destination"
            country="Test Country"
            placeholder="Enter an image URL to test validation..."
            onValidationChange={handleValidationChange}
          />

          {validationResult && (
            <Alert className={
              validationResult.isDuplicate ? "border-orange-500" :
              validationResult.isValid ? "border-green-500" :
              "border-red-500"
            }>
              {validationResult.isDuplicate ? (
                <AlertTriangle className="h-4 w-4" />
              ) : validationResult.isValid ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              <AlertDescription>
                {validationResult.isDuplicate 
                  ? "This image URL is already used by another destination"
                  : validationResult.isValid 
                  ? "Image URL is unique and accessible"
                  : "Image URL is not accessible or invalid"
                }
              </AlertDescription>
            </Alert>
          )}
        </div>

        <div className="space-y-3">
          <h4 className="font-medium">Quick Test URLs:</h4>
          {testUrls.map((test, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{test.description}</p>
                <p className="text-xs text-muted-foreground truncate">{test.url}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setImageUrl(test.url)}
              >
                Test
              </Button>
            </div>
          ))}
        </div>

        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Protection Features:</strong>
            <ul className="mt-2 list-disc list-inside text-sm space-y-1">
              <li>Database-level unique constraint prevents duplicates</li>
              <li>Real-time validation during form input</li>
              <li>Clear error messages for administrators</li>
              <li>Automatic image URL suggestions for new destinations</li>
              <li>Preview functionality for valid URLs</li>
            </ul>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}