'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { CommunityChannel, CommunityMessage, AppNotification } from '@/types/community';

/**
 * Ensures the user is authenticated
 */
async function requireAuth() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Non authentifié. Veuillez vous connecter.');
  return { supabase, user };
}

/**
 * Ensures the user is Admin
 */
async function requireAdmin() {
  const { supabase, user } = await requireAuth();

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'admin') {
    throw new Error('Action non autorisée. Réservé aux administrateurs.');
  }

  return { supabase, user };
}

// ==========================================
// COMMUNITY MESSAGES & NOTIFICATIONS
// ==========================================

export async function sendMessage(
  channelId: string,
  content: string,
  imageUrl?: string | null,
  parentMessageId?: string | null
) {
  const { supabase, user } = await requireAuth();

  if (!content?.trim() && !imageUrl) {
    throw new Error('Le message ne peut pas être vide.');
  }

  // 1. Fetch channel info
  const { data: channel, error: channelError } = await supabase
    .from('community_channels')
    .select('id, name, slug, published')
    .eq('id', channelId)
    .single();

  if (channelError || !channel) {
    throw new Error('Canal introuvable.');
  }

  // 2. Fetch sender profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single();

  const isAdmin = profile?.role === 'admin';

  // 3. If channel is 'annonces', strictly enforce admin role
  if (channel.slug === 'annonces' && !isAdmin) {
    throw new Error('Seul un administrateur peut publier dans le salon Annonces.');
  }

  // 4. Insert message
  const { data: message, error } = await supabase
    .from('community_messages')
    .insert({
      channel_id: channelId,
      user_id: user.id,
      content: content.trim(),
      image_url: imageUrl?.trim() || null,
      parent_message_id: parentMessageId || null,
    })
    .select(
      `
      id,
      channel_id,
      user_id,
      content,
      image_url,
      parent_message_id,
      created_at
    `
    )
    .single();

  if (error) {
    console.error('Error sending message:', error);
    throw new Error(error.message);
  }

  // 5. IN-APP NOTIFICATIONS BROADCAST
  try {
    if (channel.slug === 'annonces' && isAdmin) {
      // Fetch all member IDs to notify
      const { data: allProfiles } = await supabase
        .from('profiles')
        .select('id')
        .neq('id', user.id);

      if (allProfiles && allProfiles.length > 0) {
        const notificationsToInsert = allProfiles.map((p) => ({
          user_id: p.id,
          title: '📢 Nouvelle Annonce Officielle',
          message: content.length > 100 ? content.substring(0, 97) + '...' : content,
          link: '/community/annonces',
          type: 'announcement',
          read: false,
        }));

        await supabase.from('notifications').insert(notificationsToInsert);
      }
    } else if (channel.slug === 'support') {
      if (!isAdmin) {
        // Member asked support -> notify all admins
        const { data: adminProfiles } = await supabase
          .from('profiles')
          .select('id')
          .eq('role', 'admin');

        if (adminProfiles && adminProfiles.length > 0) {
          const notificationsToInsert = adminProfiles.map((a) => ({
            user_id: a.id,
            title: `🆘 Demande Support de ${profile?.full_name || 'un élève'}`,
            message: content.length > 100 ? content.substring(0, 97) + '...' : content,
            link: '/community/support',
            type: 'support',
            read: false,
          }));

          await supabase.from('notifications').insert(notificationsToInsert);
        }
      } else if (parentMessageId) {
        // Admin replied to a support ticket -> notify original author
        const { data: parentMsg } = await supabase
          .from('community_messages')
          .select('user_id')
          .eq('id', parentMessageId)
          .single();

        if (parentMsg && parentMsg.user_id !== user.id) {
          await supabase.from('notifications').insert({
            user_id: parentMsg.user_id,
            title: '💬 Réponse du Support OPAL',
            message: content.length > 100 ? content.substring(0, 97) + '...' : content,
            link: '/community/support',
            type: 'support',
            read: false,
          });
        }
      }
    }
  } catch (notifErr) {
    // Non-blocking if notifications table not yet created
    console.warn('Notification warning:', notifErr);
  }

  revalidatePath(`/community/${channel.slug}`);
  revalidatePath('/community');
  return message as CommunityMessage;
}

export async function deleteMessage(messageId: string) {
  const { supabase, user } = await requireAuth();

  // Check if admin or author
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  const isAdmin = profile?.role === 'admin';

  let deleteQuery = supabase.from('community_messages').delete().eq('id', messageId);

  if (!isAdmin) {
    deleteQuery = deleteQuery.eq('user_id', user.id);
  }

  const { error } = await deleteQuery;

  if (error) {
    console.error('Error deleting message:', error);
    throw new Error(error.message);
  }

  revalidatePath('/community');
  return { success: true };
}

// ==========================================
// NOTIFICATIONS ACTIONS
// ==========================================

export async function getUserNotifications(): Promise<AppNotification[]> {
  const { supabase, user } = await requireAuth();

  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(30);

    if (error) return [];
    return (data || []) as AppNotification[];
  } catch (e) {
    return [];
  }
}

export async function markNotificationAsRead(notificationId: string) {
  const { supabase, user } = await requireAuth();

  try {
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId)
      .eq('user_id', user.id);
  } catch (e) {
    console.error('Error marking notification as read:', e);
  }

  return { success: true };
}

export async function markAllNotificationsAsRead() {
  const { supabase, user } = await requireAuth();

  try {
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', user.id);
  } catch (e) {
    console.error('Error marking all notifications as read:', e);
  }

  return { success: true };
}

// ==========================================
// COMMUNITY CHANNELS MANAGEMENT
// ==========================================

export async function createChannel(data: {
  name: string;
  slug: string;
  description?: string;
  position?: number;
  published?: boolean;
}) {
  const { supabase } = await requireAdmin();

  if (!data.name?.trim()) throw new Error('Le nom du canal est requis.');
  if (!data.slug?.trim()) throw new Error('Le slug du canal est requis.');

  const cleanSlug = data.slug
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-_]/g, '-');

  const { data: newChannel, error } = await supabase
    .from('community_channels')
    .insert({
      name: data.name.trim(),
      slug: cleanSlug,
      description: data.description?.trim() || null,
      position: data.position ?? 0,
      published: data.published ?? true,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating channel:', error);
    throw new Error(error.message);
  }

  revalidatePath('/community');
  revalidatePath('/admin/community');

  return newChannel as CommunityChannel;
}

export async function updateChannel(
  id: string,
  data: {
    name?: string;
    slug?: string;
    description?: string | null;
    position?: number;
    published?: boolean;
  }
) {
  const { supabase } = await requireAdmin();

  const cleanSlug = data.slug
    ? data.slug
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9-_]/g, '-')
    : undefined;

  const { error } = await supabase
    .from('community_channels')
    .update({
      ...(data.name !== undefined && { name: data.name.trim() }),
      ...(cleanSlug !== undefined && { slug: cleanSlug }),
      ...(data.description !== undefined && { description: data.description?.trim() || null }),
      ...(data.position !== undefined && { position: data.position }),
      ...(data.published !== undefined && { published: data.published }),
    })
    .eq('id', id);

  if (error) {
    console.error('Error updating channel:', error);
    throw new Error(error.message);
  }

  revalidatePath('/community');
  revalidatePath('/admin/community');

  return { success: true };
}

export async function deleteChannel(id: string) {
  const { supabase } = await requireAdmin();

  const { error } = await supabase.from('community_channels').delete().eq('id', id);

  if (error) {
    console.error('Error deleting channel:', error);
    throw new Error(error.message);
  }

  revalidatePath('/community');
  revalidatePath('/admin/community');

  return { success: true };
}

export async function togglePublishChannel(id: string, published: boolean) {
  const { supabase } = await requireAdmin();

  const { error } = await supabase
    .from('community_channels')
    .update({ published })
    .eq('id', id);

  if (error) {
    console.error('Error toggling channel publish:', error);
    throw new Error(error.message);
  }

  revalidatePath('/community');
  revalidatePath('/admin/community');

  return { success: true };
}

export async function seedDefaultChannels() {
  const { supabase } = await requireAdmin();
  const { DEFAULT_COMMUNITY_CHANNELS } = await import('@/types/community');

  for (const ch of DEFAULT_COMMUNITY_CHANNELS) {
    const { error } = await supabase.from('community_channels').upsert(ch, { onConflict: 'slug' });
    if (error) {
      console.error('Error seeding channel:', error);
      throw new Error(`Impossible d'insérer dans la table community_channels (${error.message}). Veuillez exécuter la migration SQL dans Supabase.`);
    }
  }

  revalidatePath('/community');
  revalidatePath('/admin/community');
  return { success: true };
}
