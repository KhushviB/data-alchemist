'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Table, Key, Link, Brain, CheckCircle, AlertTriangle } from 'lucide-react';
import { TableSchema } from '@/app/page';

interface DatabaseSchemaProps {
  schemas: Record<string, TableSchema>;
}

export function DatabaseSchema({ schemas }: DatabaseSchemaProps) {
  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      id: '🔑',
      string: '📝',
      number: '🔢',
      boolean: '✅',
      date: '📅',
      email: '📧',
      url: '🔗',
      json: '📋',
      array: '📊'
    };
    return icons[type] || '📄';
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      id: 'bg-yellow-100 text-yellow-800',
      string: 'bg-blue-100 text-blue-800',
      number: 'bg-green-100 text-green-800',
      boolean: 'bg-purple-100 text-purple-800',
      date: 'bg-orange-100 text-orange-800',
      email: 'bg-pink-100 text-pink-800',
      url: 'bg-indigo-100 text-indigo-800',
      json: 'bg-gray-100 text-gray-800',
      array: 'bg-teal-100 text-teal-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 0.8) return <CheckCircle className="h-3 w-3" />;
    if (confidence >= 0.6) return <AlertTriangle className="h-3 w-3" />;
    return <AlertTriangle className="h-3 w-3" />;
  };

  return (
    <div className="space-y-6">
      {Object.entries(schemas).map(([tableName, schema]) => (
        <Card key={tableName} className="border-l-4 border-l-indigo-500">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Table className="h-5 w-5 text-indigo-600" />
                <span>{schema.name}</span>
                {schema.primaryKey && (
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                    <Key className="h-3 w-3 mr-1" />
                    PK: {schema.primaryKey}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-indigo-100 text-indigo-800">
                  {schema.columns.length} columns
                </Badge>
                <Badge variant="outline" className="bg-purple-50 text-purple-700">
                  <Brain className="h-3 w-3 mr-1" />
                  {schema.aiClassification.entityType}
                </Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* AI Classification */}
            <div className="p-3 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-200">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-purple-900">AI Classification</span>
                <div className={`flex items-center gap-1 ${getConfidenceColor(schema.aiClassification.confidence)}`}>
                  {getConfidenceIcon(schema.aiClassification.confidence)}
                  <span className="text-sm font-medium">
                    {Math.round(schema.aiClassification.confidence * 100)}%
                  </span>
                </div>
              </div>
              <p className="text-sm text-purple-700">{schema.aiClassification.reasoning}</p>
            </div>

            {/* Columns */}
            <div>
              <h4 className="font-medium mb-3">Column Schema</h4>
              <ScrollArea className="h-64 w-full">
                <div className="space-y-2">
                  {schema.columns.map((column, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{getTypeIcon(column.type)}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{column.name}</span>
                            {column.required && (
                              <Badge variant="destructive" className="text-xs">Required</Badge>
                            )}
                            {column.unique && (
                              <Badge variant="outline" className="text-xs">Unique</Badge>
                            )}
                          </div>
                          {column.validation && (
                            <div className="text-xs text-gray-600 mt-1">
                              {column.validation.min !== undefined && `Min: ${column.validation.min}`}
                              {column.validation.max !== undefined && ` Max: ${column.validation.max}`}
                              {column.validation.enum && ` Options: ${column.validation.enum.slice(0, 3).join(', ')}${column.validation.enum.length > 3 ? '...' : ''}`}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getTypeColor(column.type)}>
                          {column.type}
                        </Badge>
                        {column.aiDetected && (
                          <div className={`flex items-center gap-1 ${getConfidenceColor(column.confidence)}`}>
                            <Brain className="h-3 w-3" />
                            <span className="text-xs">{Math.round(column.confidence * 100)}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Relationships */}
            {schema.relationships.length > 0 && (
              <>
                <Separator />
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Link className="h-4 w-4" />
                    Detected Relationships
                  </h4>
                  <div className="space-y-2">
                    {schema.relationships.map((rel, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-blue-50 rounded border border-blue-200">
                        <div className="flex items-center gap-2">
                          <Link className="h-4 w-4 text-blue-600" />
                          <span className="text-sm">
                            <strong>{rel.column}</strong> → <strong>{rel.table}</strong>
                          </span>
                        </div>
                        <Badge variant="outline" className="text-xs bg-blue-100 text-blue-700">
                          {rel.type}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      ))}

      {/* Schema Summary */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Brain className="h-5 w-5 text-green-600" />
            <span className="font-medium text-green-900">Schema Analysis Summary</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-700">{Object.keys(schemas).length}</div>
              <div className="text-green-600">Tables</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-700">
                {Object.values(schemas).reduce((sum, schema) => sum + schema.columns.length, 0)}
              </div>
              <div className="text-green-600">Columns</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-700">
                {Object.values(schemas).reduce((sum, schema) => sum + schema.relationships.length, 0)}
              </div>
              <div className="text-green-600">Relationships</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-700">
                {Math.round(Object.values(schemas).reduce((sum, schema) => sum + schema.aiClassification.confidence, 0) / Object.keys(schemas).length * 100)}%
              </div>
              <div className="text-green-600">Avg Confidence</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}