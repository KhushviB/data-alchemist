'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, File, CheckCircle, AlertCircle, Brain, Sparkles, Database, Table } from 'lucide-react';
import { toast } from 'sonner';
import { DataRow, TableSchema, ColumnSchema, DataType } from '@/app/page';

interface FileUploadProps {
  onDataUpload: (tableName: string, data: DataRow[], schema: TableSchema) => void;
}

export function FileUpload({ onDataUpload }: FileUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState<Record<string, boolean>>({});
  const [customTableName, setCustomTableName] = useState('');

  const processFile = useCallback(async (file: File, tableName?: string) => {
    const finalTableName = tableName || customTableName || file.name.replace(/\.[^/.]+$/, "");
    
    setIsProcessing(prev => ({ ...prev, [finalTableName]: true }));
    
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    try {
      if (fileExtension === 'csv') {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: async (results) => {
            if (results.errors.length > 0) {
              toast.error(`Error parsing ${file.name}: ${results.errors[0].message}`);
              setIsProcessing(prev => ({ ...prev, [finalTableName]: false }));
              return;
            }
            
            // AI-powered schema detection and data cleaning
            const { cleanedData, detectedSchema } = await performAISchemaDetection(
              results.data as DataRow[], 
              finalTableName,
              file.name
            );
            
            onDataUpload(finalTableName, cleanedData, detectedSchema);
            setUploadedFiles(prev => ({ ...prev, [finalTableName]: file.name }));
            setIsProcessing(prev => ({ ...prev, [finalTableName]: false }));
            setCustomTableName('');
            toast.success(`Successfully processed ${file.name} with AI schema detection`);
          },
          error: (error) => {
            toast.error(`Error parsing ${file.name}: ${error.message}`);
            setIsProcessing(prev => ({ ...prev, [finalTableName]: false }));
          }
        });
      } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);
            
            // AI-powered schema detection and data cleaning
            const { cleanedData, detectedSchema } = await performAISchemaDetection(
              jsonData as DataRow[], 
              finalTableName,
              file.name
            );
            
            onDataUpload(finalTableName, cleanedData, detectedSchema);
            setUploadedFiles(prev => ({ ...prev, [finalTableName]: file.name }));
            setIsProcessing(prev => ({ ...prev, [finalTableName]: false }));
            setCustomTableName('');
            toast.success(`Successfully processed ${file.name} with AI schema detection`);
          } catch (error) {
            toast.error(`Error parsing ${file.name}: ${(error as Error).message}`);
            setIsProcessing(prev => ({ ...prev, [finalTableName]: false }));
          }
        };
        reader.readAsArrayBuffer(file);
      } else {
        toast.error('Please upload CSV or Excel files only');
        setIsProcessing(prev => ({ ...prev, [finalTableName]: false }));
      }
    } catch (error) {
      toast.error(`Error processing ${file.name}: ${(error as Error).message}`);
      setIsProcessing(prev => ({ ...prev, [finalTableName]: false }));
    }
  }, [onDataUpload, customTableName]);

  const performAISchemaDetection = async (
    data: DataRow[], 
    tableName: string,
    fileName: string
  ): Promise<{ cleanedData: DataRow[]; detectedSchema: TableSchema }> => {
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    if (data.length === 0) {
      throw new Error('No data found in file');
    }

    // Get all unique column names from the data
    const allColumns = new Set<string>();
    data.forEach(row => {
      Object.keys(row).forEach(key => allColumns.add(key));
    });

    const columns: ColumnSchema[] = Array.from(allColumns).map(columnName => {
      return detectColumnSchema(columnName, data);
    });

    // AI-powered entity type classification
    const entityClassification = classifyEntityType(tableName, columns, fileName);

    // Detect relationships with other tables
    const relationships = detectRelationships(columns, tableName);

    // Clean and normalize the data
    const cleanedData = data.map(row => {
      const cleanedRow: DataRow = {};
      columns.forEach(column => {
        const rawValue = row[column.name];
        cleanedRow[column.name] = cleanValue(rawValue, column);
      });
      return cleanedRow;
    });

    const detectedSchema: TableSchema = {
      name: tableName,
      columns,
      primaryKey: findPrimaryKey(columns),
      relationships,
      aiClassification: entityClassification
    };

    return { cleanedData, detectedSchema };
  };

  const detectColumnSchema = (columnName: string, data: DataRow[]): ColumnSchema => {
    const lowerName = columnName.toLowerCase();
    const values = data.map(row => row[columnName]).filter(v => v !== null && v !== undefined && v !== '');
    
    // Analyze data patterns
    const sampleSize = Math.min(values.length, 100);
    const samples = values.slice(0, sampleSize);
    
    // Type detection with confidence scoring
    const typeScores = {
      id: 0,
      number: 0,
      boolean: 0,
      date: 0,
      email: 0,
      url: 0,
      json: 0,
      array: 0,
      string: 0
    };

    // ID detection
    if (lowerName.includes('id') || lowerName.includes('key')) {
      typeScores.id += 50;
    }
    
    // Check if values look like IDs
    const idPattern = /^[A-Z]\d{3,}$|^[a-zA-Z0-9-_]{8,}$/;
    const idMatches = samples.filter(v => idPattern.test(String(v))).length;
    typeScores.id += (idMatches / samples.length) * 30;

    // Number detection
    const numberMatches = samples.filter(v => !isNaN(parseFloat(String(v))) && isFinite(parseFloat(String(v)))).length;
    typeScores.number = (numberMatches / samples.length) * 100;

    // Boolean detection
    const boolValues = ['true', 'false', '1', '0', 'yes', 'no', 'y', 'n'];
    const boolMatches = samples.filter(v => boolValues.includes(String(v).toLowerCase())).length;
    typeScores.boolean = (boolMatches / samples.length) * 100;

    // Date detection
    const dateMatches = samples.filter(v => !isNaN(Date.parse(String(v)))).length;
    typeScores.date = (dateMatches / samples.length) * 100;

    // Email detection
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const emailMatches = samples.filter(v => emailRegex.test(String(v))).length;
    typeScores.email = (emailMatches / samples.length) * 100;

    // URL detection
    const urlMatches = samples.filter(v => {
      try {
        new URL(String(v));
        return true;
      } catch {
        return false;
      }
    }).length;
    typeScores.url = (urlMatches / samples.length) * 100;

    // JSON detection
    const jsonMatches = samples.filter(v => {
      try {
        JSON.parse(String(v));
        return true;
      } catch {
        return false;
      }
    }).length;
    typeScores.json = (jsonMatches / samples.length) * 100;

    // Array detection
    const arrayMatches = samples.filter(v => {
      const str = String(v);
      return (str.startsWith('[') && str.endsWith(']')) || str.includes(',');
    }).length;
    typeScores.array = (arrayMatches / samples.length) * 100;

    // Determine the best type
    const bestType = Object.entries(typeScores).reduce((a, b) => 
      typeScores[a[0] as keyof typeof typeScores] > typeScores[b[0] as keyof typeof typeScores] ? a : b
    )[0] as ColumnSchema['type'];

    const confidence = typeScores[bestType as keyof typeof typeScores] / 100;

    // Determine if required (less than 10% null values)
    const nullCount = data.filter(row => !row[columnName] || row[columnName] === '').length;
    const required = (nullCount / data.length) < 0.1;

    // Determine if unique
    const uniqueValues = new Set(values);
    const unique = uniqueValues.size === values.length && values.length > 1;

    // Set validation rules based on type and patterns
    const validation: ColumnSchema['validation'] = {};
    
    if (bestType === 'number') {
      const numbers = samples.map(v => parseFloat(String(v))).filter(n => !isNaN(n));
      if (numbers.length > 0) {
        validation.min = Math.min(...numbers);
        validation.max = Math.max(...numbers);
      }
    }

    // Priority level detection
    if (lowerName.includes('priority') && bestType === 'number') {
      validation.min = 1;
      validation.max = 5;
    }

    // Status/category enum detection
    if (uniqueValues.size <= 10 && uniqueValues.size > 1 && bestType === 'string') {
      validation.enum = Array.from(uniqueValues).map(v => String(v));
    }

    return {
      name: columnName,
      type: bestType === 'string' && confidence < 0.3 ? 'string' : bestType,
      required,
      unique,
      validation: Object.keys(validation).length > 0 ? validation : undefined,
      aiDetected: true,
      confidence
    };
  };

  const classifyEntityType = (tableName: string, columns: ColumnSchema[], fileName: string) => {
    const lowerName = tableName.toLowerCase();
    const lowerFileName = fileName.toLowerCase();
    
    const scores = {
      clients: 0,
      workers: 0,
      tasks: 0
    };

    // Name-based classification
    if (lowerName.includes('client') || lowerName.includes('customer') || lowerFileName.includes('client')) {
      scores.clients += 40;
    }
    if (lowerName.includes('worker') || lowerName.includes('employee') || lowerName.includes('staff') || lowerFileName.includes('worker')) {
      scores.workers += 40;
    }
    if (lowerName.includes('task') || lowerName.includes('job') || lowerName.includes('project') || lowerFileName.includes('task')) {
      scores.tasks += 40;
    }

    // Column-based classification
    columns.forEach(column => {
      const colName = column.name.toLowerCase();
      
      // Client indicators
      if (colName.includes('priority') || colName.includes('request') || colName.includes('budget')) {
        scores.clients += 15;
      }
      
      // Worker indicators
      if (colName.includes('skill') || colName.includes('available') || colName.includes('capacity') || colName.includes('qualification')) {
        scores.workers += 15;
      }
      
      // Task indicators
      if (colName.includes('duration') || colName.includes('phase') || colName.includes('concurrent') || colName.includes('category')) {
        scores.tasks += 15;
      }
    });

    const bestMatch = Object.entries(scores).reduce((a, b) => scores[a[0] as DataType] > scores[b[0] as DataType] ? a : b);
    const confidence = bestMatch[1] / 100;

    return {
      entityType: bestMatch[0] as DataType,
      confidence: Math.min(confidence, 1.0),
      reasoning: `Detected based on table name "${tableName}" and column patterns. Confidence: ${Math.round(confidence * 100)}%`
    };
  };

  const detectRelationships = (columns: ColumnSchema[], tableName: string) => {
    const relationships: TableSchema['relationships'] = [];
    
    columns.forEach(column => {
      const colName = column.name.toLowerCase();
      
      // Detect foreign key patterns
      if (colName.includes('taskid') || colName.includes('task_id')) {
        relationships.push({
          table: 'tasks',
          column: column.name,
          type: 'many-to-one'
        });
      }
      
      if (colName.includes('workerid') || colName.includes('worker_id')) {
        relationships.push({
          table: 'workers',
          column: column.name,
          type: 'many-to-one'
        });
      }
      
      if (colName.includes('clientid') || colName.includes('client_id')) {
        relationships.push({
          table: 'clients',
          column: column.name,
          type: 'many-to-one'
        });
      }
    });
    
    return relationships;
  };

  const findPrimaryKey = (columns: ColumnSchema[]): string | undefined => {
    // Look for ID columns
    const idColumn = columns.find(col => 
      col.name.toLowerCase().includes('id') && 
      col.unique && 
      col.type === 'id'
    );
    
    return idColumn?.name;
  };

  const cleanValue = (value: any, column: ColumnSchema): any => {
    if (value === null || value === undefined || value === '') {
      return '';
    }
    
    const stringValue = String(value).trim();
    
    switch (column.type) {
      case 'number':
        const numValue = parseFloat(stringValue);
        return isNaN(numValue) ? (column.required ? 0 : '') : numValue;
        
      case 'boolean':
        const boolMap: Record<string, boolean> = {
          'true': true, 'false': false,
          '1': true, '0': false,
          'yes': true, 'no': false,
          'y': true, 'n': false
        };
        return boolMap[stringValue.toLowerCase()] ?? false;
        
      case 'json':
        try {
          JSON.parse(stringValue);
          return stringValue;
        } catch {
          return '{}';
        }
        
      case 'array':
        try {
          const parsed = JSON.parse(stringValue.replace(/'/g, '"'));
          return Array.isArray(parsed) ? stringValue : `[${stringValue}]`;
        } catch {
          if (stringValue.includes(',')) {
            return `[${stringValue.split(',').map(s => `"${s.trim()}"`).join(',')}]`;
          }
          return stringValue;
        }
        
      default:
        return stringValue;
    }
  };

  const FileDropZone = () => {
    const onDrop = useCallback((acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        processFile(acceptedFiles[0]);
      }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      onDrop,
      accept: {
        'text/csv': ['.csv'],
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
        'application/vnd.ms-excel': ['.xls']
      },
      multiple: false
    });

    return (
      <Card 
        {...getRootProps()} 
        className={`cursor-pointer transition-all duration-200 ${
          isDragActive 
            ? 'border-indigo-500 bg-indigo-50 shadow-lg' 
            : 'border-dashed border-gray-300 hover:border-indigo-400 hover:bg-indigo-50 hover:shadow-md'
        }`}
      >
        <CardContent className="p-8 text-center">
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-4">
            <Upload className="h-12 w-12 text-gray-400" />
            <div>
              <p className="font-medium text-gray-900 text-lg">
                {isDragActive 
                  ? 'Drop your file here...' 
                  : 'Upload Any CSV or Excel File'
                }
              </p>
              <p className="text-sm text-gray-500 mt-2">
                AI will automatically detect schema, data types, and relationships
              </p>
              <div className="flex items-center justify-center gap-2 mt-3">
                <Brain className="h-4 w-4 text-indigo-500" />
                <span className="text-xs text-indigo-600">Unlimited columns • Smart type detection • Auto-validation</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Custom Table Name Input */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="tableName">Custom Table Name (Optional)</Label>
          <Input
            id="tableName"
            placeholder="e.g., employees, products, orders..."
            value={customTableName}
            onChange={(e) => setCustomTableName(e.target.value)}
            className="mt-1"
          />
        </div>
        <div className="flex items-end">
          <Button
            variant="outline"
            onClick={() => setCustomTableName('')}
            className="w-full"
          >
            Use Filename as Table Name
          </Button>
        </div>
      </div>

      {/* File Drop Zone */}
      <FileDropZone />
      
      {/* Uploaded Files Display */}
      {Object.keys(uploadedFiles).length > 0 && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <h4 className="font-medium text-green-900 mb-3 flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Successfully Processed Tables
            </h4>
            <div className="space-y-2">
              {Object.entries(uploadedFiles).map(([tableName, fileName]) => (
                <div key={tableName} className="flex items-center justify-between p-2 bg-white rounded border">
                  <div className="flex items-center gap-2">
                    <Table className="h-4 w-4 text-green-600" />
                    <span className="font-medium">{tableName}</span>
                    <Badge variant="outline" className="text-xs">
                      {fileName}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-green-600" />
                    <span className="text-xs text-green-600">AI Enhanced</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Processing Status */}
      {Object.keys(isProcessing).some(key => isProcessing[key]) && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-blue-500 animate-pulse" />
              <span className="font-medium text-blue-900">AI Processing...</span>
            </div>
            <div className="text-sm text-blue-700 mt-2 space-y-1">
              <p>🔍 Analyzing data structure and patterns</p>
              <p>🧠 Detecting column types and relationships</p>
              <p>✨ Applying intelligent data cleaning</p>
              <p>🔗 Identifying entity relationships</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Features Info */}
      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Database className="h-5 w-5 text-indigo-600" />
            <span className="font-medium text-indigo-900">AI-Powered Dynamic Database</span>
          </div>
          <div className="text-sm text-indigo-700 space-y-1">
            <p>• <strong>Unlimited Columns:</strong> No restrictions on data structure</p>
            <p>• <strong>Smart Type Detection:</strong> Automatically identifies data types</p>
            <p>• <strong>Entity Classification:</strong> Recognizes clients, workers, tasks</p>
            <p>• <strong>Relationship Mapping:</strong> Detects foreign key relationships</p>
            <p>• <strong>Validation Rules:</strong> Generates appropriate constraints</p>
            <p>• <strong>Data Cleaning:</strong> Normalizes and fixes common issues</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}