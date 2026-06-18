'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Calendar, AlertCircle, UserPlus } from 'lucide-react';
import Link from 'next/link';

// Import modular dashboard subcomponents
import StatsGrid from '@/components/dashboard/StatsGrid';
import UpcomingQueue from '@/components/dashboard/UpcomingQueue';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalClients: 0,
    pendingTasks: 0,
    sentMessages: 0,
    failedDelivery: 0,
  });
  const [upcomingSchedules, setUpcomingSchedules] = useState([]);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const [
        clientsRes, 
        pendingRes, 
        sentRes, 
        failedRes,
        upcomingRes
      ] = await Promise.all([
        supabase
          .from('clients')
          .select('*', { count: 'exact', head: true })
          .neq('business_name', 'SYSTEM_WHATSAPP_GATEWAY')
          .neq('business_name', 'SYSTEM_EMAIL_GATEWAY')
          .neq('business_name', 'SYSTEM_EXCEL_SYNC'),
        supabase
          .from('outreach_schedules')
          .select('*', { count: 'exact', head: true })
          .in('status', ['Pending', 'Scheduled']),
        supabase
          .from('outreach_schedules')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'Sent'),
        supabase
          .from('outreach_schedules')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'Failed'),
        supabase
          .from('outreach_schedules')
          .select(`
            id,
            schedule_date,
            schedule_time,
            status,
            custom_message,
            client_id,
            template_id,
            clients ( business_name, phone_number ),
            templates ( template_name )
          `)
          .in('status', ['Pending', 'Scheduled'])
          .order('schedule_date', { ascending: true })
          .order('schedule_time', { ascending: true })
          .limit(5)
      ]);

      if (clientsRes.error) throw clientsRes.error;
      if (pendingRes.error) throw pendingRes.error;
      if (sentRes.error) throw sentRes.error;
      if (failedRes.error) throw failedRes.error;
      if (upcomingRes.error) throw upcomingRes.error;

      setStats({
        totalClients: clientsRes.count || 0,
        pendingTasks: pendingRes.count || 0,
        sentMessages: sentRes.count || 0,
        failedDelivery: failedRes.count || 0,
      });

      setUpcomingSchedules(upcomingRes.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard metrics. Please check your Supabase connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="flex-1 p-6 md:p-8 space-y-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Real-time overview of your WhatsApp outreach activities.</p>
        </div>
        <div className="flex space-x-3">
          <Link 
            href="/schedules" 
            className="inline-flex items-center justify-center px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm shadow-sm hover:shadow-md transition-all space-x-2"
          >
            <Calendar className="h-4 w-4" />
            <span>Create Schedule</span>
          </Link>
          <Link 
            href="/clients" 
            className="inline-flex items-center justify-center px-4 py-2.5 bg-white dark:bg-[#111625] hover:bg-slate-50 dark:hover:bg-[#1a2133] text-slate-700 dark:text-slate-200 font-semibold rounded-xl text-sm border border-slate-200 dark:border-slate-800 shadow-sm transition-all space-x-2"
          >
            <UserPlus className="h-4 w-4" />
            <span>Add Client</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="flex items-center space-x-3 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-2xl text-amber-800 dark:text-amber-400 shadow-xs">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {/* Stats Cards Grid Component */}
      <StatsGrid stats={stats} loading={loading} />

      <div className="w-full">
        {/* Upcoming Schedules Table Component */}
        <UpcomingQueue upcomingSchedules={upcomingSchedules} loading={loading} />
      </div>
    </div>
  );
}
