'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, MessageCircle, Clock, Activity } from 'lucide-react';
import { CollaborationEvent } from '@/app/page';

interface CollaborationHubProps {
  events: CollaborationEvent[];
}

export function CollaborationHub({ events }: CollaborationHubProps) {
  const getTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'uploaded': return 'bg-blue-100 text-blue-800';
      case 'reviewed': return 'bg-green-100 text-green-800';
      case 'commented on': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-emerald-100 text-emerald-800';
      case 'flagged': return 'bg-red-100 text-red-800';
      case 'updated': return 'bg-purple-100 text-purple-800';
      case 'searched': return 'bg-indigo-100 text-indigo-800';
      case 'auto-fixed': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const activeUsers = [...new Set(events.slice(0, 10).map(e => e.user))];

  return (
    <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-indigo-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-600" />
          Team Collaboration
          <Badge className="bg-blue-100 text-blue-800">
            <Activity className="h-3 w-3 mr-1" />
            Live
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Active Users */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-blue-900">Active Now</span>
            <Badge variant="outline">{activeUsers.length}</Badge>
          </div>
          <div className="flex -space-x-2">
            {activeUsers.slice(0, 5).map((user, index) => (
              <Avatar key={index} className="border-2 border-white w-8 h-8">
                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user}`} />
                <AvatarFallback className="text-xs">
                  {user.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
            ))}
            {activeUsers.length > 5 && (
              <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center">
                <span className="text-xs text-gray-600">+{activeUsers.length - 5}</span>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-900">Recent Activity</span>
            <Button variant="ghost" size="sm" className="text-xs">
              <MessageCircle className="h-3 w-3 mr-1" />
              View All
            </Button>
          </div>
          
          <ScrollArea className="h-64 w-full">
            <div className="space-y-3">
              {events.map((event) => (
                <div key={event.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-white/50 transition-colors">
                  <Avatar className="w-6 h-6">
                    <AvatarImage src={event.avatar} />
                    <AvatarFallback className="text-xs">
                      {event.user.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-900">{event.user}</span>
                      <Badge variant="outline" className={`text-xs ${getActionColor(event.action)}`}>
                        {event.action}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 mb-1">{event.details}</p>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Clock className="h-3 w-3" />
                      {getTimeAgo(event.timestamp)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Quick Actions */}
        <div className="space-y-2">
          <span className="text-sm font-medium text-blue-900">Quick Actions</span>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" className="text-xs">
              <MessageCircle className="h-3 w-3 mr-1" />
              Comment
            </Button>
            <Button variant="outline" size="sm" className="text-xs">
              <Users className="h-3 w-3 mr-1" />
              Share
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}