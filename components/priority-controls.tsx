'use client';

import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Target, Clock, Shield, Users, Zap, BarChart3, CheckCircle } from 'lucide-react';
import { PrioritySettings } from '@/app/page';

interface PriorityControlsProps {
  priorities: PrioritySettings;
  onPrioritiesChange: (priorities: PrioritySettings) => void;
}

export function PriorityControls({ priorities, onPrioritiesChange }: PriorityControlsProps) {
  const updatePriority = (key: keyof PrioritySettings, value: number[]) => {
    onPrioritiesChange({
      ...priorities,
      [key]: value[0]
    });
  };

  const getPriorityLabel = (value: number) => {
    if (value < 30) return 'Low';
    if (value < 70) return 'Medium';
    return 'High';
  };

  const getPriorityColor = (value: number) => {
    if (value < 30) return 'secondary';
    if (value < 70) return 'outline';
    return 'default';
  };

  const presetProfiles = {
    'maximize-fulfillment': {
      priorityLevel: 90,
      taskFulfillment: 95,
      fairness: 60,
      workloadBalance: 50,
      skillUtilization: 70,
      phaseOptimization: 60
    },
    'fair-distribution': {
      priorityLevel: 70,
      taskFulfillment: 70,
      fairness: 95,
      workloadBalance: 90,
      skillUtilization: 60,
      phaseOptimization: 50
    },
    'minimize-workload': {
      priorityLevel: 60,
      taskFulfillment: 60,
      fairness: 80,
      workloadBalance: 95,
      skillUtilization: 85,
      phaseOptimization: 70
    },
    'optimize-skills': {
      priorityLevel: 75,
      taskFulfillment: 80,
      fairness: 65,
      workloadBalance: 70,
      skillUtilization: 95,
      phaseOptimization: 85
    }
  };

  const applyPreset = (presetKey: keyof typeof presetProfiles) => {
    onPrioritiesChange(presetProfiles[presetKey]);
  };

  const priorityItems = [
    {
      key: 'priorityLevel' as keyof PrioritySettings,
      label: 'Client Priority Level',
      description: 'Weight given to client priority levels (1-5)',
      icon: Target,
      color: 'text-red-500'
    },
    {
      key: 'taskFulfillment' as keyof PrioritySettings,
      label: 'Task Fulfillment',
      description: 'Maximize completion of requested tasks',
      icon: CheckCircle,
      color: 'text-green-500'
    },
    {
      key: 'fairness' as keyof PrioritySettings,
      label: 'Fairness',
      description: 'Ensure equitable distribution across clients',
      icon: Users,
      color: 'text-blue-500'
    },
    {
      key: 'workloadBalance' as keyof PrioritySettings,
      label: 'Workload Balance',
      description: 'Distribute work evenly among workers',
      icon: BarChart3,
      color: 'text-purple-500'
    },
    {
      key: 'skillUtilization' as keyof PrioritySettings,
      label: 'Skill Utilization',
      description: 'Optimize use of worker skills and expertise',
      icon: Zap,
      color: 'text-yellow-500'
    },
    {
      key: 'phaseOptimization' as keyof PrioritySettings,
      label: 'Phase Optimization',
      description: 'Minimize phase conflicts and maximize efficiency',
      icon: Clock,
      color: 'text-indigo-500'
    }
  ];

  return (
    <Tabs defaultValue="sliders" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="sliders">Priority Sliders</TabsTrigger>
        <TabsTrigger value="presets">Preset Profiles</TabsTrigger>
      </TabsList>

      <TabsContent value="sliders" className="space-y-6">
        <div className="space-y-6">
          {priorityItems.map((item) => {
            const IconComponent = item.icon;
            const value = priorities[item.key];
            
            return (
              <div key={item.key} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <IconComponent className={`h-4 w-4 ${item.color}`} />
                    <Label htmlFor={item.key}>{item.label}</Label>
                  </div>
                  <Badge variant={getPriorityColor(value)}>
                    {getPriorityLabel(value)} ({value}%)
                  </Badge>
                </div>
                <Slider
                  id={item.key}
                  min={0}
                  max={100}
                  step={5}
                  value={[value]}
                  onValueChange={(newValue) => updatePriority(item.key, newValue)}
                  className="w-full"
                />
                <p className="text-xs text-gray-500">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Priority Visualization */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-4">
            <h4 className="font-medium mb-3 text-blue-900">Current Priority Balance</h4>
            <div className="space-y-2">
              {priorityItems.map((item) => {
                const value = priorities[item.key];
                const IconComponent = item.icon;
                
                return (
                  <div key={item.key} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <IconComponent className={`h-3 w-3 ${item.color}`} />
                      <span className="text-sm text-gray-600">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            value < 30 ? 'bg-gray-400' :
                            value < 70 ? 'bg-blue-400' : 'bg-blue-600'
                          }`}
                          style={{ width: `${value}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 w-8">{value}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="presets" className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => applyPreset('maximize-fulfillment')}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">Maximize Fulfillment</h4>
                <Target className="h-5 w-5 text-green-500" />
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Prioritize completing as many requested tasks as possible, especially for high-priority clients.
              </p>
              <div className="flex gap-2">
                <Badge variant="outline">High Priority: 90%</Badge>
                <Badge variant="outline">High Fulfillment: 95%</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => applyPreset('fair-distribution')}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">Fair Distribution</h4>
                <Users className="h-5 w-5 text-blue-500" />
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Ensure equitable treatment across all clients and balanced workload distribution.
              </p>
              <div className="flex gap-2">
                <Badge variant="outline">High Fairness: 95%</Badge>
                <Badge variant="outline">High Balance: 90%</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => applyPreset('minimize-workload')}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">Minimize Workload</h4>
                <BarChart3 className="h-5 w-5 text-purple-500" />
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Focus on preventing worker overload and maintaining sustainable work distribution.
              </p>
              <div className="flex gap-2">
                <Badge variant="outline">High Balance: 95%</Badge>
                <Badge variant="outline">High Skills: 85%</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => applyPreset('optimize-skills')}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">Optimize Skills</h4>
                <Zap className="h-5 w-5 text-yellow-500" />
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Maximize efficient use of worker skills and minimize phase conflicts.
              </p>
              <div className="flex gap-2">
                <Badge variant="outline">High Skills: 95%</Badge>
                <Badge variant="outline">High Phases: 85%</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => onPrioritiesChange({
            priorityLevel: 50,
            taskFulfillment: 50,
            fairness: 50,
            workloadBalance: 50,
            skillUtilization: 50,
            phaseOptimization: 50
          })}
        >
          Reset to Balanced (50% each)
        </Button>
      </TabsContent>
    </Tabs>
  );
}
