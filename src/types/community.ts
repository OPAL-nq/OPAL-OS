export interface CommunityChannel {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  position: number;
  published: boolean;
  created_at: string;
}

export interface MessageAuthor {
  id: string;
  full_name: string | null;
  email?: string;
  avatar_url: string | null;
  role: 'user' | 'admin';
  plan: 'community' | 'intensive';
}

export interface CommunityMessage {
  id: string;
  channel_id: string;
  user_id: string;
  content: string;
  image_url: string | null;
  parent_message_id: string | null;
  created_at: string;
  author?: MessageAuthor;
  replies?: CommunityMessage[];
}

export interface AppNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  link?: string | null;
  type: 'announcement' | 'support' | 'live' | 'system' | 'message';
  read: boolean;
  created_at: string;
}

export const DEFAULT_COMMUNITY_CHANNELS = [
  { name: '📢 Annonces', slug: 'annonces', description: 'Annonces officielles OPAL. Canal d\'informations officielles réservé aux administrateurs.', position: 1, published: true },
  { name: '💬 Général', slug: 'general', description: 'Discussions générales, échanges et actualités entre membres de la communauté.', position: 2, published: true },
  { name: '📊 Trading & Analyses', slug: 'trading', description: 'Analyses de marché, identification des niveaux clés, scénarios et partages de graphiques.', position: 3, published: true },
  { name: '🧠 Questions & Entraide', slug: 'questions', description: 'Posez toutes vos questions sur la méthode OPAL, le trading et l\'utilisation des outils.', position: 4, published: true },
  { name: '📝 Journal', slug: 'journal', description: 'Partage de vos trades, débriefings de session, erreurs commises et retours d\'expérience.', position: 5, published: true },
  { name: '🏆 Wins & Payouts', slug: 'wins', description: 'Célébration des réussites, challenges prop firms validés, payouts et paliers franchis.', position: 6, published: true },
  { name: '🔥 Motivation', slug: 'motivation', description: 'Discipline, psychologie, routines quotidiennes, objectifs et accountability.', position: 7, published: true },
  { name: '🆘 Support', slug: 'support', description: 'Assistance privée avec l\'administrateur. Seul vous et l\'administrateur pouvez voir vos demandes.', position: 8, published: true },
  { name: '🎥 Replays', slug: 'replays', description: 'Signalement et accès aux replays importants des sessions de live trading et masterclasses.', position: 9, published: true },
];
