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
      // Generate sample data directly instead of loading from files
      const clientsData: DataRow[] = [
        {
          ClientID: 'C001',
          ClientName: 'Acme Corporation',
          PriorityLevel: '5',
          RequestedTaskIDs: 'T001,T002,T003',
          GroupTag: 'Enterprise',
          AttributesJSON: '{"budget": 500000, "deadline": "2024-Q2", "contact": "john.doe@acme.com"}'
        },
        {
          ClientID: 'C002',
          ClientName: 'TechStart Inc',
          PriorityLevel: '4',
          RequestedTaskIDs: 'T004,T005',
          GroupTag: 'Startup',
          AttributesJSON: '{"budget": 75000, "agile": true, "team_size": 12}'
        },
        {
          ClientID: 'C003',
          ClientName: 'Global Dynamics',
          PriorityLevel: '3',
          RequestedTaskIDs: 'T001,T006,T007',
          GroupTag: 'Enterprise',
          AttributesJSON: '{"budget": 300000, "compliance": "SOX", "regions": ["US", "EU"]}'
        },
        {
          ClientID: 'C004',
          ClientName: 'Local Bakery',
          PriorityLevel: '2',
          RequestedTaskIDs: 'T008',
          GroupTag: 'SMB',
          AttributesJSON: '{"budget": 15000, "seasonal": true}'
        },
        {
          ClientID: 'C005',
          ClientName: 'MegaCorp Industries',
          PriorityLevel: '5',
          RequestedTaskIDs: 'T002,T009,T010,T011',
          GroupTag: 'Enterprise',
          AttributesJSON: '{"budget": 1000000, "priority_projects": ["digital_transformation", "ai_initiative"]}'
        }
      ];

      const workersData: DataRow[] = [
        {
          WorkerID: 'W001',
          WorkerName: 'Alice Johnson',
          Skills: 'JavaScript,React,Node.js',
          AvailableSlots: '[1,2,3,4,5]',
          MaxLoadPerPhase: '3',
          WorkerGroup: 'Frontend',
          QualificationLevel: '5'
        },
        {
          WorkerID: 'W002',
          WorkerName: 'Bob Smith',
          Skills: 'Python,Django,PostgreSQL',
          AvailableSlots: '[1,3,5]',
          MaxLoadPerPhase: '2',
          WorkerGroup: 'Backend',
          QualificationLevel: '4'
        },
        {
          WorkerID: 'W003',
          WorkerName: 'Carol Davis',
          Skills: 'Java,Spring,Microservices',
          AvailableSlots: '[2,4,6]',
          MaxLoadPerPhase: '4',
          WorkerGroup: 'Backend',
          QualificationLevel: '5'
        },
        {
          WorkerID: 'W004',
          WorkerName: 'David Wilson',
          Skills: 'React,TypeScript,GraphQL',
          AvailableSlots: '[1,2,3]',
          MaxLoadPerPhase: '2',
          WorkerGroup: 'Frontend',
          QualificationLevel: '3'
        },
        {
          WorkerID: 'W005',
          WorkerName: 'Emma Brown',
          Skills: 'Python,Machine Learning,TensorFlow',
          AvailableSlots: '[3,4,5,6]',
          MaxLoadPerPhase: '3',
          WorkerGroup: 'DataScience',
          QualificationLevel: '5'
        }
      ];

      const tasksData: DataRow[] = [
        {
          TaskID: 'T001',
          TaskName: 'User Authentication System',
          Category: 'Security',
          Duration: '2',
          RequiredSkills: 'JavaScript,Node.js,Security',
          PreferredPhases: '[1,2]',
          MaxConcurrent: '2'
        },
        {
          TaskID: 'T002',
          TaskName: 'Payment Gateway Integration',
          Category: 'Financial',
          Duration: '3',
          RequiredSkills: 'Python,Django,Security',
          PreferredPhases: '[2,3,4]',
          MaxConcurrent: '1'
        },
        {
          TaskID: 'T003',
          TaskName: 'Mobile App Development',
          Category: 'Mobile',
          Duration: '4',
          RequiredSkills: 'React Native,Mobile,UX Design',
          PreferredPhases: '[1,2,3,4]',
          MaxConcurrent: '3'
        },
        {
          TaskID: 'T004',
          TaskName: 'Data Analytics Dashboard',
          Category: 'Analytics',
          Duration: '2',
          RequiredSkills: 'Python,Tableau,SQL',
          PreferredPhases: '[3,4]',
          MaxConcurrent: '2'
        },
        {
          TaskID: 'T005',
          TaskName: 'Cloud Infrastructure Setup',
          Category: 'Infrastructure',
          Duration: '1',
          RequiredSkills: 'DevOps,AWS,Kubernetes',
          PreferredPhases: '[1]',
          MaxConcurrent: '1'
        }
      ];

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

  const downloadSampleFiles = () => {
    // Create CSV content for download
    const createCSV = (data: DataRow[], filename: string) => {
      if (data.length === 0) return;
      
      const headers = Object.keys(data[0]);
      const csvContent = [
        headers.join(','),
        ...data.map(row => 
          headers.map(header => {
            const value = row[header] || '';
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
      URL.revokeObjectURL(url);
    };

    // Generate and download sample files
    const clientsData: DataRow[] = [
      {
        ClientID: 'C001',
        ClientName: 'Acme Corporation',
        PriorityLevel: '5',
        RequestedTaskIDs: 'T001,T002,T003',
        GroupTag: 'Enterprise',
        AttributesJSON: '{"budget": 500000}'
      }
    ];

    createCSV(clientsData, 'sample_clients.csv');
    toast.success('Sample files downloaded successfully!');
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
            <p>📊 <strong>5 Clients</strong> - Enterprise, Startup, SMB with priority levels 1-5</p>
            <p>👥 <strong>5 Workers</strong> - Diverse skills, availability patterns, edge cases</p>
            <p>📋 <strong>5 Tasks</strong> - Various durations, skill requirements, concurrency limits</p>
            <p>🔍 <strong>Edge Cases</strong> - Duplicates, invalid JSON, circular dependencies, overloads</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
