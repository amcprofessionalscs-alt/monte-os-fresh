'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

type Ignition = {
  id: number;
  created_at: string;
  energy: number;
  focus: number;
  mood: string;
  goal: string;
};

const MOOD_EMOJI: Record<string, string> = {
  fired: '??',
  neutral: '??',
  tired: '??',
};

export default function HistoryPage() {
  const [ignitions, setIgnitions] = useState<Ignition[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }
      const { data, error } = await supabase
        .from('ignitions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(30);
      if (!error && data) setIgnitions(data);
      setLoading(false);
    };
    init();
  }, [router]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom, #1e293b, #000)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
        <p style={{ fontSize: '24px' }}>? Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom, #1e293b, #000)', color: 'white', padding: '20px' }}>
      <div style={{ maxWidth: '500px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', paddingTop: '20px' }}>
          <h1 style={{ fontSize: '36px', margin: 0 }}>? Ignition Log</h1>
          <a href="/" style={{ padding: '8px 16px', background: '#374151', color: '#fff', borderRadius: '6px', fontWeight: 'bold', fontSize: '14px', textDecoration: 'none' }}>? Back</a>
        </div>

        {ignitions.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#9ca3af', marginTop: '60px' }}>
            <p style={{ fontSize: '18px' }}>No ignitions yet.</p>
            <a href="/ignite" style={{ color: '#fbbf24' }}>Log your first one ?</a>
          </div>
        ) : (
          ignitions.map(ig => (
            <div key={ig.id} style={{ background: '#1f2937', padding: '20px', borderRadius: '12px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ color: '#fbbf24', fontWeight: 'bold', fontSize: '14px' }}>{formatDate(ig.created_at)}</span>
                <span style={{ fontSize: '20px' }}>{MOOD_EMOJI[ig.mood] || '??'}</span>
              </div>
              <div style={{ display: 'flex', gap: '16px', marginBottom: '12px' }}>
                <div style={{ flex: 1, background: '#374151', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
                  <p style={{ margin: 0, fontSize: '11px', color: '#9ca3af', marginBottom: '4px' }}>ENERGY</p>
                  <p style={{ margin: 0, fontSize: '22px', fontWeight: 'bold', color: '#fbbf24' }}>{ig.energy}</p>
                </div>
                <div style={{ flex: 1, background: '#374151', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
                  <p style={{ margin: 0, fontSize: '11px', color: '#9ca3af', marginBottom: '4px' }}>FOCUS</p>
                  <p style={{ margin: 0, fontSize: '22px', fontWeight: 'bold', color: '#06b6d4' }}>{ig.focus}</p>
                </div>
                <div style={{ flex: 1, background: '#374151', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
                  <p style={{ margin: 0, fontSize: '11px', color: '#9ca3af', marginBottom: '4px' }}>MOOD</p>
                  <p style={{ margin: 0, fontSize: '22px', fontWeight: 'bold', color: '#ec4899', textTransform: 'capitalize' }}>{ig.mood}</p>
                </div>
              </div>
              <div style={{ background: '#374151', borderRadius: '8px', padding: '12px' }}>
                <p style={{ margin: 0, fontSize: '11px', color: '#9ca3af', marginBottom: '4px' }}>GOAL</p>
                <p style={{ margin: 0, fontSize: '14px', color: '#fff' }}>{ig.goal}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
