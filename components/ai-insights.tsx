'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, AlertTriangle, Lightbulb, Target, DollarSign, Brain, Zap, Shield, BarChart3 } from 'lucide-react';
import { AIInsight } from '@/app/page';

interface AIInsightsProps {
  insights: AIInsight[];
}

export function AIInsights({ insights }: AIInsightsProps) {
  const getInsightIcon = (type: AIInsight['type']) => {
    switch (type) {
      case 'optimization': return <TrendingUp className="h-4 w-4 text-blue-500" />;
      case 'anomaly': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'trend': return <BarChart3 className="h-4 w-4 text-purple-500" />;
      case 'recommendation': return <Lightbulb className="h-4 w-4 text-yellow-500" />;
      case 'risk': return <Shield className="h-4 w-4 text-orange-500" />;
      default: return <Brain className="h-4 w-4 text-gray-500" />;
    }
  };

  const getImpactColor = (impact: AIInsight['impact']) => {
    switch (impact) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const criticalInsights = insights.filter(i => i.impact === 'critical');
  const highValueInsights = insights.filter(i => i.estimatedValue && i.estimatedValue > 50000);

  return (
    <Card className="shadow-lg border-0 bg-gradient-to-br from-indigo-50 to-purple-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-indigo-600" />
          AI Intelligence Dashboard
          <Badge className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
            <Zap className="h-3 w-3 mr-1" />
            Live Analysis
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Critical Alerts */}
        {criticalInsights.length > 0 && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <span className="font-medium text-red-900">Critical Issues Detected</span>
              <Badge variant="destructive">{criticalInsights.length}</Badge>
            </div>
            <div className="space-y-2">
              {criticalInsights.map((insight) => (
                <div key={insight.id} className="text-sm text-red-700">
                  • {insight.title}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* High-Value Opportunities */}
        {highValueInsights.length > 0 && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="h-5 w-5 text-green-500" />
              <span className="font-medium text-green-900">High-Value Opportunities</span>
              <Badge className="bg-green-100 text-green-800">{highValueInsights.length}</Badge>
            </div>
            <div className="space-y-2">
              {highValueInsights.map((insight) => (
                <div key={insight.id} className="flex justify-between items-center text-sm">
                  <span className="text-green-700">{insight.title}</span>
                  <Badge className="bg-green-200 text-green-800">
                    ${insight.estimatedValue?.toLocaleString()}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Insights */}
        <ScrollArea className="h-80 w-full">
          <div className="space-y-4">
            {insights.map((insight) => (
              <Card key={insight.id} className="border-l-4 border-l-indigo-500">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getInsightIcon(insight.type)}
                      <span className="font-medium">{insight.title}</span>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline" className={getImpactColor(insight.impact)}>
                        {insight.impact}
                      </Badge>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700">
                        {Math.round(insight.confidence * 100)}%
                      </Badge>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-700 mb-3">{insight.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {insight.category}
                      </Badge>
                      {insight.estimatedValue && (
                        <Badge className="bg-green-100 text-green-800 text-xs">
                          <DollarSign className="h-3 w-3 mr-1" />
                          ${insight.estimatedValue.toLocaleString()}
                        </Badge>
                      )}
                    </div>
                    
                    {insight.actionable && (
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="text-xs">
                          <Target className="h-3 w-3 mr-1" />
                          Take Action
                        </Button>
                        <Button size="sm" variant="ghost" className="text-xs">
                          Learn More
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  {/* Confidence Indicator */}
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>AI Confidence</span>
                      <span>{Math.round(insight.confidence * 100)}%</span>
                    </div>
                    <Progress value={insight.confidence * 100} className="h-1" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>

        {/* Insight Categories Summary */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-3 text-center">
              <div className="text-lg font-bold text-blue-700">
                {insights.filter(i => i.type === 'optimization').length}
              </div>
              <div className="text-xs text-blue-600">Optimizations</div>
            </CardContent>
          </Card>
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="p-3 text-center">
              <div className="text-lg font-bold text-yellow-700">
                {insights.filter(i => i.type === 'recommendation').length}
              </div>
              <div className="text-xs text-yellow-600">Recommendations</div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}