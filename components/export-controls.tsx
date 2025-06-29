'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Download, FileSpreadsheet, FileCode, CheckCircle, AlertTriangle, Package, Database } from 'lucide-react';
import { toast } from 'sonner';
import { DataRow, BusinessRule, PrioritySettings, ValidationError, TableSchema } from '@/app/page';

interface ExportControlsProps {
  data: Record<string, DataRow[]>;
  schemas: Record<string, TableSchema>;
  rules: BusinessRule[];
  priorities: PrioritySettings;
  validationErrors: ValidationError[];
}

export function ExportControls({ data, schemas, rules, priorities, validationErrors }: ExportControlsProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  const getTotalRows = () => {
    return Object.values(data).reduce((sum, tableData) => sum + tableData.length, 0);
  };

  const getCriticalErrors = () => {
    return validationErrors.filter(error => error.severity === 'error').length;
  };

  const downloadCSV = (data: DataRow[], filename: string) => {
    if (data.length === 0) return;
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header] || '';
          // Escape quotes and wrap in quotes if contains comma
          return String(value).includes(',') ? `"${String(value).replace(/"/g, '""')}"` : String(value);
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadJSON = (data: any, filename: string) => {
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generateDatabaseConfig = () => {
    const config = {
      metadata: {
        version: '2.0',
        generatedAt: new Date().toISOString(),
        totalTables: Object.keys(data).length,
        totalRecords: getTotalRows(),
        totalRules: rules.length,
        activeRules: rules.filter(r => r.enabled).length
      },
      database: {
        tables: Object.entries(schemas).map(([tableName, schema]) => ({
          name: tableName,
          schema: {
            columns: schema.columns,
            primaryKey: schema.primaryKey,
            relationships: schema.relationships,
            aiClassification: schema.aiClassification
          },
          recordCount: data[tableName]?.length || 0
        }))
      },
      priorities: {
        ...priorities,
        description: 'Resource allocation priority weights (0-100)'
      },
      businessRules: rules.filter(r => r.enabled).map(rule => ({
        id: rule.id,
        type: rule.type,
        description: rule.description,
        parameters: rule.parameters,
        enabled: rule.enabled,
        aiGenerated: rule.aiGenerated || false
      })),
      validationSummary: {
        totalErrors: validationErrors.filter(e => e.severity === 'error').length,
        totalWarnings: validationErrors.filter(e => e.severity === 'warning').length,
        criticalIssues: getCriticalErrors(),
        dataQualityScore: Math.max(0, 100 - (getCriticalErrors() * 10))
      },
      dataStatistics: Object.entries(data).reduce((stats, [tableName, tableData]) => {
        const schema = schemas[tableName];
        stats[tableName] = {
          total: tableData.length,
          entityType: schema?.aiClassification.entityType || 'unknown',
          confidence: schema?.aiClassification.confidence || 0,
          columns: schema?.columns.length || 0,
          relationships: schema?.relationships.length || 0
        };
        return stats;
      }, {} as Record<string, any>)
    };

    return config;
  };

  const exportAll = async () => {
    if (getCriticalErrors() > 0) {
      toast.error(`Cannot export with ${getCriticalErrors()} critical errors. Please fix them first.`);
      return;
    }

    setIsExporting(true);
    setExportProgress(0);

    try {
      // Simulate processing time with progress updates
      const steps = [
        { progress: 20, message: 'Validating database integrity...' },
        { progress: 40, message: 'Generating clean datasets...' },
        { progress: 60, message: 'Creating schema configuration...' },
        { progress: 80, message: 'Packaging export files...' },
        { progress: 100, message: 'Export complete!' }
      ];

      for (const step of steps) {
        setExportProgress(step.progress);
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Export CSV files for each table
      Object.entries(data).forEach(([tableName, tableData]) => {
        if (tableData.length > 0) {
          downloadCSV(tableData, `${tableName}_cleaned.csv`);
        }
      });

      // Export database configuration
      const databaseConfig = generateDatabaseConfig();
      downloadJSON(databaseConfig, 'database_config.json');

      // Export schema separately
      downloadJSON(schemas, 'database_schema.json');

      toast.success('Export completed successfully! All files downloaded.');
    } catch (error) {
      toast.error('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  const exportSingle = (tableName: string) => {
    if (!data[tableName] || data[tableName].length === 0) {
      toast.error(`No data in ${tableName} table to export`);
      return;
    }
    
    downloadCSV(data[tableName], `${tableName}_cleaned.csv`);
    toast.success(`${tableName} data exported successfully!`);
  };

  const canExport = getTotalRows() > 0 && getCriticalErrors() === 0;

  return (
    <div className="space-y-4">
      {/* Export Progress */}
      {isExporting && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-900">Exporting Database...</span>
                <span className="text-sm text-blue-700">{exportProgress}%</span>
              </div>
              <Progress value={exportProgress} className="bg-blue-200" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Export Readiness Status */}
      <Card className={`${canExport ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            {canExport ? (
              <>
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium text-green-900">Ready for Export</p>
                  <p className="text-sm text-green-700">
                    Database validated and configured
                  </p>
                </div>
              </>
            ) : (
              <>
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <div>
                  <p className="font-medium text-red-900">Export Blocked</p>
                  <p className="text-sm text-red-700">
                    {getCriticalErrors()} critical error{getCriticalErrors() !== 1 ? 's' : ''} must be resolved
                  </p>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Export Package Contents */}
      <Card>
        <CardContent className="p-4">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Database className="h-4 w-4" />
            Export Package Contents
          </h4>
          <div className="space-y-2">
            {Object.entries(data).map(([tableName, tableData]) => (
              <div key={tableName} className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{tableName} Dataset</span>
                <Badge variant="outline">{tableData.length} records</Badge>
              </div>
            ))}
            <Separator />
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Database Schema</span>
              <Badge variant="outline">{Object.keys(schemas).length} tables</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Business Rules</span>
              <Badge variant="outline">{rules.filter(r => r.enabled).length} active</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Priority Configuration</span>
              <Badge variant="outline">6 parameters</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Export Actions */}
      <div className="space-y-3">
        <Button 
          onClick={exportAll}
          disabled={isExporting || !canExport}
          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
        >
          {isExporting ? (
            <>
              <Package className="h-4 w-4 mr-2 animate-pulse" />
              Exporting Database...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Export Complete Database
            </>
          )}
        </Button>

        {/* Individual Table Exports */}
        {Object.keys(data).length > 0 && (
          <>
            <Separator />
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(data).map(([tableName, tableData]) => (
                <Button
                  key={tableName}
                  variant="outline"
                  size="sm"
                  onClick={() => exportSingle(tableName)}
                  disabled={tableData.length === 0}
                >
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  {tableName} CSV
                </Button>
              ))}
            </div>
          </>
        )}

        {/* Configuration Exports */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => downloadJSON(generateDatabaseConfig(), 'database_config.json')}
            disabled={Object.keys(data).length === 0}
          >
            <FileCode className="h-4 w-4 mr-2" />
            Config JSON
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => downloadJSON(schemas, 'database_schema.json')}
            disabled={Object.keys(schemas).length === 0}
          >
            <Database className="h-4 w-4 mr-2" />
            Schema JSON
          </Button>
        </div>
      </div>

      {/* Data Quality Score */}
      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-indigo-900">Database Quality Score</span>
            <Badge className="bg-indigo-100 text-indigo-800">
              {Math.max(0, 100 - (getCriticalErrors() * 10))}%
            </Badge>
          </div>
          <Progress 
            value={Math.max(0, 100 - (getCriticalErrors() * 10))} 
            className="bg-indigo-200"
          />
          <p className="text-sm text-indigo-700 mt-2">
            Ready for downstream processing and analysis
          </p>
        </CardContent>
      </Card>
    </div>
  );
}