'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Brain, Wand2, CheckCircle, AlertTriangle, Lightbulb, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { ValidationError, BusinessRule } from '@/app/page';

interface AIAssistantProps {
  validationErrors: ValidationError[];
  onApplyFix: (error: ValidationError) => void;
  aiSuggestions: {
    rules: BusinessRule[];
    corrections: ValidationError[];
  };
}

export function AIAssistant({ validationErrors, onApplyFix, aiSuggestions }: AIAssistantProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const autoFixableErrors = validationErrors.filter(error => error.autoFixable);
  const criticalErrors = validationErrors.filter(error => error.severity === 'error');

  const runAIAnalysis = async () => {
    setIsAnalyzing(true);
    
    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsAnalyzing(false);
    toast.success('AI analysis complete! Check suggestions below.');
  };

  const applyAllAutoFixes = () => {
    autoFixableErrors.forEach(error => {
      onApplyFix(error);
    });
    toast.success(`Applied ${autoFixableErrors.length} automatic fixes`);
  };

  return (
    <Card className="shadow-lg border-0 bg-gradient-to-br from-indigo-50 to-purple-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-indigo-600" />
          AI Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* AI Analysis Button */}
        <Button 
          onClick={runAIAnalysis}
          disabled={isAnalyzing}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
        >
          {isAnalyzing ? (
            <>
              <Brain className="h-4 w-4 mr-2 animate-pulse" />
              Analyzing Data...
            </>
          ) : (
            <>
              <Wand2 className="h-4 w-4 mr-2" />
              Run AI Analysis
            </>
          )}
        </Button>

        <Separator />

        {/* Quick Fixes */}
        {autoFixableErrors.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-500" />
                Quick Fixes Available
              </h4>
              <Badge variant="secondary">{autoFixableErrors.length}</Badge>
            </div>
            
            <Button 
              onClick={applyAllAutoFixes}
              variant="outline"
              size="sm"
              className="w-full"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Apply All Auto-Fixes
            </Button>

            <ScrollArea className="h-32">
              <div className="space-y-2">
                {autoFixableErrors.slice(0, 3).map((error, index) => (
                  <div key={index} className="p-2 bg-white rounded border text-xs">
                    <p className="font-medium">Row {error.row + 1}: {error.column}</p>
                    <p className="text-gray-600">{error.suggestion}</p>
                  </div>
                ))}
                {autoFixableErrors.length > 3 && (
                  <p className="text-xs text-gray-500 text-center">
                    +{autoFixableErrors.length - 3} more fixes available
                  </p>
                )}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* AI Rule Suggestions */}
        {aiSuggestions.rules.length > 0 && (
          <>
            <Separator />
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-amber-500" />
                AI Rule Suggestions
              </h4>
              
              <ScrollArea className="h-40">
                <div className="space-y-3">
                  {aiSuggestions.rules.map((rule, index) => (
                    <div key={index} className="p-3 bg-white rounded border">
                      <div className="flex items-start justify-between mb-2">
                        <Badge variant="outline" className="text-xs">
                          {rule.type}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          AI Generated
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-700">{rule.description}</p>
                      <div className="flex gap-2 mt-2">
                        <Button size="sm" variant="outline" className="text-xs">
                          Accept
                        </Button>
                        <Button size="sm" variant="ghost" className="text-xs">
                          Dismiss
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </>
        )}

        {/* Critical Issues Alert */}
        {criticalErrors.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <span className="font-medium text-red-700">Critical Issues</span>
                <Badge variant="destructive">{criticalErrors.length}</Badge>
              </div>
              <p className="text-sm text-red-600">
                {criticalErrors.length} critical error{criticalErrors.length !== 1 ? 's' : ''} need{criticalErrors.length === 1 ? 's' : ''} attention before export.
              </p>
            </div>
          </>
        )}

        {/* AI Insights */}
        <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="h-4 w-4 text-blue-600" />
            <span className="font-medium text-blue-900">AI Insights</span>
          </div>
          <p className="text-sm text-blue-700">
            Your data quality score is improving! Focus on resolving skill coverage issues for optimal allocation.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}