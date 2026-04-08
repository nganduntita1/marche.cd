import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator, Dimensions, RefreshControl,
  ScrollView, StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Line, Polyline, Rect, Circle, Path, Text as SvgText } from 'react-native-svg';
import {
  ArrowLeft, Users, FileText, BadgeDollarSign, CreditCard,
  AlertCircle, CheckCircle, Clock, Tag, ChevronLeft, ChevronRight,
} from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import Colors from '@/constants/Colors';

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10;
const SW = Dimensions.get('window').width;
const CW = SW - 64; // chart width (screen - outer padding - card padding)
const LH = 160;     // line chart height
const BH = 140;     // bar chart height

// ─── Types ────────────────────────────────────────────────────────────────────

type Stats = {
  total_users: number; new_today: number; new_this_week: number; new_this_month: number;
  total_listings: number; active_listings: number; sold_listings: number;
  listings_today: number; listings_this_week: number;
  pending_credits: number; completed_credits: number; total_revenue: number;
};

type Pt = { label: string; value: number };

type RUser = { id: string; name: string; email?: string; phone?: string; location?: string; created_at: string };
type RListing = { id: string; title: string; status: string; created_at: string; seller_name: string; seller_phone?: string; category_name?: string };

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n: number) => new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(n);

const ago = (iso: string) => {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 60) return `${m}m`;
  if (m < 1440) return `${Math.floor(m / 60)}h`;
  return `${Math.floor(m / 1440)}j`;
};

function buckets(dates: string[], days: number): Pt[] {
  const map: Record<string, number> = {};
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    map[d.toISOString().slice(0, 10)] = 0;
  }
  for (const iso of dates) { const k = iso.slice(0, 10); if (k in map) map[k]++; }
  return Object.entries(map).map(([date, value]) => ({ label: date.slice(5), value }));
}

const statusColor = (s: string) =>
  s === 'active' ? Colors.success : s === 'sold' ? '#f59e0b' : s === 'pending' ? Colors.gray400 : Colors.error;
const statusLabel = (s: string) =>
  s === 'active' ? 'Actif' : s === 'sold' ? 'Vendu' : s === 'pending' ? 'Attente' : s;

// ─── Chart: Line ──────────────────────────────────────────────────────────────

function LineChart({ data, color = Colors.primary }: { data: Pt[]; color?: string }) {
  if (data.length < 2) return null;
  const max = Math.max(...data.map(d => d.value), 1);
  const pad = { t: 10, b: 22, l: 4, r: 4 };
  const w = CW - pad.l - pad.r;
  const h = LH - pad.t - pad.b;
  const step = w / (data.length - 1);
  const pts = data.map((d, i) => `${pad.l + i * step},${pad.t + h - (d.value / max) * h}`).join(' ');
  const labelIdx = [0, Math.floor(data.length / 2), data.length - 1];

  return (
    <Svg width={CW} height={LH}>
      {[0, 0.5, 1].map(t => (
        <Line key={t} x1={pad.l} y1={pad.t + h - t * h} x2={CW - pad.r} y2={pad.t + h - t * h}
          stroke="#e2e8f0" strokeWidth={1} />
      ))}
      <Polyline points={pts} fill="none" stroke={color} strokeWidth={2.5}
        strokeLinejoin="round" strokeLinecap="round" />
      {data.map((d, i) => (
        <Circle key={i} cx={pad.l + i * step} cy={pad.t + h - (d.value / max) * h}
          r={d.value > 0 ? 3.5 : 2} fill={d.value > 0 ? color : '#e2e8f0'} />
      ))}
      {labelIdx.map(i => (
        <SvgText key={i} x={pad.l + i * step} y={LH - 4}
          fontSize={9} fill={Colors.gray400} textAnchor="middle">
          {data[i]?.label}
        </SvgText>
      ))}
    </Svg>
  );
}

// ─── Chart: Bar ───────────────────────────────────────────────────────────────

function BarChart({ data, color = '#f59e0b' }: { data: Pt[]; color?: string }) {
  if (!data.length) return null;
  const max = Math.max(...data.map(d => d.value), 1);
  const pad = { t: 8, b: 22 };
  const h = BH - pad.t - pad.b;
  const slot = CW / data.length;
  const bw = Math.max(4, slot * 0.6);
  const labelIdx = [0, Math.floor(data.length / 2), data.length - 1];

  return (
    <Svg width={CW} height={BH}>
      {data.map((d, i) => {
        const bh = Math.max(2, (d.value / max) * h);
        const x = i * slot + (slot - bw) / 2;
        const y = pad.t + h - bh;
        return <Rect key={i} x={x} y={y} width={bw} height={bh} rx={3} fill={color} opacity={0.85} />;
      })}
      {labelIdx.map(i => (
        <SvgText key={i} x={i * slot + slot / 2} y={BH - 5}
          fontSize={9} fill={Colors.gray400} textAnchor="middle">
          {data[i]?.label}
        </SvgText>
      ))}
    </Svg>
  );
}

// ─── Chart: Donut ─────────────────────────────────────────────────────────────

function DonutChart({ slices }: { slices: { value: number; color: string; label: string }[] }) {
  const total = slices.reduce((s, x) => s + x.value, 0) || 1;
  const r = 44; const ir = 26; const cx = 56; const cy = 56;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  let angle = -90;

  const paths = slices.map(s => {
    const sweep = (s.value / total) * 360;
    const a1 = toRad(angle); const a2 = toRad(angle + sweep);
    const x1o = cx + r * Math.cos(a1); const y1o = cy + r * Math.sin(a1);
    const x2o = cx + r * Math.cos(a2); const y2o = cy + r * Math.sin(a2);
    const x1i = cx + ir * Math.cos(a2); const y1i = cy + ir * Math.sin(a2);
    const x2i = cx + ir * Math.cos(a1); const y2i = cy + ir * Math.sin(a1);
    const large = sweep > 180 ? 1 : 0;
    const d = `M ${x1o} ${y1o} A ${r} ${r} 0 ${large} 1 ${x2o} ${y2o} L ${x1i} ${y1i} A ${ir} ${ir} 0 ${large} 0 ${x2i} ${y2i} Z`;
    angle += sweep;
    return { d, color: s.color };
  });

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
      <Svg width={112} height={112}>
        {paths.map((p, i) => <Path key={i} d={p.d} fill={p.color} />)}
      </Svg>
      <View style={{ gap: 8, flex: 1 }}>
        {slices.map((s, i) => (
          <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: s.color }} />
            <Text style={styles.legendLabel}>{s.label}</Text>
            <Text style={styles.legendValue}>{fmt(s.value)}</Text>
            <Text style={styles.legendPct}>({Math.round((s.value / total) * 100)}%)</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────

function Paginator({ page, total, onPrev, onNext }: { page: number; total: number; onPrev: () => void; onNext: () => void }) {
  const pages = Math.ceil(total / PAGE_SIZE);
  if (pages <= 1) return null;
  return (
    <View style={styles.paginator}>
      <TouchableOpacity onPress={onPrev} disabled={page === 0} style={[styles.pageBtn, page === 0 && styles.pageBtnDisabled]}>
        <ChevronLeft size={16} color={page === 0 ? Colors.gray300 : Colors.gray700} strokeWidth={2} />
      </TouchableOpacity>
      <Text style={styles.pageText}>{page + 1} / {pages}</Text>
      <TouchableOpacity onPress={onNext} disabled={page >= pages - 1} style={[styles.pageBtn, page >= pages - 1 && styles.pageBtnDisabled]}>
        <ChevronRight size={16} color={page >= pages - 1 ? Colors.gray300 : Colors.gray700} strokeWidth={2} />
      </TouchableOpacity>
    </View>
  );
}

// ─── Section header ───────────────────────────────────────────────────────────

function SectionHeader({ title, count }: { title: string; count?: number }) {
  return (
    <View style={styles.sectionHeaderRow}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {count !== undefined && (
        <View style={styles.badge}><Text style={styles.badgeText}>{count}</Text></View>
      )}
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function AdminDashboardScreen() {
  const router = useRouter();
  const { session, isAdmin, loading } = useAuth();

  const [stats, setStats] = useState<Stats | null>(null);
  const [allUsers, setAllUsers] = useState<RUser[]>([]);
  const [allListings, setAllListings] = useState<RListing[]>([]);
  const [userDates, setUserDates] = useState<string[]>([]);
  const [listingDates, setListingDates] = useState<string[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userPage, setUserPage] = useState(0);
  const [listingPage, setListingPage] = useState(0);

  useEffect(() => {
    if (loading) return;
    if (!session) { router.replace('/auth/login'); return; }
    if (!isAdmin) { router.replace('/(tabs)/profile'); }
  }, [loading, session, isAdmin, router]);

  const fetchAll = useCallback(async () => {
    try {
      setError(null);
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const week = new Date(now.getTime() - 7 * 86400000).toISOString();
      const month = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const month30 = new Date(now.getTime() - 30 * 86400000).toISOString();

      const [
        { count: totalUsers },
        { count: newToday },
        { count: newWeek },
        { count: newMonth },
        { data: usersData },
        { count: totalListings },
        { count: activeListings },
        { count: soldListings },
        { count: listingsToday },
        { count: listingsWeek },
        { data: listingsData },
        { data: creditData },
        { data: userDatesData },
        { data: listingDatesData },
      ] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('users').select('*', { count: 'exact', head: true }).gte('created_at', today),
        supabase.from('users').select('*', { count: 'exact', head: true }).gte('created_at', week),
        supabase.from('users').select('*', { count: 'exact', head: true }).gte('created_at', month),
        supabase.from('users').select('id,name,email,phone,location,created_at').order('created_at', { ascending: false }),
        supabase.from('listings').select('*', { count: 'exact', head: true }),
        supabase.from('listings').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('listings').select('*', { count: 'exact', head: true }).eq('status', 'sold'),
        supabase.from('listings').select('*', { count: 'exact', head: true }).gte('created_at', today),
        supabase.from('listings').select('*', { count: 'exact', head: true }).gte('created_at', week),
        supabase.from('listings').select('id,title,status,created_at,seller_id,users!listings_seller_id_fkey(name,phone),categories(name)').order('created_at', { ascending: false }),
        supabase.from('credit_purchases').select('status,amount'),
        supabase.from('users').select('created_at').gte('created_at', month30),
        supabase.from('listings').select('created_at').gte('created_at', month30),
      ]);

      const pending = creditData?.filter(c => c.status === 'pending').length ?? 0;
      const completed = creditData?.filter(c => c.status === 'completed').length ?? 0;
      const revenue = creditData?.filter(c => c.status === 'completed').reduce((s, c) => s + (c.amount ?? 0), 0) ?? 0;

      setStats({
        total_users: totalUsers ?? 0, new_today: newToday ?? 0,
        new_this_week: newWeek ?? 0, new_this_month: newMonth ?? 0,
        total_listings: totalListings ?? 0, active_listings: activeListings ?? 0,
        sold_listings: soldListings ?? 0, listings_today: listingsToday ?? 0,
        listings_this_week: listingsWeek ?? 0,
        pending_credits: pending, completed_credits: completed, total_revenue: revenue,
      });

      setAllUsers((usersData ?? []) as RUser[]);
      setAllListings((listingsData ?? []).map((l: any) => ({
        id: l.id, title: l.title, status: l.status, created_at: l.created_at,
        seller_name: l.users?.name ?? 'Inconnu', seller_phone: l.users?.phone,
        category_name: l.categories?.name,
      })));
      setUserDates((userDatesData ?? []).map((u: any) => u.created_at));
      setListingDates((listingDatesData ?? []).map((l: any) => l.created_at));
    } catch (err: any) {
      setError(err?.message ?? 'Erreur de chargement.');
    } finally {
      setIsFetching(false);
    }
  }, []);

  useEffect(() => {
    if (!loading && session && isAdmin) void fetchAll();
  }, [loading, session, isAdmin, fetchAll]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchAll();
    setRefreshing(false);
  }, [fetchAll]);

  const userChartData = buckets(userDates, 30);
  const listingChartData = buckets(listingDates, 30);

  const pagedUsers = allUsers.slice(userPage * PAGE_SIZE, (userPage + 1) * PAGE_SIZE);
  const pagedListings = allListings.slice(listingPage * PAGE_SIZE, (listingPage + 1) * PAGE_SIZE);

  if (loading || isFetching) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loaderText}>Chargement...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <ArrowLeft size={22} color={Colors.gray800} strokeWidth={2} />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Vue d'ensemble</Text>
            <Text style={styles.headerSub}>Tableau de bord admin</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
          showsVerticalScrollIndicator={false}
        >
          {error ? (
            <View style={styles.errorBox}>
              <AlertCircle size={16} color="#b91c1c" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* ── KPI CARDS ─────────────────────────────────────────────────── */}
          <View style={styles.kpiGrid}>
            <View style={[styles.kpiCard, { borderTopColor: Colors.primary }]}>
              <Users size={18} color={Colors.primary} strokeWidth={2} />
              <Text style={styles.kpiValue}>{fmt(stats?.total_users ?? 0)}</Text>
              <Text style={styles.kpiLabel}>Utilisateurs</Text>
            </View>
            <View style={[styles.kpiCard, { borderTopColor: '#f59e0b' }]}>
              <FileText size={18} color="#f59e0b" strokeWidth={2} />
              <Text style={styles.kpiValue}>{fmt(stats?.total_listings ?? 0)}</Text>
              <Text style={styles.kpiLabel}>Annonces</Text>
            </View>
            <View style={[styles.kpiCard, { borderTopColor: '#16a34a' }]}>
              <BadgeDollarSign size={18} color="#16a34a" strokeWidth={2} />
              <Text style={styles.kpiValue}>{fmt(stats?.total_revenue ?? 0)}</Text>
              <Text style={styles.kpiLabel}>Revenu CDF</Text>
            </View>
            <View style={[styles.kpiCard, { borderTopColor: '#7c3aed' }]}>
              <CreditCard size={18} color="#7c3aed" strokeWidth={2} />
              <Text style={styles.kpiValue}>{stats?.pending_credits ?? 0}</Text>
              <Text style={styles.kpiLabel}>Crédits att.</Text>
            </View>
          </View>

          {/* ── GROWTH STRIP ──────────────────────────────────────────────── */}
          <View style={styles.stripRow}>
            {[
              { label: "Nouveaux aujourd'hui", value: `+${stats?.new_today ?? 0}`, color: Colors.primary },
              { label: 'Cette semaine', value: `+${stats?.new_this_week ?? 0}`, color: '#0ea5e9' },
              { label: 'Ce mois', value: `+${stats?.new_this_month ?? 0}`, color: '#7c3aed' },
            ].map(s => (
              <View key={s.label} style={styles.strip}>
                <Text style={[styles.stripValue, { color: s.color }]}>{s.value}</Text>
                <Text style={styles.stripLabel}>{s.label}</Text>
              </View>
            ))}
          </View>

          {/* ── USER GROWTH CHART ─────────────────────────────────────────── */}
          <SectionHeader title="📈 Croissance utilisateurs — 30 jours" />
          <View style={styles.chartCard}>
            <LineChart data={userChartData} color={Colors.primary} />
          </View>

          {/* ── LISTINGS CHART ────────────────────────────────────────────── */}
          <SectionHeader title="📦 Annonces publiées — 30 jours" />
          <View style={styles.chartCard}>
            <BarChart data={listingChartData} color="#f59e0b" />
          </View>

          {/* ── LISTINGS DONUT ────────────────────────────────────────────── */}
          <SectionHeader title="📊 Répartition des annonces" />
          <View style={styles.chartCard}>
            <DonutChart slices={[
              { value: stats?.active_listings ?? 0, color: Colors.success, label: 'Actives' },
              { value: stats?.sold_listings ?? 0, color: '#f59e0b', label: 'Vendues' },
              { value: Math.max(0, (stats?.total_listings ?? 0) - (stats?.active_listings ?? 0) - (stats?.sold_listings ?? 0)), color: Colors.gray300, label: 'Autres' },
            ]} />
          </View>

          {/* ── CREDITS DONUT ─────────────────────────────────────────────── */}
          <SectionHeader title="💳 Statut des crédits" />
          <View style={styles.chartCard}>
            <DonutChart slices={[
              { value: stats?.completed_credits ?? 0, color: '#16a34a', label: 'Validés' },
              { value: stats?.pending_credits ?? 0, color: '#f59e0b', label: 'En attente' },
            ]} />
          </View>

          {/* ── USERS TABLE ───────────────────────────────────────────────── */}
          <SectionHeader title="🆕 Tous les membres" count={allUsers.length} />
          <View style={styles.table}>
            {pagedUsers.map((u, i) => (
              <View key={u.id} style={[styles.row, i === pagedUsers.length - 1 && styles.rowLast]}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{(u.name || '?')[0].toUpperCase()}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowPrimary} numberOfLines={1}>{u.name}</Text>
                  <Text style={styles.rowSecondary} numberOfLines={1}>
                    {u.phone || u.email || '—'}{u.location ? ` · ${u.location}` : ''}
                  </Text>
                </View>
                <View style={styles.rowRight}>
                  <Clock size={10} color={Colors.gray400} strokeWidth={2} />
                  <Text style={styles.rowTime}>{ago(u.created_at)}</Text>
                </View>
              </View>
            ))}
          </View>
          <Paginator page={userPage} total={allUsers.length}
            onPrev={() => setUserPage(p => Math.max(0, p - 1))}
            onNext={() => setUserPage(p => p + 1)} />

          {/* ── LISTINGS TABLE ────────────────────────────────────────────── */}
          <SectionHeader title="📋 Toutes les annonces" count={allListings.length} />
          <View style={styles.table}>
            {pagedListings.map((l, i) => (
              <View key={l.id} style={[styles.row, i === pagedListings.length - 1 && styles.rowLast]}>
                <View style={[styles.avatar, { backgroundColor: '#fef3c7' }]}>
                  <Tag size={13} color="#f59e0b" strokeWidth={2} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowPrimary} numberOfLines={1}>{l.title}</Text>
                  <Text style={styles.rowSecondary} numberOfLines={1}>
                    {l.seller_name}{l.seller_phone ? ` · ${l.seller_phone}` : ''}{l.category_name ? ` · ${l.category_name}` : ''}
                  </Text>
                </View>
                <View style={styles.rowRight}>
                  <View style={[styles.dot, { backgroundColor: statusColor(l.status) }]} />
                  <Text style={[styles.statusText, { color: statusColor(l.status) }]}>{statusLabel(l.status)}</Text>
                  <Text style={styles.rowTime}>{ago(l.created_at)}</Text>
                </View>
              </View>
            ))}
          </View>
          <Paginator page={listingPage} total={allListings.length}
            onPrev={() => setListingPage(p => Math.max(0, p - 1))}
            onNext={() => setListingPage(p => p + 1)} />

          <View style={{ height: 48 }} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.gray50 },
  container: { flex: 1 },
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loaderText: { fontSize: 14, color: Colors.gray500 },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.gray100,
  },
  headerTitle: { fontSize: 17, fontWeight: '700', color: Colors.gray900, textAlign: 'center' },
  headerSub: { fontSize: 11, color: Colors.gray500, textAlign: 'center', marginTop: 1 },

  content: { padding: 16, gap: 14 },

  errorBox: {
    backgroundColor: Colors.errorLight, borderColor: '#fecaca', borderWidth: 1,
    borderRadius: 10, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 8,
  },
  errorText: { flex: 1, color: '#991b1b', fontSize: 13 },

  // KPI grid
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  kpiCard: {
    flex: 1, minWidth: '45%', backgroundColor: '#fff',
    borderRadius: 12, borderWidth: 1, borderColor: Colors.border,
    borderTopWidth: 3, padding: 14, alignItems: 'center', gap: 4,
  },
  kpiValue: { fontSize: 22, fontWeight: '800', color: Colors.gray900 },
  kpiLabel: { fontSize: 11, color: Colors.gray500, textAlign: 'center' },

  // Growth strip
  stripRow: { flexDirection: 'row', gap: 8 },
  strip: {
    flex: 1, backgroundColor: '#fff', borderRadius: 10,
    borderWidth: 1, borderColor: Colors.border, padding: 10, alignItems: 'center',
  },
  stripValue: { fontSize: 17, fontWeight: '800' },
  stripLabel: { fontSize: 10, color: Colors.gray500, marginTop: 2, textAlign: 'center' },

  // Chart card
  chartCard: {
    backgroundColor: '#fff', borderRadius: 12,
    borderWidth: 1, borderColor: Colors.border,
    padding: 16, alignItems: 'center',
  },

  // Section header
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: Colors.gray900 },
  badge: {
    backgroundColor: Colors.primary, borderRadius: 10,
    paddingHorizontal: 7, paddingVertical: 2,
  },
  badgeText: { fontSize: 11, fontWeight: '700', color: '#fff' },

  // Legend (donut)
  legendLabel: { fontSize: 12, color: Colors.gray700, flex: 1 },
  legendValue: { fontSize: 12, fontWeight: '700', color: Colors.gray900 },
  legendPct: { fontSize: 11, color: Colors.gray400 },

  // Table
  table: {
    backgroundColor: '#fff', borderRadius: 12,
    borderWidth: 1, borderColor: Colors.border, overflow: 'hidden',
  },
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 10, gap: 10,
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  rowLast: { borderBottomWidth: 0 },
  avatar: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: Colors.primary + '18',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 14, fontWeight: '700', color: Colors.primary },
  rowPrimary: { fontSize: 13, fontWeight: '600', color: Colors.gray900 },
  rowSecondary: { fontSize: 11, color: Colors.gray500, marginTop: 1 },
  rowRight: { alignItems: 'flex-end', gap: 3 },
  rowTime: { fontSize: 10, color: Colors.gray400 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 10, fontWeight: '600' },

  // Pagination
  paginator: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16,
    paddingVertical: 10,
  },
  pageBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#fff', borderWidth: 1, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  pageBtnDisabled: { backgroundColor: Colors.gray50, borderColor: Colors.borderLight },
  pageText: { fontSize: 13, fontWeight: '600', color: Colors.gray700 },
});
