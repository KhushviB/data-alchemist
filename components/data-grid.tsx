'use client';

import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Search, Edit3, Check, X, AlertTriangle, XCircle, Zap, Brain } from 'lucide-react';
import { DataRow, ValidationError, TableSchema } from '@/app/page';

interface DataGridProps {
  data: DataRow[];
  tableName: string;
  schema?: TableSchema;
  onUpdate: (tableName: string, rowIndex: number, field: string, value: any) => void;
  validationErrors: ValidationError[];
  searchResults?: number[];
}

export function DataGrid({ data, tableName, schema, onUpdate, validationErrors, searchResults = [] }: DataGridProps) {
  const [editingCell, setEditingCell] = useState<{ row: number; column: string } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  if (data.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-gray-500">No data in {tableName} table yet. Upload a file to get started.</p>
        </CardContent>
      </Card>
    );
  }

  const columns = schema?.columns || Object.keys(data[0] || {}).map(key => ({
    name: key,
    type: 'string' as const,
    required: false,
    unique: false,
    aiDetected: false,
    confidence: 0
  }));
  
  // Filter data based on search results or search term
  let filteredData = data;
  let filteredIndices = data.map((_, index) => index);

  if (searchResults.length > 0) {
    filteredData = searchResults.map(index => data[index]);
    filteredIndices = searchResults;
  } else if (searchTerm) {
    const filtered = data.map((row, index) => ({ row, index }))
      .filter(({ row }) =>
        Object.values(row).some(value =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    filteredData = filtered.map(({ row }) => row);
    filteredIndices = filtered.map(({ index }) => index);
  }

  const startEdit = (rowIndex: number, column: string, currentValue: any) => {
    setEditingCell({ row: rowIndex, column });
    setEditValue(String(currentValue || ''));
  };

  const saveEdit = () => {
    if (editingCell) {
      const actualRowIndex = filteredIndices[editingCell.row];
      onUpdate(tableName, actualRowIndex, editingCell.column, editValue);
      setEditingCell(null);
      setEditValue('');
    }
  };

  const cancelEdit = () => {
    setEditingCell(null);
    setEditValue('');
  };

  const getCellErrors = (rowIndex: number, column: string) => {
    const actualRowIndex = filteredIndices[rowIndex];
    return validationErrors.filter(error => 
      error.row === actualRowIndex && 
      error.column === column &&
      error.id.startsWith(tableName)
    );
  };

  const getErrorBadgeColor = (severity: string) => {
    switch (severity) {
      case 'error': return 'destructive';
      case 'warning': return 'secondary';
      default: return 'outline';
    }
  };

  const getRowHighlight = (rowIndex: number) => {
    const actualRowIndex = filteredIndices[rowIndex];
    const hasErrors = validationErrors.some(error => 
      error.row === actualRowIndex && 
      error.severity === 'error' &&
      error.id.startsWith(tableName)
    );
    const hasWarnings = validationErrors.some(error => 
      error.row === actualRowIndex && 
      error.severity === 'warning' &&
      error.id.startsWith(tableName)
    );
    
    if (hasErrors) return 'bg-red-50 border-l-4 border-red-500';
    if (hasWarnings) return 'bg-yellow-50 border-l-4 border-yellow-500';
    return '';
  };

  const getColumnTypeIcon = (type: string) => {
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

  const getInputType = (columnType: string) => {
    switch (columnType) {
      case 'number': return 'number';
      case 'email': return 'email';
      case 'url': return 'url';
      case 'date': return 'date';
      default: return 'text';
    }
  };

  const shouldUseTextarea = (columnType: string) => {
    return columnType === 'json' || columnType === 'array';
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      {searchResults.length === 0 && (
        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search data..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Badge variant="outline">
            {filteredData.length} of {data.length} rows
          </Badge>
        </div>
      )}

      {searchResults.length > 0 && (
        <div className="flex items-center gap-2">
          <Badge className="bg-purple-100 text-purple-800">
            AI Search Results: {searchResults.length} matches
          </Badge>
        </div>
      )}

      {/* Schema Info */}
      {schema && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">
                  AI-Detected Schema: {schema.aiClassification.entityType}
                </span>
                <Badge variant="outline" className="text-xs">
                  {Math.round(schema.aiClassification.confidence * 100)}% confidence
                </Badge>
              </div>
              <div className="text-xs text-blue-700">
                {columns.length} columns • {schema.relationships.length} relationships
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Data Table */}
      <ScrollArea className="h-[500px] w-full rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              {columns.map((column) => (
                <TableHead key={column.name} className="min-w-[150px]">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{getColumnTypeIcon(column.type)}</span>
                    <div>
                      <div className="flex items-center gap-1">
                        {column.name}
                        {column.required && (
                          <span className="text-red-500 text-xs">*</span>
                        )}
                        {column.unique && (
                          <Badge variant="outline" className="text-xs">U</Badge>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        {column.type}
                        {column.aiDetected && (
                          <span className="ml-1 text-blue-500">
                            ({Math.round(column.confidence * 100)}%)
                          </span>
                        )}
                      </div>
                    </div>
                    {/* Show validation indicators for columns */}
                    {validationErrors.some(error => error.column === column.name && error.id.startsWith(tableName)) && (
                      <div className="flex gap-1">
                        {validationErrors.some(error => 
                          error.column === column.name && 
                          error.severity === 'error' && 
                          error.id.startsWith(tableName)
                        ) && <XCircle className="h-3 w-3 text-red-500" />}
                        {validationErrors.some(error => 
                          error.column === column.name && 
                          error.severity === 'warning' && 
                          error.id.startsWith(tableName)
                        ) && <AlertTriangle className="h-3 w-3 text-yellow-500" />}
                      </div>
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map((row, rowIndex) => (
              <TableRow key={rowIndex} className={`group ${getRowHighlight(rowIndex)}`}>
                <TableCell className="font-medium text-gray-500">
                  {filteredIndices[rowIndex] + 1}
                </TableCell>
                {columns.map((column) => {
                  const cellErrors = getCellErrors(rowIndex, column.name);
                  const isEditing = editingCell?.row === rowIndex && editingCell?.column === column.name;
                  const hasAutoFix = cellErrors.some(error => error.autoFixable);
                  
                  return (
                    <TableCell key={column.name} className="relative">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          {isEditing ? (
                            <div className="flex items-center gap-2 w-full">
                              {shouldUseTextarea(column.type) ? (
                                <Textarea
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  className="min-h-[60px] text-sm"
                                  autoFocus
                                />
                              ) : (
                                <Input
                                  type={getInputType(column.type)}
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  className="h-8"
                                  autoFocus
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') saveEdit();
                                    if (e.key === 'Escape') cancelEdit();
                                  }}
                                />
                              )}
                              <Button size="sm" variant="ghost" onClick={saveEdit}>
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={cancelEdit}>
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 w-full">
                              <span 
                                className={`flex-1 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded min-h-[24px] ${
                                  cellErrors.length > 0 ? 'bg-red-50 text-red-900' : ''
                                }`}
                                onClick={() => startEdit(rowIndex, column.name, row[column.name])}
                              >
                                {row[column.name] || (
                                  <span className="text-gray-400 italic">empty</span>
                                )}
                              </span>
                              <div className="flex gap-1">
                                {hasAutoFix && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-6 w-6 p-0 text-yellow-600 hover:text-yellow-700"
                                    title="Auto-fix available"
                                  >
                                    <Zap className="h-3 w-3" />
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => startEdit(rowIndex, column.name, row[column.name])}
                                  className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
                                >
                                  <Edit3 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {/* Error badges */}
                        {cellErrors.length > 0 && (
                          <div className="space-y-1">
                            {cellErrors.map((error, errorIndex) => (
                              <Badge 
                                key={errorIndex}
                                variant={getErrorBadgeColor(error.severity)} 
                                className="text-xs block"
                              >
                                {error.message}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>

      {/* Schema-based help */}
      {schema && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <h4 className="font-medium text-blue-900 mb-2">
              {tableName} Schema Information
            </h4>
            <div className="text-sm text-blue-700 space-y-1">
              <p>• <strong>Entity Type:</strong> {schema.aiClassification.entityType}</p>
              <p>• <strong>Primary Key:</strong> {schema.primaryKey || 'Not detected'}</p>
              <p>• <strong>Required Fields:</strong> {columns.filter(c => c.required).map(c => c.name).join(', ') || 'None'}</p>
              <p>• <strong>Unique Fields:</strong> {columns.filter(c => c.unique).map(c => c.name).join(', ') || 'None'}</p>
              {schema.relationships.length > 0 && (
                <p>• <strong>Relationships:</strong> {schema.relationships.map(r => `${r.column} → ${r.table}`).join(', ')}</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}