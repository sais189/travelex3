import { useState, useEffect } from "react";
import { CheckCircle, XCircle, AlertTriangle, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { generateUniqueImageSuggestions, validateImageUrl, type ImageSuggestion } from "@/lib/imageUtils";

interface ImageUrlValidatorProps {
  value: string;
  onChange: (url: string) => void;
  destinationName?: string;
  country?: string;
  placeholder?: string;
  onValidationChange?: (isValid: boolean, isDuplicate: boolean) => void;
}

export default function ImageUrlValidator({
  value,
  onChange,
  destinationName = "",
  country = "",
  placeholder = "Enter image URL",
  onValidationChange
}: ImageUrlValidatorProps) {
  const [validationStatus, setValidationStatus] = useState<'idle' | 'checking' | 'valid' | 'invalid' | 'duplicate'>('idle');
  const [suggestions, setSuggestions] = useState<ImageSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Check for duplicates and validate URL
  const checkImageUrl = async (url: string) => {
    if (!url.trim()) {
      setValidationStatus('idle');
      onValidationChange?.(false, false);
      return;
    }

    setValidationStatus('checking');

    try {
      // Check if URL is already in use via API
      const response = await fetch(`/api/admin/check-image-url?imageUrl=${encodeURIComponent(url)}`);
      
      if (response.ok) {
        const result = await response.json();
        
        if (result.isDuplicate) {
          setValidationStatus('duplicate');
          onValidationChange?.(false, true);
          return;
        }
      }

      // Validate URL accessibility
      const isValid = await validateImageUrl(url);
      setValidationStatus(isValid ? 'valid' : 'invalid');
      onValidationChange?.(isValid, false);
    } catch (error) {
      setValidationStatus('invalid');
      onValidationChange?.(false, false);
    }
  };

  // Generate suggestions when destination info is available
  useEffect(() => {
    if (destinationName && country) {
      const newSuggestions = generateUniqueImageSuggestions(destinationName, country);
      setSuggestions(newSuggestions);
    }
  }, [destinationName, country]);

  // Debounced validation
  useEffect(() => {
    const timer = setTimeout(() => {
      checkImageUrl(value);
    }, 500);

    return () => clearTimeout(timer);
  }, [value]);

  const getStatusIcon = () => {
    switch (validationStatus) {
      case 'checking':
        return <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full" />;
      case 'valid':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'invalid':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'duplicate':
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      default:
        return null;
    }
  };

  const getStatusMessage = () => {
    switch (validationStatus) {
      case 'checking':
        return 'Checking URL...';
      case 'valid':
        return 'URL is valid and unique';
      case 'invalid':
        return 'URL is not accessible';
      case 'duplicate':
        return 'This URL is already used by another destination';
      default:
        return '';
    }
  };

  const handleSuggestionSelect = (suggestion: ImageSuggestion) => {
    onChange(suggestion.url);
    setShowSuggestions(false);
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <Input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`pr-10 ${
            validationStatus === 'valid' ? 'border-green-500' :
            validationStatus === 'invalid' ? 'border-red-500' :
            validationStatus === 'duplicate' ? 'border-orange-500' :
            ''
          }`}
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          {getStatusIcon()}
        </div>
      </div>

      {validationStatus !== 'idle' && (
        <div className="flex items-center space-x-2">
          <Badge variant={
            validationStatus === 'valid' ? 'default' :
            validationStatus === 'duplicate' ? 'destructive' :
            'secondary'
          }>
            {getStatusMessage()}
          </Badge>
          {value && validationStatus === 'valid' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(value, '_blank')}
              className="text-xs"
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              Preview
            </Button>
          )}
        </div>
      )}

      {suggestions.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Suggested unique URLs:</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSuggestions(!showSuggestions)}
            >
              {showSuggestions ? 'Hide' : 'Show'} suggestions
            </Button>
          </div>

          {showSuggestions && (
            <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
              {suggestions.slice(0, 3).map((suggestion, index) => (
                <Card key={index} className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{suggestion.description}</p>
                        <p className="text-xs text-muted-foreground truncate">{suggestion.url}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSuggestionSelect(suggestion)}
                        className="ml-2"
                      >
                        Use
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Preview image if URL is valid */}
      {value && validationStatus === 'valid' && (
        <div className="mt-3">
          <img
            src={value}
            alt="Preview"
            className="w-full h-32 object-cover rounded-lg border"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
        </div>
      )}
    </div>
  );
}