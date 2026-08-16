'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { DirectMessage, ConversationSummary } from '@/types/direct-messages';
import type { Profile } from '@/types/database';

/**
 * Ensures user is authenticated and returns user + profile
 */
async function requireAuth() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Non authentifié. Veuillez vous connecter.');

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return { supabase, user, profile: profile as Profile | null };
}

/**
 * Ensures user has admin role
 */
async function requireAdmin() {
  const { supabase, user, profile } = await requireAuth();

  if (!profile || profile.role !== 'admin') {
    throw new Error('Action non autorisée. Réservé aux administrateurs.');
  }

  return { supabase, user, profile };
}

/**
 * Resolves the primary admin ID to receive messages from members
 */
async function resolveAdminId(supabase: any): Promise<string> {
  const { data: admins, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('role', 'admin')
    .limit(1);

  if (error || !admins || admins.length === 0) {
    const { data: anyProfile } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
    return anyProfile?.[0]?.id || '';
  }

  return admins[0].id;
}

// ==========================================
// SEND DIRECT MESSAGE
// ==========================================

export async function sendDirectMessage({
  content,
  receiverId,
}: {
  content: string;
  receiverId?: string;
}): Promise<DirectMessage> {
  const { supabase, user, profile } = await requireAuth();

  const trimmedContent = content?.trim();
  if (!trimmedContent) {
    throw new Error('Le message ne peut pas être vide.');
  }
  if (trimmedContent.length > 4000) {
    throw new Error('Le message ne peut pas dépasser 4000 caractères.');
  }

  const isAdmin = profile?.role === 'admin';
  let targetReceiverId = receiverId;

  if (!isAdmin) {
    // Regular member: MUST send to an admin (cannot send to other members)
    targetReceiverId = await resolveAdminId(supabase);
  } else {
    // Admin sending:
    // If receiverId is provided, use it. If not provided (admin testing /messages),
    // default to another admin or fallback to self.
    if (!targetReceiverId) {
      const { data: otherAdmins } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'admin')
        .neq('id', user.id)
        .limit(1);

      if (otherAdmins && otherAdmins.length > 0) {
        targetReceiverId = otherAdmins[0].id;
      } else {
        targetReceiverId = user.id;
      }
    }
  }

  if (!targetReceiverId) {
    targetReceiverId = user.id;
  }

  // Insert message into direct_messages
  const { data: newMsg, error } = await supabase
    .from('direct_messages')
    .insert({
      sender_id: user.id,
      receiver_id: targetReceiverId,
      content: trimmedContent,
      read: false,
    })
    .select(
      `
      id,
      sender_id,
      receiver_id,
      content,
      read,
      created_at
    `
    )
    .single();

  if (error) {
    console.error('Error sending direct message:', error);
    throw new Error(`Erreur lors de l'envoi du message : ${error.message}`);
  }

  // Create in-app notification
  try {
    if (!isAdmin) {
      // Member sent message -> Notify all other admins
      const { data: adminProfiles } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'admin')
        .neq('id', user.id);

      if (adminProfiles && adminProfiles.length > 0) {
        const notifs = adminProfiles.map((a: { id: string }) => ({
          user_id: a.id,
          title: `💬 Message de ${profile?.full_name || profile?.email || 'un élève'}`,
          message: trimmedContent.length > 90 ? trimmedContent.substring(0, 87) + '...' : trimmedContent,
          link: `/admin/messages?userId=${user.id}`,
          type: 'message',
          read: false,
        }));
        await supabase.from('notifications').insert(notifs);
      }
    } else if (targetReceiverId && targetReceiverId !== user.id) {
      // Admin sent reply -> Notify member (if not self)
      await supabase.from('notifications').insert({
        user_id: targetReceiverId,
        title: "💬 Nouveau message de l'équipe OPAL",
        message: trimmedContent.length > 90 ? trimmedContent.substring(0, 87) + '...' : trimmedContent,
        link: '/messages',
        type: 'message',
        read: false,
      });
    }
  } catch (notifErr) {
    console.warn('Direct message notification warning:', notifErr);
  }

  revalidatePath('/messages');
  revalidatePath('/admin/messages');

  return newMsg as DirectMessage;
}

// ==========================================
// FETCH DIRECT MESSAGES
// ==========================================

export async function getDirectMessages(otherUserId?: string): Promise<DirectMessage[]> {
  const { supabase, user, profile } = await requireAuth();
  const isAdmin = profile?.role === 'admin';

  let query = supabase
    .from('direct_messages')
    .select(
      `
      id,
      sender_id,
      receiver_id,
      content,
      read,
      created_at
    `
    );

  if (!isAdmin) {
    // Member only gets their own conversation with OPAL/Admin
    query = query.or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);
  } else {
    // Admin: gets messages for specific member if specified
    if (otherUserId) {
      query = query.or(
        `and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`
      );
    } else {
      // Default: fetch all for admin
      query = query.or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);
    }
  }

  const { data: messages, error } = await query
    .order('created_at', { ascending: true })
    .limit(200);

  if (error) {
    console.error('Error fetching direct messages:', error);
    return [];
  }

  // Fetch author details for mapping
  const senderIds = Array.from(
    new Set((messages || []).map((m: DirectMessage) => m.sender_id))
  );

  if (senderIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, email, avatar_url, role, plan')
      .in('id', senderIds);

    const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]));

    return (messages || []).map((m: any) => ({
      ...m,
      sender: profileMap.get(m.sender_id) || undefined,
    }));
  }

  return (messages || []) as DirectMessage[];
}

// ==========================================
// MARK AS READ
// ==========================================

export async function markDirectMessageAsRead(messageId: string) {
  const { supabase, user } = await requireAuth();

  const { error } = await supabase
    .from('direct_messages')
    .update({ read: true })
    .eq('id', messageId)
    .eq('receiver_id', user.id);

  if (error) {
    console.error('Error marking direct message as read:', error);
  }

  return { success: true };
}

export async function markConversationAsRead(otherUserId: string) {
  const { supabase, user } = await requireAuth();

  const { error } = await supabase
    .from('direct_messages')
    .update({ read: true })
    .eq('sender_id', otherUserId)
    .eq('receiver_id', user.id)
    .eq('read', false);

  if (error) {
    console.error('Error marking conversation as read:', error);
  }

  revalidatePath('/messages');
  revalidatePath('/admin/messages');
  return { success: true };
}

// ==========================================
// UNREAD COUNT FOR CURRENT USER
// ==========================================

export async function getUnreadDirectMessagesCount(): Promise<number> {
  try {
    const { supabase, user } = await requireAuth();

    const { count, error } = await supabase
      .from('direct_messages')
      .select('id', { count: 'exact', head: true })
      .eq('receiver_id', user.id)
      .eq('read', false);

    if (error) return 0;
    return count || 0;
  } catch (e) {
    return 0;
  }
}

// ==========================================
// ADMIN: GET ALL CONVERSATIONS
// ==========================================

export async function getAdminConversations(): Promise<ConversationSummary[]> {
  const { supabase, user } = await requireAdmin();

  // 1. Fetch all direct messages involving the admin
  const { data: messages, error } = await supabase
    .from('direct_messages')
    .select('*')
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .order('created_at', { ascending: false });

  if (error || !messages || messages.length === 0) {
    return [];
  }

  // 2. Identify distinct member IDs
  const conversationMap = new Map<string, { lastMessage: DirectMessage; unreadCount: number }>();

  for (const msg of messages as DirectMessage[]) {
    const memberId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
    if (!memberId) continue;

    if (!conversationMap.has(memberId)) {
      conversationMap.set(memberId, {
        lastMessage: msg,
        unreadCount: !msg.read && msg.receiver_id === user.id ? 1 : 0,
      });
    } else {
      const conv = conversationMap.get(memberId)!;
      if (!msg.read && msg.receiver_id === user.id) {
        conv.unreadCount += 1;
      }
    }
  }

  const memberIds = Array.from(conversationMap.keys());
  if (memberIds.length === 0) return [];

  // 3. Fetch profiles of these members
  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .in('id', memberIds);

  const profileMap = new Map((profiles || []).map((p: any) => [p.id, p as Profile]));

  // 4. Assemble summaries
  const summaries: ConversationSummary[] = [];

  for (const [memberId, data] of conversationMap.entries()) {
    const profile = profileMap.get(memberId);
    if (profile) {
      summaries.push({
        userId: memberId,
        profile,
        lastMessage: data.lastMessage,
        unreadCount: data.unreadCount,
      });
    }
  }

  // Sort by latest message date
  summaries.sort(
    (a, b) =>
      new Date(b.lastMessage.created_at).getTime() -
      new Date(a.lastMessage.created_at).getTime()
  );

  return summaries;
}

// ==========================================
// DELETE DIRECT MESSAGE (Strict)
// ==========================================

export async function deleteDirectMessage(messageId: string) {
  const { supabase, user, profile } = await requireAuth();
  const isAdmin = profile?.role === 'admin';

  let query = supabase.from('direct_messages').delete().eq('id', messageId);

  if (!isAdmin) {
    // Regular member can only delete their own sent messages
    query = query.eq('sender_id', user.id);
  }

  const { error } = await query;

  if (error) {
    console.error('Error deleting direct message:', error);
    throw new Error(error.message);
  }

  revalidatePath('/messages');
  revalidatePath('/admin/messages');
  return { success: true };
}
