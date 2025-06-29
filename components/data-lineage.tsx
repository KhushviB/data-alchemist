'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GitBranch, Database, ArrowRight, Eye, Download } from 'lucide-react';
import { TableSchema, DataRow } from '@/app/page';

interface DataLineageProps {
  schemas: Record<string, TableSchema>;
  data: Record<string, DataRow[]>;
}

export function DataLineage({ schemas, data }: DataLineageProps) {
  const generateLineageMap = () => {
    const lineage: Record<string, { upstream: string[]; downstream: string[] }> = {};
    
    // Initialize lineage for each table
    Object.keys(schemas).forEach(tableName => {
      lineage[tableName] = { upstream: [], downstream: [] };
    });
    
    // Build relationships
    Object.entries(schemas).forEach(([tableName, schema]) => {
      schema.relationships.forEach(rel => {
        if (lineage[tableName] && lineage[rel.table]) {
          lineage[tableName].upstream.push(rel.table);
          lineage[rel.table].downstream.push(tableName);
        }
      });
    });
    
    return lineage;
  };

  const lineageMap = generateLineageMap();
  const tableNames = Object.keys(schemas);

  const getTableColor = (tableName: string) => {
    const schema = schemas[tableName];
    switch (schema?.aiClassification.entityType) {
      case 'clients': return 'bg-blue-100 border-blue-300 text-blue-800';
      case 'workers': return 'bg-green-100 border-green-300 text-green-800';
      case 'tasks': return 'bg-purple-100 border-purple-300 text-purple-800';
      default: return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const getDataQuality = (tableName: string) => {
    const schema = schemas[tableName];
    return schema?.insights?.accuracy || 0.9;
  };

  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitBranch className="h-5 w-5 text-indigo-600" />
          Data Lineage & Flow Visualization
          <Badge variant="outline" className="bg-indigo-50 text-indigo-700">
            <Database className="h-3 w-3 mr-1" />
            Interactive Map
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Lineage Visualization */}
        <div className="relative p-6 bg-gradient-to-br from-gray-50 to-indigo-50 rounded-lg border">
          <div className="flex justify-center items-center space-x-8">
            {tableNames.map((tableName, index) => {
              const schema = schemas[tableName];
              const recordCount = data[tableName]?.length || 0;
              const quality = getDataQuality(tableName);
              
              return (
                <div key={tableName} className="relative">
                  {/* Connection Lines */}
                  {index < tableNames.length - 1 && (
                    <div className="absolute top-1/2 -right-4 transform -translate-y-1/2 z-0">
                      <ArrowRight className="h-4 w-4 text-gray-400" />
                    </div>
                  )}
                  
                  {/* Table Node */}
                  <div className={`relative z-10 p-4 rounded-lg border-2 ${getTableColor(tableName)} min-w-[160px]`}>
                    <div className="text-center">
                      <div className="font-medium mb-1">{tableName}</div>
                      <div className="text-xs opacity-75 mb-2">
                        {schema?.aiClassification.entityType}
                      </div>
                      
                      {/* Metrics */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>Records:</span>
                          <span className="font-medium">{recordCount}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>Quality:</span>
                          <span className="font-medium">{Math.round(quality * 100)}%</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>Columns:</span>
                          <span className="font-medium">{schema?.columns.length || 0}</span>
                        </div>
                      </div>
                      
                      {/* Quality Indicator */}
                      <div className="mt-2">
                        <div className="w-full bg-white/50 rounded-full h-1">
                          <div 
                            className={`h-1 rounded-full ${
                              quality > 0.9 ? 'bg-green-500' : 
                              quality > 0.7 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${quality * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Relationship Details */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Detected Relationships</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(lineageMap).map(([tableName, connections]) => (
              <Card key={tableName} className="border-l-4 border-l-indigo-500">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Database className="h-4 w-4 text-indigo-600" />
                    <span className="font-medium">{tableName}</span>
                    <Badge variant="outline" className="text-xs">
                      {schemas[tableName]?.aiClassification.entityType}
                    </Badge>
                  </div>
                  
                  {connections.upstream.length > 0 && (
                    <div className="mb-2">
                      <span className="text-xs font-medium text-gray-500">DEPENDS ON:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {connections.upstream.map((upTable) => (
                          <Badge key={upTable} variant="outline" className="text-xs bg-blue-50 text-blue-700">
                            {upTable}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {connections.downstream.length > 0 && (
                    <div>
                      <span className="text-xs font-medium text-gray-500">FEEDS INTO:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {connections.downstream.map((downTable) => (
                          <Badge key={downTable} variant="outline" className="text-xs bg-green-50 text-green-700">
                            {downTable}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {connections.upstream.length === 0 && connections.downstream.length === 0 && (
                    <div className="text-xs text-gray-500 italic">No relationships detected</div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Data Flow Summary */}
        <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium text-indigo-900">Data Flow Analysis</span>
              <Badge className="bg-indigo-100 text-indigo-800">
                AI-Powered
              </Badge>
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-700">
                  {Object.values(lineageMap).reduce((sum, conn) => sum + conn.upstream.length + conn.downstream.length, 0)}
                </div>
                <div className="text-indigo-600">Total Connections</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-700">
                  {Math.round(Object.values(schemas).reduce((sum, schema) => sum + (schema.insights?.consistency || 0.9), 0) / Object.keys(schemas).length * 100)}%
                </div>
                <div className="text-indigo-600">Data Consistency</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-700">
                  {Object.values(schemas).reduce((sum, schema) => sum + schema.relationships.length, 0)}
                </div>
                <div className="text-indigo-600">Relationships</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-2" />
            View Full Diagram
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Lineage
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}