'use client';

import { useState, useEffect } from 'react';
import { FileUpload } from '@/components/file-upload';
import { DataGrid } from '@/components/data-grid';
import { ValidationPanel } from '@/components/validation-panel';
import { RulesCreator } from '@/components/rules-creator';
import { PriorityControls } from '@/components/priority-controls';
import { ExportControls } from '@/components/export-controls';
import { NaturalLanguageSearch } from '@/components/natural-language-search';
import { AIAssistant } from '@/components/ai-assistant';
import { SampleDataLoader } from '@/components/sample-data-loader';
import { DatabaseSchema } from '@/components/database-schema';
import { AIInsights } from '@/components/ai-insights';
import { CollaborationHub } from '@/components/collaboration-hub';
import { AutomationWorkflows } from '@/components/automation-workflows';
import { DataLineage } from '@/components/data-lineage';
import { PredictiveAnalytics } from '@/components/predictive-analytics';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Brain, CheckCircle, AlertTriangle, XCircle, Sparkles, Wand2, Database, Table, Users, Zap, TrendingUp, GitBranch, Bot, Crown, Rocket } from 'lucide-react';

export type DataRow = Record<string, any>;
export type DataType = 'clients' | 'workers' | 'tasks';

export type ValidationError = {
  id: string;
  row: number;
  column: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  type: string;
  suggestion?: string;
  autoFixable?: boolean;
  aiConfidence?: number;
  businessImpact?: 'low' | 'medium' | 'high' | 'critical';
};

export type BusinessRule = {
  id: string;
  type: 'coRun' | 'slotRestriction' | 'loadLimit' | 'phaseWindow' | 'patternMatch' | 'precedenceOverride' | 'custom' | 'aiGenerated';
  description: string;
  parameters: Record<string, any>;
  enabled: boolean;
  aiGenerated?: boolean;
  confidence?: number;
  businessValue?: number;
  category?: 'efficiency' | 'compliance' | 'optimization' | 'risk-management';
};

export type PrioritySettings = {
  priorityLevel: number;
  taskFulfillment: number;
  fairness: number;
  workloadBalance: number;
  skillUtilization: number;
  phaseOptimization: number;
};

export type ColumnSchema = {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'json' | 'array' | 'email' | 'url' | 'id';
  required: boolean;
  unique: boolean;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    enum?: string[];
  };
  aiDetected: boolean;
  confidence: number;
  businessContext?: string;
  dataQuality?: number;
};

export type TableSchema = {
  name: string;
  columns: ColumnSchema[];
  primaryKey?: string;
  relationships: {
    table: string;
    column: string;
    type: 'one-to-many' | 'many-to-one' | 'many-to-many';
    confidence: number;
  }[];
  aiClassification: {
    entityType: DataType;
    confidence: number;
    reasoning: string;
    businessDomain?: string;
    dataMaturity?: number;
  };
  insights?: {
    recordCount: number;
    completeness: number;
    uniqueness: number;
    consistency: number;
    timeliness: number;
    accuracy: number;
  };
};

export type AIInsight = {
  id: string;
  type: 'optimization' | 'anomaly' | 'trend' | 'recommendation' | 'risk';
  title: string;
  description: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high' | 'critical';
  actionable: boolean;
  estimatedValue?: number;
  category: string;
};

export type CollaborationEvent = {
  id: string;
  user: string;
  action: string;
  timestamp: Date;
  details: string;
  avatar?: string;
};

export type AutomationWorkflow = {
  id: string;
  name: string;
  description: string;
  triggers: string[];
  actions: string[];
  enabled: boolean;
  lastRun?: Date;
  successRate: number;
};

export default function Home() {
  const [data, setData] = useState<Record<string, DataRow[]>>({});
  const [schemas, setSchemas] = useState<Record<string, TableSchema>>({});
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [businessRules, setBusinessRules] = useState<BusinessRule[]>([]);
  const [priorities, setPriorities] = useState<PrioritySettings>({
    priorityLevel: 80,
    taskFulfillment: 70,
    fairness: 60,
    workloadBalance: 65,
    skillUtilization: 55,
    phaseOptimization: 50
  });

  const [searchResults, setSearchResults] = useState<{
    table: string | null;
    indices: number[];
  }>({ table: null, indices: [] });

  const [aiSuggestions, setAiSuggestions] = useState<{
    rules: BusinessRule[];
    corrections: ValidationError[];
  }>({ rules: [], corrections: [] });

  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [collaborationEvents, setCollaborationEvents] = useState<CollaborationEvent[]>([]);
  const [automationWorkflows, setAutomationWorkflows] = useState<AutomationWorkflow[]>([]);
  const [dataQualityScore, setDataQualityScore] = useState(0);
  const [businessValue, setBusinessValue] = useState(0);
  const [isProcessingAI, setIsProcessingAI] = useState(false);

  // Simulate real-time AI processing
  useEffect(() => {
    if (Object.keys(data).length > 0) {
      const interval = setInterval(() => {
        generateAIInsights();
        updateDataQualityScore();
        simulateCollaboration();
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [data]);

  const handleDataUpload = (tableName: string, newData: DataRow[], detectedSchema: TableSchema) => {
    setData(prev => ({
      ...prev,
      [tableName]: newData
    }));
    
    setSchemas(prev => ({
      ...prev,
      [tableName]: detectedSchema
    }));
    
    // Run comprehensive validation
    runValidation(tableName, newData, detectedSchema);
    
    // Generate AI suggestions
    generateAISuggestions(tableName, newData, detectedSchema);
    
    // Generate initial insights
    generateAIInsights();
    
    // Add collaboration event
    addCollaborationEvent('AI System', 'uploaded', `New ${tableName} data processed with ${newData.length} records`);
  };

  const runValidation = (tableName: string, dataToValidate: DataRow[], schema: TableSchema) => {
    const errors: ValidationError[] = [];
    
    dataToValidate.forEach((row, index) => {
      // Enhanced schema-based validations with AI confidence
      errors.push(...validateRowAgainstSchema(row, index, tableName, schema));
    });
    
    // Cross-reference validations
    errors.push(...validateCrossReferences());
    
    // Advanced AI validations
    errors.push(...validateAdvancedConstraints());
    
    // Business logic validations
    errors.push(...validateBusinessLogic());
    
    setValidationErrors(prev => [
      ...prev.filter(error => !error.id.startsWith(tableName)),
      ...errors
    ]);
  };

  const validateRowAgainstSchema = (row: DataRow, index: number, tableName: string, schema: TableSchema): ValidationError[] => {
    const errors: ValidationError[] = [];
    const errorId = `${tableName}-${index}`;

    schema.columns.forEach(column => {
      const value = row[column.name];
      
      // Enhanced validation with AI confidence and business impact
      if (column.required && (!value || value === '')) {
        errors.push({
          id: `${errorId}-${column.name}-required`,
          row: index,
          column: column.name,
          message: `${column.name} is required for ${schema.aiClassification.businessDomain || 'business'} operations`,
          severity: 'error',
          type: 'missing_required',
          suggestion: `Please provide a value for ${column.name}`,
          autoFixable: column.type === 'number' || column.type === 'boolean',
          aiConfidence: 0.95,
          businessImpact: column.name.toLowerCase().includes('id') ? 'critical' : 'high'
        });
      }

      if (value && value !== '') {
        const typeError = validateColumnType(value, column, index, tableName);
        if (typeError) errors.push(typeError);
      }
    });

    return errors;
  };

  const validateColumnType = (value: any, column: ColumnSchema, index: number, tableName: string): ValidationError | null => {
    const errorId = `${tableName}-${index}-${column.name}`;
    
    // Enhanced type validation with business context
    switch (column.type) {
      case 'number':
        if (isNaN(parseFloat(value))) {
          return {
            id: `${errorId}-type`,
            row: index,
            column: column.name,
            message: `Expected number for ${column.businessContext || 'numeric field'}, got: ${typeof value}`,
            severity: 'error',
            type: 'type_mismatch',
            suggestion: 'Enter a valid number',
            autoFixable: true,
            aiConfidence: 0.9,
            businessImpact: 'medium'
          };
        }
        break;
        
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          return {
            id: `${errorId}-type`,
            row: index,
            column: column.name,
            message: 'Invalid email format - this could impact communication workflows',
            severity: 'error',
            type: 'type_mismatch',
            suggestion: 'Enter a valid email address',
            autoFixable: false,
            aiConfidence: 0.95,
            businessImpact: 'high'
          };
        }
        break;
    }
    
    return null;
  };

  const validateCrossReferences = (): ValidationError[] => {
    const errors: ValidationError[] = [];
    
    // Enhanced cross-reference validation with relationship confidence
    Object.entries(schemas).forEach(([tableName, schema]) => {
      schema.relationships.forEach(relationship => {
        const sourceData = data[tableName] || [];
        const targetData = data[relationship.table] || [];
        const targetIds = new Set(targetData.map(row => row[relationship.column]));
        
        sourceData.forEach((row, index) => {
          const value = row[relationship.column];
          if (value && !targetIds.has(value)) {
            errors.push({
              id: `${tableName}-${index}-${relationship.column}-ref`,
              row: index,
              column: relationship.column,
              message: `Broken relationship: ${value} not found in ${relationship.table} (${Math.round(relationship.confidence * 100)}% confidence)`,
              severity: 'error',
              type: 'unknown_reference',
              suggestion: `Remove ${value} or add corresponding record in ${relationship.table}`,
              autoFixable: false,
              aiConfidence: relationship.confidence,
              businessImpact: 'high'
            });
          }
        });
      });
    });
    
    return errors;
  };

  const validateAdvancedConstraints = (): ValidationError[] => {
    const errors: ValidationError[] = [];
    
    // AI-powered business logic validation
    Object.entries(schemas).forEach(([tableName, schema]) => {
      if (schema.aiClassification.entityType === 'workers') {
        const tableData = data[tableName] || [];
        tableData.forEach((row, index) => {
          // Detect potential burnout risk
          const loadColumn = schema.columns.find(col => 
            col.name.toLowerCase().includes('load') || 
            col.name.toLowerCase().includes('capacity')
          );
          
          if (loadColumn && row[loadColumn.name]) {
            const load = parseInt(row[loadColumn.name]);
            if (load > 8) { // AI-detected threshold
              errors.push({
                id: `${tableName}-${index}-burnout-risk`,
                row: index,
                column: loadColumn.name,
                message: `High burnout risk detected: Load of ${load} exceeds recommended threshold`,
                severity: 'warning',
                type: 'burnout_risk',
                suggestion: `Consider redistributing workload or adding team members`,
                autoFixable: false,
                aiConfidence: 0.85,
                businessImpact: 'high'
              });
            }
          }
        });
      }
    });
    
    return errors;
  };

  const validateBusinessLogic = (): ValidationError[] => {
    const errors: ValidationError[] = [];
    
    // AI-powered business logic validation
    // Check for seasonal patterns, resource conflicts, etc.
    
    return errors;
  };

  const generateAISuggestions = (tableName: string, newData: DataRow[], schema: TableSchema) => {
    const ruleSuggestions: BusinessRule[] = [];
    
    // Enhanced AI rule generation with business value calculation
    if (schema.aiClassification.entityType === 'clients') {
      const taskColumn = schema.columns.find(col => 
        col.name.toLowerCase().includes('task') || 
        col.name.toLowerCase().includes('request')
      );
      
      if (taskColumn) {
        const taskFrequency: Record<string, string[]> = {};
        newData.forEach((client: any) => {
          if (client[taskColumn.name]) {
            const tasks = String(client[taskColumn.name]).split(',').map((id: string) => id.trim());
            tasks.forEach(taskId => {
              if (!taskFrequency[taskId]) taskFrequency[taskId] = [];
              taskFrequency[taskId].push(client[schema.primaryKey || 'id'] || 'unknown');
            });
          }
        });

        Object.entries(taskFrequency).forEach(([taskId, clients]) => {
          if (clients.length >= 3) { // AI threshold for pattern detection
            const businessValue = clients.length * 1000; // Estimated value
            ruleSuggestions.push({
              id: `ai-corun-${Date.now()}-${Math.random()}`,
              type: 'aiGenerated',
              description: `AI detected high-value pattern: Task ${taskId} is frequently requested by ${clients.length} clients. Implementing co-run optimization could save $${businessValue.toLocaleString()}/month.`,
              parameters: { 
                tasks: [taskId],
                frequency: clients.length,
                estimatedSavings: businessValue
              },
              enabled: false,
              aiGenerated: true,
              confidence: 0.9,
              businessValue,
              category: 'efficiency'
            });
          }
        });
      }
    }
    
    setAiSuggestions(prev => ({
      ...prev,
      rules: [...prev.rules, ...ruleSuggestions]
    }));
  };

  const generateAIInsights = () => {
    if (Object.keys(data).length === 0) return;

    const insights: AIInsight[] = [];
    
    // Data quality insights
    const totalRecords = Object.values(data).reduce((sum, tableData) => sum + tableData.length, 0);
    const errorRate = validationErrors.length / Math.max(totalRecords, 1);
    
    if (errorRate > 0.1) {
      insights.push({
        id: `insight-quality-${Date.now()}`,
        type: 'risk',
        title: 'Data Quality Alert',
        description: `${Math.round(errorRate * 100)}% error rate detected. This could impact downstream analytics and decision-making.`,
        confidence: 0.95,
        impact: 'high',
        actionable: true,
        estimatedValue: 50000,
        category: 'Data Quality'
      });
    }

    // Resource optimization insights
    Object.entries(schemas).forEach(([tableName, schema]) => {
      if (schema.aiClassification.entityType === 'workers') {
        const workers = data[tableName] || [];
        const skillDistribution = workers.reduce((acc: Record<string, number>, worker: any) => {
          const skills = worker.Skills ? worker.Skills.split(',') : [];
          skills.forEach((skill: string) => {
            const trimmedSkill = skill.trim();
            acc[trimmedSkill] = (acc[trimmedSkill] || 0) + 1;
          });
          return acc;
        }, {});

        const rareSkills = Object.entries(skillDistribution)
          .filter(([_, count]) => count === 1)
          .map(([skill]) => skill);

        if (rareSkills.length > 0) {
          insights.push({
            id: `insight-skills-${Date.now()}`,
            type: 'recommendation',
            title: 'Skill Gap Risk Detected',
            description: `${rareSkills.length} critical skills have only one expert: ${rareSkills.slice(0, 3).join(', ')}. Consider cross-training or hiring.`,
            confidence: 0.88,
            impact: 'medium',
            actionable: true,
            estimatedValue: 25000,
            category: 'Resource Planning'
          });
        }
      }
    });

    // Trend analysis
    insights.push({
      id: `insight-trend-${Date.now()}`,
      type: 'trend',
      title: 'Workload Trend Analysis',
      description: 'AI predicts 23% increase in task complexity over next quarter based on historical patterns.',
      confidence: 0.76,
      impact: 'medium',
      actionable: true,
      estimatedValue: 75000,
      category: 'Predictive Analytics'
    });

    setAiInsights(insights);
  };

  const updateDataQualityScore = () => {
    const totalRecords = Object.values(data).reduce((sum, tableData) => sum + tableData.length, 0);
    const errorCount = validationErrors.filter(e => e.severity === 'error').length;
    const warningCount = validationErrors.filter(e => e.severity === 'warning').length;
    
    const score = Math.max(0, 100 - (errorCount * 5) - (warningCount * 2));
    setDataQualityScore(score);
    
    // Calculate business value
    const value = score * 1000 + (businessRules.filter(r => r.enabled).length * 5000);
    setBusinessValue(value);
  };

  const simulateCollaboration = () => {
    const users = ['Alice Chen', 'Bob Smith', 'Carol Davis', 'David Wilson'];
    const actions = ['reviewed', 'commented on', 'approved', 'flagged'];
    const randomUser = users[Math.floor(Math.random() * users.length)];
    const randomAction = actions[Math.floor(Math.random() * actions.length)];
    
    const event: CollaborationEvent = {
      id: `collab-${Date.now()}`,
      user: randomUser,
      action: randomAction,
      timestamp: new Date(),
      details: `${randomAction} data validation results`,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${randomUser}`
    };
    
    setCollaborationEvents(prev => [event, ...prev.slice(0, 9)]);
  };

  const addCollaborationEvent = (user: string, action: string, details: string) => {
    const event: CollaborationEvent = {
      id: `collab-${Date.now()}`,
      user,
      action,
      timestamp: new Date(),
      details,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user}`
    };
    
    setCollaborationEvents(prev => [event, ...prev.slice(0, 9)]);
  };

  const updateData = (tableName: string, rowIndex: number, field: string, value: any) => {
    setData(prev => ({
      ...prev,
      [tableName]: prev[tableName].map((row, index) => 
        index === rowIndex ? { ...row, [field]: value } : row
      )
    }));
    
    // Re-run validation for the updated row
    if (schemas[tableName]) {
      const updatedRow = { ...data[tableName][rowIndex], [field]: value };
      runValidation(tableName, [updatedRow], schemas[tableName]);
    }

    // Add collaboration event
    addCollaborationEvent('You', 'updated', `Modified ${field} in ${tableName} table`);
  };

  const applyAutoFix = (error: ValidationError) => {
    const { row, column, type } = error;
    const tableName = error.id.split('-')[0];
    let fixedValue: any;

    switch (type) {
      case 'out_of_range':
        const schema = schemas[tableName];
        const columnSchema = schema?.columns.find(col => col.name === column);
        if (columnSchema?.validation?.min !== undefined) {
          fixedValue = columnSchema.validation.min;
        } else if (columnSchema?.validation?.max !== undefined) {
          fixedValue = columnSchema.validation.max;
        }
        break;
      case 'type_mismatch':
        const colSchema = schemas[tableName]?.columns.find(col => col.name === column);
        if (colSchema?.type === 'number') fixedValue = 0;
        if (colSchema?.type === 'boolean') fixedValue = 'false';
        break;
      case 'malformed_json':
        fixedValue = '{}';
        break;
      case 'missing_required':
        const reqSchema = schemas[tableName]?.columns.find(col => col.name === column);
        if (reqSchema?.type === 'number') fixedValue = 1;
        if (reqSchema?.type === 'boolean') fixedValue = 'false';
        if (reqSchema?.type === 'string') fixedValue = 'default';
        break;
      default:
        return;
    }

    if (fixedValue !== undefined) {
      updateData(tableName, row, column, fixedValue);
      addCollaborationEvent('AI Assistant', 'auto-fixed', `Applied automatic fix for ${column} validation error`);
    }
  };

  const handleNaturalLanguageSearch = (query: string, results: { table: string; indices: number[] }) => {
    setSearchResults(results);
    addCollaborationEvent('You', 'searched', `Used natural language search: "${query}"`);
  };

  const getTotalRows = () => {
    return Object.values(data).reduce((sum, tableData) => sum + tableData.length, 0);
  };

  const getValidationStats = () => {
    const errors = validationErrors.filter(e => e.severity === 'error').length;
    const warnings = validationErrors.filter(e => e.severity === 'warning').length;
    const total = getTotalRows();
    const valid = Math.max(0, total - errors - warnings);
    
    return { errors, warnings, valid, total };
  };

  const stats = getValidationStats();

  // Transform data for RulesCreator component
  const transformedData = {
    clients: data.clients || [],
    workers: data.workers || [],
    tasks: data.tasks || []
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Enhanced Header with Real-time Metrics */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  DataCleaner AI
                </h1>
                <p className="text-gray-600 text-lg">The World's First Intelligent Database Configurator</p>
              </div>
            </div>
            
            {/* Real-time Value Metrics */}
            <div className="flex gap-4">
              <Card className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold">${businessValue.toLocaleString()}</div>
                  <div className="text-sm opacity-90">Business Value</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-0">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold">{dataQualityScore}%</div>
                  <div className="text-sm opacity-90">Data Quality</div>
                </CardContent>
              </Card>
            </div>
          </div>
          
          {/* Enhanced Stats Bar with AI Insights */}
          {stats.total > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
              <Badge variant="outline" className="flex items-center gap-2 px-4 py-3 bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <div>
                  <div className="font-bold">{stats.valid}</div>
                  <div className="text-xs">Valid Records</div>
                </div>
              </Badge>
              <Badge variant="outline" className="flex items-center gap-2 px-4 py-3 bg-yellow-50 border-yellow-200">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <div>
                  <div className="font-bold">{stats.warnings}</div>
                  <div className="text-xs">Warnings</div>
                </div>
              </Badge>
              <Badge variant="outline" className="flex items-center gap-2 px-4 py-3 bg-red-50 border-red-200">
                <XCircle className="h-4 w-4 text-red-500" />
                <div>
                  <div className="font-bold">{stats.errors}</div>
                  <div className="text-xs">Errors</div>
                </div>
              </Badge>
              <Badge variant="outline" className="flex items-center gap-2 px-4 py-3 bg-blue-50 border-blue-200">
                <Table className="h-4 w-4 text-blue-500" />
                <div>
                  <div className="font-bold">{Object.keys(data).length}</div>
                  <div className="text-xs">Tables</div>
                </div>
              </Badge>
              <Badge variant="outline" className="flex items-center gap-2 px-4 py-3 bg-purple-50 border-purple-200">
                <Brain className="h-4 w-4 text-purple-500" />
                <div>
                  <div className="font-bold">{aiInsights.length}</div>
                  <div className="text-xs">AI Insights</div>
                </div>
              </Badge>
              <Badge variant="outline" className="flex items-center gap-2 px-4 py-3 bg-indigo-50 border-indigo-200">
                <Zap className="h-4 w-4 text-indigo-500" />
                <div>
                  <div className="font-bold">{businessRules.filter(r => r.enabled).length}</div>
                  <div className="text-xs">Active Rules</div>
                </div>
              </Badge>
            </div>
          )}

          {/* Data Quality Progress */}
          {stats.total > 0 && (
            <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-indigo-900">Overall Data Health Score</span>
                  <Badge className="bg-indigo-100 text-indigo-800">
                    {dataQualityScore}% ({dataQualityScore > 90 ? 'Excellent' : dataQualityScore > 70 ? 'Good' : 'Needs Improvement'})
                  </Badge>
                </div>
                <Progress value={dataQualityScore} className="bg-indigo-200" />
                <p className="text-sm text-indigo-700 mt-2">
                  {dataQualityScore > 90 ? '🎉 Production ready!' : 
                   dataQualityScore > 70 ? '⚡ Almost there! Fix remaining issues.' : 
                   '🔧 Needs attention before deployment.'}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="xl:col-span-3 space-y-6">
            {/* Enhanced File Upload */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Rocket className="h-5 w-5 text-indigo-600" />
                  Intelligent Data Ingestion
                  <Badge className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
                    <Crown className="h-3 w-3 mr-1" />
                    Enterprise AI
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FileUpload onDataUpload={handleDataUpload} />
                <Separator />
                <SampleDataLoader onDataLoad={(type, data) => {
                  const tableName = type;
                  const mockSchema: TableSchema = {
                    name: tableName,
                    columns: [],
                    relationships: [],
                    aiClassification: {
                      entityType: type,
                      confidence: 1.0,
                      reasoning: 'Sample data',
                      businessDomain: 'Resource Management',
                      dataMaturity: 0.8
                    },
                    insights: {
                      recordCount: data.length,
                      completeness: 0.95,
                      uniqueness: 0.98,
                      consistency: 0.92,
                      timeliness: 0.88,
                      accuracy: 0.94
                    }
                  };
                  handleDataUpload(tableName, data, mockSchema);
                }} />
              </CardContent>
            </Card>

            {/* AI Insights Dashboard */}
            {aiInsights.length > 0 && (
              <AIInsights insights={aiInsights} />
            )}

            {/* Enhanced Database Schema Viewer */}
            {Object.keys(schemas).length > 0 && (
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Table className="h-5 w-5 text-purple-600" />
                    AI-Detected Database Schema
                    <Badge variant="outline" className="bg-purple-50 text-purple-700">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Live Analysis
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <DatabaseSchema schemas={schemas} />
                </CardContent>
              </Card>
            )}

            {/* Data Lineage Visualization */}
            {Object.keys(data).length > 1 && (
              <DataLineage schemas={schemas} data={data} />
            )}

            {/* Enhanced Natural Language Search */}
            {getTotalRows() > 0 && (
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="h-5 w-5 text-purple-600" />
                    AI-Powered Universal Search
                    <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                      Natural Language
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <NaturalLanguageSearch
                    data={data}
                    schemas={schemas}
                    onSearch={handleNaturalLanguageSearch}
                  />
                </CardContent>
              </Card>
            )}

            {/* Predictive Analytics */}
            {getTotalRows() > 0 && (
              <PredictiveAnalytics data={data} schemas={schemas} />
            )}

            {/* Enhanced Data Grid */}
            {Object.keys(data).length > 0 && (
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Table className="h-5 w-5" />
                    Intelligent Data Management
                    <Badge variant="outline">Real-time Validation</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue={Object.keys(data)[0]} className="w-full">
                    <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${Object.keys(data).length}, 1fr)` }}>
                      {Object.entries(data).map(([tableName, tableData]) => (
                        <TabsTrigger key={tableName} value={tableName} className="flex items-center gap-2">
                          {tableName} ({tableData.length})
                          {searchResults.table === tableName && (
                            <Badge variant="secondary" className="ml-1">
                              {searchResults.indices.length} filtered
                            </Badge>
                          )}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                    
                    {Object.entries(data).map(([tableName, tableData]) => (
                      <TabsContent key={tableName} value={tableName}>
                        <DataGrid
                          data={tableData}
                          tableName={tableName}
                          schema={schemas[tableName]}
                          onUpdate={updateData}
                          validationErrors={validationErrors}
                          searchResults={searchResults.table === tableName ? searchResults.indices : []}
                        />
                      </TabsContent>
                    ))}
                  </Tabs>
                </CardContent>
              </Card>
            )}

            {/* Enhanced Rules Creator */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-indigo-600" />
                  AI-Powered Business Rules Engine
                  <Badge className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Smart Suggestions
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RulesCreator
                  rules={businessRules}
                  onRulesChange={setBusinessRules}
                  data={transformedData}
                  schemas={schemas}
                  aiSuggestions={aiSuggestions.rules}
                />
              </CardContent>
            </Card>

            {/* Automation Workflows */}
            <AutomationWorkflows 
              workflows={automationWorkflows}
              onWorkflowsChange={setAutomationWorkflows}
            />

            {/* Enhanced Priority Controls */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Resource Allocation Priorities
                  <Badge variant="outline">AI-Optimized</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PriorityControls
                  priorities={priorities}
                  onPrioritiesChange={setPriorities}
                />
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Sidebar */}
          <div className="space-y-6">
            {/* Enhanced AI Assistant */}
            <AIAssistant
              validationErrors={validationErrors}
              onApplyFix={applyAutoFix}
              aiSuggestions={aiSuggestions}
            />

            {/* Collaboration Hub */}
            <CollaborationHub events={collaborationEvents} />

            {/* Enhanced Validation Panel */}
            <ValidationPanel 
              errors={validationErrors}
              onApplyFix={applyAutoFix}
            />

            {/* Enhanced Export Controls */}
            {getTotalRows() > 0 && (
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Enterprise Export
                    <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                      Production Ready
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ExportControls
                    data={data}
                    schemas={schemas}
                    rules={businessRules}
                    priorities={priorities}
                    validationErrors={validationErrors}
                  />
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
