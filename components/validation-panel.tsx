'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { AlertTriangle, XCircle, Info, CheckCircle, Zap, Eye } from 'lucide-react';
import { ValidationError } from '@/app/page';

interface ValidationPanelProps {
  errors: ValidationError[];
  onApplyFix?: (error: ValidationError) => void;
}

export function ValidationPanel({ errors, onApplyFix }: ValidationPanelProps) {
  const errorCount = errors.filter(e => e.severity === 'error').length;
  const warningCount = errors.filter(e => e.severity === 'warning').length;
  const infoCount = errors.filter(e => e.severity === 'info').length;
  const autoFixableCount = errors.filter(e => e.autoFixable).length;

  const getIcon = (severity: string) => {
    switch (severity) {
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />;
      default:
        return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  const getBadgeVariant = (severity: string) => {
    switch (severity) {
      case 'error':
        return 'destructive';
      case 'warning':
        return 'secondary';
      case 'info':
        return 'outline';
      default:
        return 'default';
    }
  };

  const getValidationTypeDescription = (type: string) => {
    const descriptions: Record<string, string> = {
      'missing_required': 'Required field is empty',
      'duplicate_id': 'Duplicate identifier found',
      'malformed_list': 'Invalid list format',
      'out_of_range': 'Value outside valid range',
      'malformed_json': 'Invalid JSON syntax',
      'unknown_reference': 'Reference to non-existent entity',
      'skill_coverage': 'Skill not available in worker pool',
      'circular_dependency': 'Circular reference detected',
      'overloaded_worker': 'Worker capacity exceeded',
      'phase_conflict': 'Phase scheduling conflict'
    };
    return descriptions[type] || 'Validation issue';
  };

  if (errors.length === 0) {
    return (
      <Card className="shadow-lg border-0 bg-gradient-to-br from-green-50 to-emerald-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Validation Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
            <p className="text-green-600 font-medium">All data validated!</p>
            <p className="text-sm text-gray-500 mt-1">No validation errors found.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Group errors by type for better organization
  const errorsByType = errors.reduce((acc, error) => {
    if (!acc[error.type]) acc[error.type] = [];
    acc[error.type].push(error);
    return acc;
  }, {} as Record<string, ValidationError[]>);

  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-yellow-500" />
          Validation Report
        </CardTitle>
        <div className="flex flex-wrap gap-2 mt-2">
          {errorCount > 0 && (
            <Badge variant="destructive">
              {errorCount} Error{errorCount !== 1 ? 's' : ''}
            </Badge>
          )}
          {warningCount > 0 && (
            <Badge variant="secondary">
              {warningCount} Warning{warningCount !== 1 ? 's' : ''}
            </Badge>
          )}
          {infoCount > 0 && (
            <Badge variant="outline">
              {infoCount} Info
            </Badge>
          )}
          {autoFixableCount > 0 && (
            <Badge className="bg-yellow-100 text-yellow-800">
              <Zap className="h-3 w-3 mr-1" />
              {autoFixableCount} Auto-fixable
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] w-full">
          <div className="space-y-4">
            {Object.entries(errorsByType).map(([type, typeErrors]) => (
              <div key={type} className="space-y-2">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-sm text-gray-700">
                    {getValidationTypeDescription(type)}
                  </h4>
                  <Badge variant="outline" className="text-xs">
                    {typeErrors.length}
                  </Badge>
                </div>
                
                <div className="space-y-2 ml-4">
                  {typeErrors.map((error, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 rounded-lg border bg-gray-50">
                      {getIcon(error.severity)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={getBadgeVariant(error.severity)} className="text-xs">
                            {error.severity.toUpperCase()}
                          </Badge>
                          <span className="text-sm text-gray-600">
                            Row {error.row + 1} • {error.column}
                          </span>
                          {error.autoFixable && (
                            <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700">
                              <Zap className="h-3 w-3 mr-1" />
                              Auto-fix
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-900 mb-1">{error.message}</p>
                        {error.suggestion && (
                          <p className="text-xs text-gray-600 italic">
                            💡 {error.suggestion}
                          </p>
                        )}
                        
                        {/* Action buttons */}
                        <div className="flex gap-2 mt-2">
                          {error.autoFixable && onApplyFix && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onApplyFix(error)}
                              className="text-xs h-6"
                            >
                              <Zap className="h-3 w-3 mr-1" />
                              Fix
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-xs h-6"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {Object.keys(errorsByType).indexOf(type) < Object.keys(errorsByType).length - 1 && (
                  <Separator className="my-3" />
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}