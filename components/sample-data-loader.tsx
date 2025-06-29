'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Database, Download, FileSpreadsheet, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { DataType, DataRow } from '@/app/page';

interface SampleDataLoaderProps {
  onDataLoad: (type: DataType, data: DataRow[]) => void;
}

export function SampleDataLoader({ onDataLoad }: SampleDataLoaderProps) {
  const [isLoading, setIsLoading] = useState(false);

  const loadSampleData = async () => {
    setIsLoading(true);
    
    try {
      // Load all three sample files
      const [clientsResponse, workersResponse, tasksResponse] = await Promise.all([
        fetch('/samples/clients.csv'),
        fetch('/samples/workers.csv'),
        fetch('/samples/tasks.csv')
      ]);

      if (!clientsResponse.ok || !workersResponse.ok || !tasksResponse.ok) {
        throw new Error('Failed to load sample data files');
      }

      const [clientsText, workersText, tasksText] = await Promise.all([
        clientsResponse.text(),
        workersResponse.text(),
        tasksResponse.text()
      ]);

      // Parse CSV data
      const parseCSV = (text: string): DataRow[] => {
        const lines = text.trim().split('\n');
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        
        return lines.slice(1).map(line => {
          const values = [];
          let current = '';
          let inQuotes = false;
          
          for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
              inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
              values.push(current.trim().replace(/"/g, ''));
              current = '';
            } else {
              current += char;
            }
          }
          values.push(current.trim().replace(/"/g, ''));
          
          const row: DataRow = {};
          headers.forEach((header, index) => {
            row[header] = values[index] || '';
          });
          return row;
        });
      };

      const clientsData = parseCSV(clientsText);
      const workersData = parseCSV(workersText);
      const tasksData = parseCSV(tasksText);

      // Load data into the application
      onDataLoad('clients', clientsData);
      onDataLoad('workers', workersData);
      onDataLoad('tasks', tasksData);

      toast.success('Sample data loaded successfully! Includes edge cases for comprehensive testing.');
    } catch (error) {
      toast.error('Failed to load sample data: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadSampleFiles = async () => {
    try {
      const files = ['clients.csv', 'workers.csv', 'tasks.csv'];
      
      for (const file of files) {
        const response = await fetch(`/samples/${file}`);
        if (response.ok) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `sample_${file}`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        }
      }
      
      toast.success('Sample files downloaded successfully!');
    } catch (error) {
      toast.error('Failed to download sample files');
    }
  };

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Database className="h-5 w-5 text-blue-600" />
          <span className="font-medium text-blue-900">Sample Data & Edge Cases</span>
          <Badge variant="outline" className="bg-blue-100 text-blue-800">
            <Sparkles className="h-3 w-3 mr-1" />
            AI-Ready
          </Badge>
        </div>
        
        <p className="text-sm text-blue-700 mb-4">
          Load comprehensive sample data with intentional edge cases to test all validation rules and AI features.
        </p>

        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Button 
              onClick={loadSampleData}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoading ? (
                <>
                  <Database className="h-4 w-4 mr-2 animate-pulse" />
                  Loading...
                </>
              ) : (
                <>
                  <Database className="h-4 w-4 mr-2" />
                  Load Sample Data
                </>
              )}
            </Button>
            
            <Button 
              onClick={downloadSampleFiles}
              variant="outline"
              className="border-blue-300 text-blue-700 hover:bg-blue-50"
            >
              <Download className="h-4 w-4 mr-2" />
              Download CSVs
            </Button>
          </div>

          <div className="text-xs text-blue-600 space-y-1">
            <p>📊 <strong>20 Clients</strong> - Enterprise, Startup, SMB with priority levels 1-5</p>
            <p>👥 <strong>25 Workers</strong> - Diverse skills, availability patterns, edge cases</p>
            <p>📋 <strong>45 Tasks</strong> - Various durations, skill requirements, concurrency limits</p>
            <p>🔍 <strong>Edge Cases</strong> - Duplicates, invalid JSON, circular dependencies, overloads</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}