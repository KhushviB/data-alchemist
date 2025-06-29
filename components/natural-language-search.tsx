'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Sparkles, Loader2, Database } from 'lucide-react';
import { toast } from 'sonner';
import { DataRow, TableSchema } from '@/app/page';

interface NaturalLanguageSearchProps {
  data: Record<string, DataRow[]>;
  schemas: Record<string, TableSchema>;
  onSearch: (query: string, results: { table: string; indices: number[] }) => void;
}

export function NaturalLanguageSearch({ data, schemas, onSearch }: NaturalLanguageSearchProps) {
  const [query, setQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResults, setLastResults] = useState<{
    query: string;
    table: string;
    count: number;
  } | null>(null);

  const processNaturalLanguageQuery = async (searchQuery: string) => {
    setIsProcessing(true);
    
    try {
      // Simulate AI processing
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const results = parseAndExecuteQuery(searchQuery);
      
      if (results) {
        onSearch(searchQuery, results);
        setLastResults({
          query: searchQuery,
          table: results.table,
          count: results.indices.length
        });
        toast.success(`Found ${results.indices.length} matching records in ${results.table}`);
      } else {
        toast.error('No results found for your query');
      }
    } catch (error) {
      toast.error('Error processing search query');
    } finally {
      setIsProcessing(false);
    }
  };

  const parseAndExecuteQuery = (query: string): { table: string; indices: number[] } | null => {
    const lowerQuery = query.toLowerCase();
    
    // Determine target table
    let targetTable: string | null = null;
    
    // Check for explicit table mentions
    Object.keys(data).forEach(tableName => {
      if (lowerQuery.includes(tableName.toLowerCase())) {
        targetTable = tableName;
      }
    });
    
    // If no explicit table, try to infer from entity types
    if (!targetTable) {
      Object.entries(schemas).forEach(([tableName, schema]) => {
        const entityType = schema.aiClassification.entityType;
        if (lowerQuery.includes(entityType) || 
            lowerQuery.includes(entityType.slice(0, -1))) { // singular form
          targetTable = tableName;
        }
      });
    }
    
    // If still no table, search all tables and return the first match
    if (!targetTable) {
      for (const tableName of Object.keys(data)) {
        const results = searchInTable(tableName, lowerQuery);
        if (results.length > 0) {
          return { table: tableName, indices: results };
        }
      }
      return null;
    }

    const matchingIndices = searchInTable(targetTable, lowerQuery);
    return { table: targetTable, indices: matchingIndices };
  };

  const searchInTable = (tableName: string, query: string): number[] => {
    const tableData = data[tableName] || [];
    const schema = schemas[tableName];
    const matchingIndices: number[] = [];

    tableData.forEach((item, index) => {
      if (matchesQuery(item, query, schema)) {
        matchingIndices.push(index);
      }
    });

    return matchingIndices;
  };

  const matchesQuery = (item: any, query: string, schema?: TableSchema): boolean => {
    // Numeric comparisons
    if (query.includes('greater than') || query.includes('more than') || query.includes('>')) {
      const match = query.match(/(?:greater than|more than|>)\s*(\d+)/);
      if (match) {
        const threshold = parseInt(match[1]);
        return Object.values(item).some(value => 
          typeof value === 'number' && value > threshold
        );
      }
    }

    if (query.includes('less than') || query.includes('<')) {
      const match = query.match(/(?:less than|<)\s*(\d+)/);
      if (match) {
        const threshold = parseInt(match[1]);
        return Object.values(item).some(value => 
          typeof value === 'number' && value < threshold
        );
      }
    }

    if (query.includes('equals') || query.includes('=')) {
      const match = query.match(/(?:equals|=)\s*(\d+)/);
      if (match) {
        const value = parseInt(match[1]);
        return Object.values(item).some(itemValue => 
          typeof itemValue === 'number' && itemValue === value
        );
      }
    }

    // Priority level queries
    if (query.includes('high priority')) {
      const priorityColumns = schema?.columns.filter(col => 
        col.name.toLowerCase().includes('priority')
      ) || [];
      return priorityColumns.some(col => {
        const value = item[col.name];
        return typeof value === 'number' && value >= 4;
      });
    }

    if (query.includes('low priority')) {
      const priorityColumns = schema?.columns.filter(col => 
        col.name.toLowerCase().includes('priority')
      ) || [];
      return priorityColumns.some(col => {
        const value = item[col.name];
        return typeof value === 'number' && value <= 2;
      });
    }

    // Skill-based searches
    if (query.includes('skill')) {
      const skillMatch = query.match(/skill[s]?\s+([a-zA-Z]+)/);
      if (skillMatch) {
        const searchSkill = skillMatch[1].toLowerCase();
        const skillColumns = schema?.columns.filter(col => 
          col.name.toLowerCase().includes('skill')
        ) || [];
        return skillColumns.some(col => {
          const skills = item[col.name];
          return skills && String(skills).toLowerCase().includes(searchSkill);
        });
      }
    }

    // Duration queries
    if (query.includes('duration')) {
      const durationMatch = query.match(/duration.*?(\d+)/);
      if (durationMatch) {
        const threshold = parseInt(durationMatch[1]);
        const durationColumns = schema?.columns.filter(col => 
          col.name.toLowerCase().includes('duration')
        ) || [];
        
        if (query.includes('more than') || query.includes('greater than')) {
          return durationColumns.some(col => {
            const value = item[col.name];
            return typeof value === 'number' && value > threshold;
          });
        } else if (query.includes('less than')) {
          return durationColumns.some(col => {
            const value = item[col.name];
            return typeof value === 'number' && value < threshold;
          });
        }
      }
    }

    // Group/category queries
    if (query.includes('group') || query.includes('category')) {
      const groupMatch = query.match(/(?:group|category)\s+([a-zA-Z]+)/);
      if (groupMatch) {
        const searchGroup = groupMatch[1].toLowerCase();
        const groupColumns = schema?.columns.filter(col => 
          col.name.toLowerCase().includes('group') || 
          col.name.toLowerCase().includes('category')
        ) || [];
        return groupColumns.some(col => {
          const group = item[col.name];
          return group && String(group).toLowerCase().includes(searchGroup);
        });
      }
    }

    // Email queries
    if (query.includes('email')) {
      const emailColumns = schema?.columns.filter(col => 
        col.type === 'email' || col.name.toLowerCase().includes('email')
      ) || [];
      return emailColumns.some(col => {
        const email = item[col.name];
        return email && String(email).includes('@');
      });
    }

    // Boolean queries
    if (query.includes('true') || query.includes('false') || query.includes('enabled') || query.includes('disabled')) {
      const boolColumns = schema?.columns.filter(col => col.type === 'boolean') || [];
      const searchValue = query.includes('true') || query.includes('enabled');
      return boolColumns.some(col => {
        const value = item[col.name];
        return Boolean(value) === searchValue;
      });
    }

    // General text search
    const words = query.split(' ').filter(word => 
      !['with', 'having', 'that', 'are', 'is', 'the', 'and', 'or', 'all', 'in', 'of'].includes(word)
    );
    
    return words.some(word => 
      Object.values(item).some(value => 
        value && String(value).toLowerCase().includes(word)
      )
    );
  };

  const clearSearch = () => {
    setQuery('');
    setLastResults(null);
    onSearch('', { table: '', indices: [] });
  };

  const generateExampleQueries = () => {
    const examples: string[] = [];
    
    // Generate examples based on available schemas
    Object.entries(schemas).forEach(([tableName, schema]) => {
      const entityType = schema.aiClassification.entityType;
      
      if (entityType === 'clients') {
        examples.push(`High priority ${tableName}`);
        examples.push(`${tableName} with budget greater than 100000`);
      } else if (entityType === 'workers') {
        examples.push(`${tableName} with JavaScript skills`);
        examples.push(`${tableName} in Development group`);
      } else if (entityType === 'tasks') {
        examples.push(`${tableName} with duration more than 2`);
        examples.push(`${tableName} in Security category`);
      }
    });
    
    // Add generic examples if no specific schemas
    if (examples.length === 0) {
      examples.push(
        "Records with high priority",
        "Items with JavaScript skills",
        "Entries with duration more than 2",
        "Data in Sales group",
        "Records with email addresses"
      );
    }
    
    return examples.slice(0, 5);
  };

  const exampleQueries = generateExampleQueries();

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search across all tables using natural language... e.g., 'high priority clients' or 'workers with Python skills'"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && query.trim()) {
                processNaturalLanguageQuery(query);
              }
            }}
          />
        </div>
        <Button 
          onClick={() => processNaturalLanguageQuery(query)}
          disabled={!query.trim() || isProcessing}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
        >
          {isProcessing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
        </Button>
        {lastResults && (
          <Button variant="outline" onClick={clearSearch}>
            Clear
          </Button>
        )}
      </div>

      {/* Results Summary */}
      {lastResults && (
        <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-purple-900">Search Results</p>
                <p className="text-sm text-purple-700">
                  "{lastResults.query}" → {lastResults.count} records in {lastResults.table}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-purple-600" />
                <Badge className="bg-purple-100 text-purple-800">
                  {lastResults.count} matches
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Tables */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-700">Available Tables:</p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(schemas).map(([tableName, schema]) => (
            <Badge
              key={tableName}
              variant="outline"
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => setQuery(`all ${tableName}`)}
            >
              {tableName} ({schema.aiClassification.entityType})
            </Badge>
          ))}
        </div>
      </div>

      {/* Example Queries */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-700">Try these examples:</p>
        <div className="flex flex-wrap gap-2">
          {exampleQueries.map((example, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => {
                setQuery(example);
                processNaturalLanguageQuery(example);
              }}
              className="text-xs"
            >
              {example}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}