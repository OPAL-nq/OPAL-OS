'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { AppNotification } from '@/types/community';
import { getUserNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '@/app/actions/community';
import { Bell, Check, CheckCheck } from 'lucide-react';
import Link from 'next/link';

export function NotificationBell() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    let isMounted = true;

    const loadNotifications = async () => {
      try {
        const data = await getUserNotifications();
        if (isMounted) {
          setNotifications(data);
          setUnreadCount(data.filter((n) => !n.read).length);
        }
      } catch (e) {
        // ignore
      }
    };

    loadNotifications();

    // Close on outside click
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    // Supabase Realtime for instant notification delivery
    const channel = supabase
      .channel('user-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
        },
        (payload) => {
          const newNotif = payload.new as AppNotification;
          if (isMounted) {
            setNotifications((prev) => [newNotif, ...prev]);
            setUnreadCount((prev) => prev + 1);
          }
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      document.removeEventListener('mousedown', handleClickOutside);
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const handleMarkAsRead = async (id: string) => {
    await markNotificationAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white transition-all border border-white/5 hover:border-white/10"
        title="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-[#39FF14] text-black text-[10px] font-black flex items-center justify-center px-1 shadow-[0_0_10px_rgba(57,255,20,0.6)] animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#141414] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden backdrop-blur-xl animate-in fade-in zoom-in-95 duration-100">
          {/* Header */}
          <div className="p-3.5 border-b border-white/10 flex items-center justify-between bg-black/40">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-white">
                Notifications
              </span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded bg-[#39FF14]/20 text-[#39FF14] text-[10px] font-bold">
                  {unreadCount} nouvelle{unreadCount > 1 ? 's' : ''}
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-[11px] text-neutral-400 hover:text-[#39FF14] flex items-center gap-1 transition-colors"
              >
                <CheckCheck className="w-3 h-3" />
                <span>Tout marquer comme lu</span>
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-white/5 scrollbar-thin scrollbar-thumb-white/10">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-neutral-500 text-xs">
                <Bell className="w-6 h-6 mx-auto mb-2 opacity-30" />
                <span>Aucune notification pour le moment.</span>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-3.5 transition-colors flex items-start justify-between gap-3 ${
                    notif.read
                      ? 'bg-transparent text-neutral-400'
                      : 'bg-white/[0.03] text-neutral-200 border-l-2 border-[#39FF14]'
                  }`}
                >
                  <Link
                    href={notif.link || '/community'}
                    onClick={() => {
                      if (!notif.read) handleMarkAsRead(notif.id);
                      setIsOpen(false);
                    }}
                    className="flex-1 space-y-1 group"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-bold ${
                          notif.read
                            ? 'text-neutral-300'
                            : 'text-white group-hover:text-[#39FF14]'
                        }`}
                      >
                        {notif.title}
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-400 line-clamp-2 leading-relaxed">
                      {notif.message}
                    </p>
                    <span className="text-[9px] text-neutral-600 font-mono block pt-0.5">
                      {new Date(notif.created_at).toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit',
                        day: 'numeric',
                        month: 'short',
                      })}
                    </span>
                  </Link>

                  {!notif.read && (
                    <button
                      type="button"
                      onClick={() => handleMarkAsRead(notif.id)}
                      className="p-1 text-neutral-500 hover:text-[#39FF14] transition-colors"
                      title="Marquer comme lu"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
