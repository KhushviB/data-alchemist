'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, Brain, Edit3, Check, X, Lightbulb, Wand2 } from 'lucide-react';
import { toast } from 'sonner';
import { BusinessRule, DataRow, TableSchema } from '@/app/page';

interface RulesCreatorProps {
  rules: BusinessRule[];
  onRulesChange: (rules: BusinessRule[]) => void;
  data: {
    clients: DataRow[];
    workers: DataRow[];
    tasks: DataRow[];
  };
  schemas: Record<string, TableSchema>;
  aiSuggestions: BusinessRule[];
}

export function RulesCreator({ rules, onRulesChange, data, schemas, aiSuggestions }: RulesCreatorProps) {
  const [newRuleText, setNewRuleText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [editingRule, setEditingRule] = useState<string | null>(null);
  const [editDescription, setEditDescription] = useState('');
  
  // Manual rule creation states
  const [manualRuleType, setManualRuleType] = useState<BusinessRule['type']>('coRun');
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [selectedWorkers, setSelectedWorkers] = useState<string[]>([]);
  const [ruleParameters, setRuleParameters] = useState<Record<string, any>>({});

  const processNaturalLanguageRule = async (text: string) => {
    setIsProcessing(true);
    
    try {
      // Simulate AI processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newRule = parseNaturalLanguageRule(text);
      
      if (newRule) {
        onRulesChange([...rules, newRule]);
        setNewRuleText('');
        toast.success('Business rule created successfully!');
      } else {
        toast.error('Could not understand the rule. Please try rephrasing.');
      }
    } catch (error) {
      toast.error('Error processing rule');
    } finally {
      setIsProcessing(false);
    }
  };

  const parseNaturalLanguageRule = (text: string): BusinessRule | null => {
    const lowerText = text.toLowerCase();
    
    // Co-run rule detection
    if (lowerText.includes('together') || lowerText.includes('co-run') || lowerText.includes('same time')) {
      const taskMatches = text.match(/task[s]?\s+([A-Z0-9,\s]+)/i);
      if (taskMatches) {
        const tasks = taskMatches[1].split(',').map(t => t.trim()).filter(t => t);
        return {
          id: Date.now().toString(),
          type: 'coRun',
          description: text,
          parameters: { tasks },
          enabled: true
        };
      }
    }
    
    // Load limit rule detection
    if (lowerText.includes('load limit') || lowerText.includes('max load') || lowerText.includes('workload')) {
      const groupMatch = text.match(/group\s+([A-Za-z]+)/i);
      const limitMatch = text.match(/(\d+)\s*(?:tasks?|slots?)/i);
      
      if (groupMatch && limitMatch) {
        return {
          id: Date.now().toString(),
          type: 'loadLimit',
          description: text,
          parameters: { 
            workerGroup: groupMatch[1],
            maxSlotsPerPhase: parseInt(limitMatch[1])
          },
          enabled: true
        };
      }
    }
    
    // Phase window rule detection
    if (lowerText.includes('phase') && (lowerText.includes('only') || lowerText.includes('restrict'))) {
      const taskMatch = text.match(/task\s+([A-Z0-9]+)/i);
      const phaseMatch = text.match(/phase[s]?\s+([0-9,-]+)/i);
      
      if (taskMatch && phaseMatch) {
        const phases = phaseMatch[1].split(',').map(p => parseInt(p.trim())).filter(p => !isNaN(p));
        return {
          id: Date.now().toString(),
          type: 'phaseWindow',
          description: text,
          parameters: {
            taskId: taskMatch[1],
            allowedPhases: phases
          },
          enabled: true
        };
      }
    }
    
    // Slot restriction rule detection
    if (lowerText.includes('common slots') || lowerText.includes('shared slots')) {
      const groupMatch = text.match(/(?:client|worker)\s+group\s+([A-Za-z]+)/i);
      const slotsMatch = text.match(/(\d+)\s*common\s*slots/i);
      
      if (groupMatch && slotsMatch) {
        return {
          id: Date.now().toString(),
          type: 'slotRestriction',
          description: text,
          parameters: {
            group: groupMatch[1],
            minCommonSlots: parseInt(slotsMatch[1])
          },
          enabled: true
        };
      }
    }
    
    // Generic custom rule
    return {
      id: Date.now().toString(),
      type: 'custom',
      description: text,
      parameters: { condition: text },
      enabled: true
    };
  };

  const createManualRule = () => {
    const newRule: BusinessRule = {
      id: Date.now().toString(),
      type: manualRuleType,
      description: generateRuleDescription(manualRuleType, ruleParameters),
      parameters: { ...ruleParameters },
      enabled: true
    };
    
    onRulesChange([...rules, newRule]);
    setRuleParameters({});
    setSelectedTasks([]);
    setSelectedWorkers([]);
    toast.success('Rule created successfully!');
  };

  const generateRuleDescription = (type: BusinessRule['type'], params: Record<string, any>): string => {
    switch (type) {
      case 'coRun':
        return `Tasks ${params.tasks?.join(', ')} must run together`;
      case 'loadLimit':
        return `Worker group ${params.workerGroup} limited to ${params.maxSlotsPerPhase} slots per phase`;
      case 'phaseWindow':
        return `Task ${params.taskId} restricted to phases ${params.allowedPhases?.join(', ')}`;
      case 'slotRestriction':
        return `Group ${params.group} requires ${params.minCommonSlots} common slots`;
      default:
        return 'Custom business rule';
    }
  };

  const toggleRule = (ruleId: string) => {
    onRulesChange(rules.map(rule => 
      rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
    ));
  };

  const deleteRule = (ruleId: string) => {
    onRulesChange(rules.filter(rule => rule.id !== ruleId));
    toast.success('Rule deleted');
  };

  const acceptAISuggestion = (suggestion: BusinessRule) => {
    onRulesChange([...rules, { ...suggestion, id: Date.now().toString() }]);
    toast.success('AI suggestion accepted');
  };

  const startEdit = (rule: BusinessRule) => {
    setEditingRule(rule.id);
    setEditDescription(rule.description);
  };

  const saveEdit = () => {
    if (editingRule) {
      onRulesChange(rules.map(rule => 
        rule.id === editingRule 
          ? { ...rule, description: editDescription }
          : rule
      ));
      setEditingRule(null);
      setEditDescription('');
      toast.success('Rule updated');
    }
  };

  const cancelEdit = () => {
    setEditingRule(null);
    setEditDescription('');
  };

  const getRuleTypeIcon = (type: BusinessRule['type']) => {
    const icons = {
      coRun: '🔗',
      loadLimit: '⚖️',
      phaseWindow: '📅',
      slotRestriction: '🎯',
      patternMatch: '🔍',
      precedenceOverride: '⚡',
      custom: '⚙️',
      aiGenerated: '🤖'
    };
    return icons[type] || '📋';
  };

  // Safely access data arrays with fallback to empty arrays
  const tasks = data?.tasks || [];
  const workers = data?.workers || [];
  const clients = data?.clients || [];

  return (
    <div className="space-y-6">
      <Tabs defaultValue="natural" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="natural">Natural Language</TabsTrigger>
          <TabsTrigger value="manual">Manual Builder</TabsTrigger>
          <TabsTrigger value="suggestions">AI Suggestions</TabsTrigger>
        </TabsList>

        {/* Natural Language Rule Creation */}
        <TabsContent value="natural">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-indigo-600" />
                Natural Language Rule Creator
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Describe your business rule in plain English...

Examples:
• Tasks T001 and T002 must run together
• Sales worker group should have a load limit of 3 slots per phase
• Task T005 should only run in phases 1, 2, and 3
• Client group Premium requires 2 common slots minimum
• Workers with JavaScript skills cannot exceed 5 concurrent tasks"
                value={newRuleText}
                onChange={(e) => setNewRuleText(e.target.value)}
                className="min-h-[120px]"
              />
              
              <Button 
                onClick={() => processNaturalLanguageRule(newRuleText)}
                disabled={!newRuleText.trim() || isProcessing}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              >
                {isProcessing ? (
                  <>
                    <Brain className="h-4 w-4 mr-2 animate-spin" />
                    Processing with AI...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4 mr-2" />
                    Create Rule with AI
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Manual Rule Builder */}
        <TabsContent value="manual">
          <Card>
            <CardHeader>
              <CardTitle>Manual Rule Builder</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Rule Type</label>
                  <Select value={manualRuleType} onValueChange={(value: BusinessRule['type']) => setManualRuleType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="coRun">Co-Run Tasks</SelectItem>
                      <SelectItem value="loadLimit">Load Limit</SelectItem>
                      <SelectItem value="phaseWindow">Phase Window</SelectItem>
                      <SelectItem value="slotRestriction">Slot Restriction</SelectItem>
                      <SelectItem value="patternMatch">Pattern Match</SelectItem>
                      <SelectItem value="precedenceOverride">Precedence Override</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Dynamic parameter inputs based on rule type */}
              {manualRuleType === 'coRun' && tasks.length > 0 && (
                <div>
                  <label className="text-sm font-medium">Select Tasks to Co-Run</label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {tasks.map(task => (
                      <label key={task.TaskID} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={selectedTasks.includes(task.TaskID)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedTasks([...selectedTasks, task.TaskID]);
                              setRuleParameters({ ...ruleParameters, tasks: [...selectedTasks, task.TaskID] });
                            } else {
                              const newTasks = selectedTasks.filter(t => t !== task.TaskID);
                              setSelectedTasks(newTasks);
                              setRuleParameters({ ...ruleParameters, tasks: newTasks });
                            }
                          }}
                        />
                        <span className="text-sm">{task.TaskID}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {manualRuleType === 'loadLimit' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Worker Group</label>
                    <Input
                      placeholder="e.g., Sales, Development"
                      onChange={(e) => setRuleParameters({ ...ruleParameters, workerGroup: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Max Slots Per Phase</label>
                    <Input
                      type="number"
                      placeholder="e.g., 3"
                      onChange={(e) => setRuleParameters({ ...ruleParameters, maxSlotsPerPhase: parseInt(e.target.value) })}
                    />
                  </div>
                </div>
              )}

              <Button 
                onClick={createManualRule}
                disabled={Object.keys(ruleParameters).length === 0}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Rule
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Suggestions */}
        <TabsContent value="suggestions">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-amber-500" />
                AI Rule Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {aiSuggestions.length === 0 ? (
                <div className="text-center py-8">
                  <Lightbulb className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No AI suggestions available yet.</p>
                  <p className="text-sm text-gray-400 mt-1">Upload more data to get intelligent rule recommendations.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {aiSuggestions.map((suggestion, index) => (
                    <div key={index} className="p-4 border rounded-lg bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{getRuleTypeIcon(suggestion.type)}</span>
                          <Badge variant="outline" className="bg-amber-100 text-amber-800">
                            {suggestion.type}
                          </Badge>
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                            AI Generated
                          </Badge>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-700 mb-3">{suggestion.description}</p>
                      
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => acceptAISuggestion(suggestion)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Accept
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit3 className="h-4 w-4 mr-1" />
                          Modify
                        </Button>
                        <Button size="sm" variant="ghost">
                          <X className="h-4 w-4 mr-1" />
                          Dismiss
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Active Rules */}
      {rules.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Active Business Rules ({rules.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] w-full">
              <div className="space-y-4">
                {rules.map((rule) => (
                  <div key={rule.id} className="flex items-start gap-4 p-4 border rounded-lg bg-gray-50">
                    <Switch
                      checked={rule.enabled}
                      onCheckedChange={() => toggleRule(rule.id)}
                    />
                    
                    <div className="flex-1 min-w-0">
                      {editingRule === rule.id ? (
                        <div className="space-y-2">
                          <Textarea
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            className="min-h-[60px]"
                          />
                          <div className="flex gap-2">
                            <Button size="sm" onClick={saveEdit}>
                              <Check className="h-4 w-4 mr-1" />
                              Save
                            </Button>
                            <Button size="sm" variant="outline" onClick={cancelEdit}>
                              <X className="h-4 w-4 mr-1" />
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg">{getRuleTypeIcon(rule.type)}</span>
                            <Badge variant="outline" className="text-xs">
                              {rule.type}
                            </Badge>
                            <Badge 
                              variant={rule.enabled ? 'default' : 'secondary'} 
                              className="text-xs"
                            >
                              {rule.enabled ? 'Active' : 'Inactive'}
                            </Badge>
                            {rule.aiGenerated && (
                              <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                                AI Generated
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm font-medium text-gray-900 mb-2">
                            {rule.description}
                          </p>
                          {Object.keys(rule.parameters).length > 0 && (
                            <div className="text-xs text-gray-600 bg-white p-2 rounded border">
                              <strong>Parameters:</strong> {JSON.stringify(rule.parameters, null, 2)}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                    
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => startEdit(rule)}
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteRule(rule.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
