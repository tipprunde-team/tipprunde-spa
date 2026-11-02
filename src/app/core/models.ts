// Typen passend zu schema.graphqls im Repo tipprunde-graphql

export interface User {
  id: string;
  email?: string | null;
  username: string;
  isSystemAdmin?: boolean | null;
}

export interface TokenAnswer {
  token: string;
  expiresAt: string;
  user: User;
}

export interface GroupSummary {
  id: string;
  name: string;
  role: string;
  memberCount: number;
  myRank: number;
  myPoints: number;
}

export interface Member {
  userId: string;
  username: string;
  role: string;
  joinedAt: string;
}

export interface Group {
  id: string;
  name: string;
  role?: string | null;
  inviteCode?: string | null;
  members?: Member[] | null;
}

export interface InvitePreview {
  groupId: string;
  groupName: string;
  memberCount: number;
}

export interface Team {
  name: string;
  shortName?: string | null;
  crest?: string | null;
}

export interface Score {
  home: number;
  away: number;
}

export interface MatchEntry {
  id: string;
  kickoff: string;
  status: string;
  locked: boolean;
  homeTeam: Team;
  awayTeam: Team;
  result?: Score | null;
  myTip?: Score | null;
  myPoints?: number | null;
}

export interface Matchday {
  matchday: number;
  serverTime: string;
  matches: MatchEntry[];
}

export interface RankingEntry {
  rank: number;
  userId: string;
  username: string;
  points: number;
  exactTips: number;
}

export interface Tip {
  matchId: string;
  home: number;
  away: number;
  updatedAt: string;
}
