import { useState, useEffect } from 'react';
import { Bell, CheckCircle2, Clock, Info, X } from 'lucide-react';
import { notificationsApi } from '@/lib/api';
import type { Notification as AppNotification } from '@shared/types';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const response = await notificationsApi.list();
      if (response.success && response.data) {
        setNotifications(response.data);
        setUnreadCount(response.data.filter(n => !n.read).length);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Refresh periodically
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationsApi.markAsRead(id);
      setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      toast.error('Erreur lors du marquage comme lu');
    }
  };

  const getIcon = (title: string) => {
    if (title.toLowerCase().includes('expire') || title.toLowerCase().includes('expiration')) {
      return <Clock className="h-4 w-4 text-amber-500" />;
    }
    if (title.toLowerCase().includes('soumission') || title.toLowerCase().includes('valide')) {
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    }
    return <Info className="h-4 w-4 text-blue-500" />;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Badge variant="secondary" className="text-[10px]">
              {unreadCount} nouvelles
            </Badge>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[300px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
              <Bell className="mb-2 h-8 w-8 opacity-20" />
              <p className="text-xs">Aucune notification</p>
            </div>
          ) : (
            notifications.map((n: AppNotification) => (
              <DropdownMenuItem
                key={n.id}
                className={`flex flex-col items-start gap-1 p-3 focus:bg-accent/50 ${!n.read ? 'bg-accent/20' : ''}`}
                onClick={() => !n.read && handleMarkAsRead(n.id)}
              >
                <div className="flex w-full items-start gap-2">
                  <div className="mt-1">{getIcon(n.title)}</div>
                  <div className="flex-1 overflow-hidden">
                    <p className={`text-sm font-medium leading-none ${!n.read ? 'font-bold' : ''}`}>
                      {n.title}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                      {n.message}
                    </p>
                  </div>
                </div>
                <p className="w-full text-right text-[10px] text-muted-foreground">
                  {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: fr })}
                </p>
              </DropdownMenuItem>
            ))
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
