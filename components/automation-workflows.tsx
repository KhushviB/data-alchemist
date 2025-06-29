'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Zap, Play, Pause, Settings, Plus, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { AutomationWorkflow } from '@/app/page';

interface AutomationWorkflowsProps {
  workflows: AutomationWorkflow[];
  onWorkflowsChange: (workflows: AutomationWorkflow[]) => void;
}

export function AutomationWorkflows({ workflows, onWorkflowsChange }: AutomationWorkflowsProps) {
  const [isCreating, setIsCreating] = useState(false);

  const defaultWorkflows: AutomationWorkflow[] = [
    {
      id: 'auto-validation',
      name: 'Auto Data Validation',
      description: 'Automatically validate data on upload and flag critical errors',
      triggers: ['file_upload', 'data_change'],
      actions: ['run_validation', 'send_notification', 'create_report'],
      enabled: true,
      lastRun: new Date(Date.now() - 300000), // 5 minutes ago
      successRate: 98.5
    },
    {
      id: 'smart-cleanup',
      name: 'Smart Data Cleanup',
      description: 'AI-powered automatic fixing of common data issues',
      triggers: ['validation_complete', 'error_detected'],
      actions: ['auto_fix_errors', 'suggest_improvements', 'update_quality_score'],
      enabled: true,
      lastRun: new Date(Date.now() - 120000), // 2 minutes ago
      successRate: 94.2
    },
    {
      id: 'rule-suggestions',
      name: 'Business Rule Recommendations',
      description: 'Analyze patterns and suggest optimal business rules',
      triggers: ['data_analysis_complete', 'pattern_detected'],
      actions: ['generate_rule_suggestions', 'calculate_business_value', 'notify_stakeholders'],
      enabled: false,
      lastRun: new Date(Date.now() - 3600000), // 1 hour ago
      successRate: 87.3
    },
    {
      id: 'quality-monitoring',
      name: 'Continuous Quality Monitoring',
      description: 'Monitor data quality metrics and alert on degradation',
      triggers: ['scheduled_hourly', 'quality_threshold_breach'],
      actions: ['calculate_metrics', 'generate_alerts', 'create_dashboard_update'],
      enabled: true,
      lastRun: new Date(Date.now() - 60000), // 1 minute ago
      successRate: 99.1
    },
    {
      id: 'export-optimization',
      name: 'Export Optimization',
      description: 'Optimize data exports based on downstream requirements',
      triggers: ['export_requested', 'schema_change'],
      actions: ['optimize_schema', 'compress_data', 'validate_compatibility'],
      enabled: true,
      lastRun: new Date(Date.now() - 900000), // 15 minutes ago
      successRate: 96.8
    }
  ];

  // Initialize with default workflows if empty
  if (workflows.length === 0) {
    onWorkflowsChange(defaultWorkflows);
  }

  const toggleWorkflow = (workflowId: string) => {
    const updatedWorkflows = workflows.map(workflow =>
      workflow.id === workflowId
        ? { ...workflow, enabled: !workflow.enabled }
        : workflow
    );
    onWorkflowsChange(updatedWorkflows);
  };

  const getStatusColor = (successRate: number) => {
    if (successRate >= 95) return 'text-green-600';
    if (successRate >= 85) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusIcon = (successRate: number) => {
    if (successRate >= 95) return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (successRate >= 85) return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    return <AlertTriangle className="h-4 w-4 text-red-500" />;
  };

  const formatLastRun = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const activeWorkflows = workflows.filter(w => w.enabled).length;
  const avgSuccessRate = workflows.reduce((sum, w) => sum + w.successRate, 0) / workflows.length;

  return (
    <Card className="shadow-lg border-0 bg-gradient-to-br from-purple-50 to-indigo-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-purple-600" />
          Automation Workflows
          <Badge className="bg-purple-100 text-purple-800">
            {activeWorkflows} Active
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Workflow Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-white/50 border-purple-200">
            <CardContent className="p-3 text-center">
              <div className="text-2xl font-bold text-purple-700">{activeWorkflows}</div>
              <div className="text-sm text-purple-600">Active Workflows</div>
            </CardContent>
          </Card>
          <Card className="bg-white/50 border-purple-200">
            <CardContent className="p-3 text-center">
              <div className="text-2xl font-bold text-purple-700">{avgSuccessRate.toFixed(1)}%</div>
              <div className="text-sm text-purple-600">Success Rate</div>
            </CardContent>
          </Card>
        </div>

        {/* Workflow List */}
        <ScrollArea className="h-80 w-full">
          <div className="space-y-4">
            {workflows.map((workflow) => (
              <Card key={workflow.id} className="border-l-4 border-l-purple-500">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{workflow.name}</span>
                        <Switch
                          checked={workflow.enabled}
                          onCheckedChange={() => toggleWorkflow(workflow.id)}
                        />
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{workflow.description}</p>
                    </div>
                    {getStatusIcon(workflow.successRate)}
                  </div>

                  {/* Triggers and Actions */}
                  <div className="space-y-2 mb-3">
                    <div>
                      <span className="text-xs font-medium text-gray-500">TRIGGERS</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {workflow.triggers.map((trigger, index) => (
                          <Badge key={index} variant="outline" className="text-xs bg-blue-50 text-blue-700">
                            {trigger.replace('_', ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-gray-500">ACTIONS</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {workflow.actions.map((action, index) => (
                          <Badge key={index} variant="outline" className="text-xs bg-green-50 text-green-700">
                            {action.replace('_', ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Status and Controls */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-gray-400" />
                        <span className="text-gray-600">
                          {workflow.lastRun ? formatLastRun(workflow.lastRun) : 'Never'}
                        </span>
                      </div>
                      <div className={`font-medium ${getStatusColor(workflow.successRate)}`}>
                        {workflow.successRate.toFixed(1)}% success
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" className="text-xs">
                        {workflow.enabled ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                      </Button>
                      <Button size="sm" variant="ghost" className="text-xs">
                        <Settings className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Success Rate Progress */}
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Success Rate</span>
                      <span>{workflow.successRate.toFixed(1)}%</span>
                    </div>
                    <Progress value={workflow.successRate} className="h-1" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>

        {/* Create New Workflow */}
        <Button 
          variant="outline" 
          className="w-full border-purple-300 text-purple-700 hover:bg-purple-50"
          onClick={() => setIsCreating(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Custom Workflow
        </Button>

        {/* Quick Stats */}
        <Card className="bg-gradient-to-r from-purple-100 to-indigo-100 border-purple-200">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-sm font-medium text-purple-900 mb-2">
                Automation Impact
              </div>
              <div className="grid grid-cols-3 gap-4 text-xs">
                <div>
                  <div className="font-bold text-purple-700">2.3hrs</div>
                  <div className="text-purple-600">Time Saved</div>
                </div>
                <div>
                  <div className="font-bold text-purple-700">94%</div>
                  <div className="text-purple-600">Error Reduction</div>
                </div>
                <div>
                  <div className="font-bold text-purple-700">$12K</div>
                  <div className="text-purple-600">Monthly Value</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}