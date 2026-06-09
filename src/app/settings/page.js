'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  QrCode, 
  RefreshCw, 
  Wifi, 
  WifiOff, 
  AlertCircle
} from 'lucide-react';

// Import modular settings subcomponents
import GatewayConsole from '@/components/settings/GatewayConsole';
import SetupGuide from '@/components/settings/SetupGuide';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('whatsapp'); // 'whatsapp' | 'email'
  
  // WhatsApp Gateway State
  const [gateway, setGateway] = useState({
    status: 'disconnected',
    qr_code: '',
    connected_phone: '',
    error_message: '',
  });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [smtp, setSmtp] = useState({
    smtp_host: process.env.NEXT_PUBLIC_SMTP_HOST || 'smtp.gmail.com',
    smtp_port: process.env.NEXT_PUBLIC_SMTP_PORT || '587',
    smtp_user: process.env.NEXT_PUBLIC_SMTP_USER || 'ordinarylancer@gmail.com',
    smtp_pass: '',
    smtp_secure: process.env.NEXT_PUBLIC_SMTP_SECURE === 'true',
    sender_name: process.env.NEXT_PUBLIC_SENDER_NAME || 'ordinary CRM',
    sender_email: process.env.NEXT_PUBLIC_SENDER_EMAIL || 'ordinarylancer@gmail.com',
  });
  const [smtpSaving, setSmtpSaving] = useState(false);
  const [smtpStatusMsg, setSmtpStatusMsg] = useState('');
  const [smtpTesting, setSmtpTesting] = useState(false);

  // Sheets Webhook Sync State
  const [sheetsSync, setSheetsSync] = useState({
    webhook_url: '',
    enabled: false,
  });
  const [sheetsSaving, setSheetsSaving] = useState(false);
  const [sheetsStatusMsg, setSheetsStatusMsg] = useState('');
  const [sheetsTesting, setSheetsTesting] = useState(false);

  // Terminal commands copying
  const [copiedCmd, setCopiedCmd] = useState(false);

  const fetchGatewayStatus = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      let { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('business_name', 'SYSTEM_WHATSAPP_GATEWAY')
        .maybeSingle();
        
      if (error) throw error;
      
      // Auto-insert row if missing
      if (!data) {
        console.log("SYSTEM_WHATSAPP_GATEWAY row missing. Auto-creating gateway record...");
        const { data: newRows, error: insertError } = await supabase
          .from('clients')
          .insert({
            business_name: 'SYSTEM_WHATSAPP_GATEWAY',
            owner_name: 'SYSTEM',
            phone_number: 'SYSTEM',
            category: 'SYSTEM',
            status: 'disconnected',
            notes: JSON.stringify({ status: 'disconnected', updated_at: new Date().toISOString() })
          })
          .select();
          
        if (insertError) {
          console.error("Auto-creation of gateway row failed:", insertError.message);
        } else if (newRows && newRows.length > 0) {
          data = newRows[0];
        }
      }
      
      if (data) {
        let parsedNotes = {};
        if (data.notes) {
          try {
            parsedNotes = JSON.parse(data.notes);
          } catch (e) {
            // Notes not JSON
          }
        }
        
        setGateway({
          status: data.status || parsedNotes.status || 'disconnected',
          qr_code: data.qr_code || parsedNotes.qr_code || '',
          connected_phone: data.connected_phone || parsedNotes.connected_phone || '',
          error_message: data.error_message || parsedNotes.error_message || '',
        });
      }
      setError(null);
    } catch (err) {
      console.error('Error fetching gateway status:', err);
      setError('Failed to fetch gateway status. Ensure system row is inserted.');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const fetchSmtpStatus = async () => {
    try {
      let { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('business_name', 'SYSTEM_EMAIL_GATEWAY')
        .maybeSingle();
        
      if (error) throw error;
      
      // Auto-insert row if missing
      if (!data) {
        console.log("SYSTEM_EMAIL_GATEWAY row missing. Auto-creating gateway record...");
        const { data: newRows, error: insertError } = await supabase
          .from('clients')
          .insert({
            business_name: 'SYSTEM_EMAIL_GATEWAY',
            owner_name: 'SYSTEM',
            phone_number: 'SYSTEM',
            category: 'SYSTEM',
            status: 'disconnected',
            notes: JSON.stringify({ 
              smtp_host: process.env.NEXT_PUBLIC_SMTP_HOST || 'smtp.gmail.com',
              smtp_port: process.env.NEXT_PUBLIC_SMTP_PORT || '587',
              smtp_user: process.env.NEXT_PUBLIC_SMTP_USER || 'ordinarylancer@gmail.com',
              smtp_pass: '',
              smtp_secure: process.env.NEXT_PUBLIC_SMTP_SECURE === 'true',
              sender_name: process.env.NEXT_PUBLIC_SENDER_NAME || 'ordinary CRM',
              sender_email: process.env.NEXT_PUBLIC_SENDER_EMAIL || 'ordinarylancer@gmail.com',
              updated_at: new Date().toISOString() 
            })
          })
          .select();
          
        if (insertError) {
          console.error("Auto-creation of email gateway row failed:", insertError.message);
        } else if (newRows && newRows.length > 0) {
          data = newRows[0];
        }
      }
      
      if (data && data.notes) {
        try {
          const parsed = JSON.parse(data.notes);
          setSmtp({
            smtp_host: parsed.smtp_host || process.env.NEXT_PUBLIC_SMTP_HOST || 'smtp.gmail.com',
            smtp_port: parsed.smtp_port || process.env.NEXT_PUBLIC_SMTP_PORT || '587',
            smtp_user: parsed.smtp_user || process.env.NEXT_PUBLIC_SMTP_USER || 'ordinarylancer@gmail.com',
            smtp_pass: parsed.smtp_pass || '',
            smtp_secure: parsed.smtp_secure !== undefined ? parsed.smtp_secure : (process.env.NEXT_PUBLIC_SMTP_SECURE === 'true'),
            sender_name: parsed.sender_name || process.env.NEXT_PUBLIC_SENDER_NAME || 'ordinary CRM',
            sender_email: parsed.sender_email || process.env.NEXT_PUBLIC_SENDER_EMAIL || 'ordinarylancer@gmail.com',
          });
        } catch (e) {
          // not JSON
        }
      }
    } catch (err) {
      console.error('Error fetching SMTP status:', err);
    }
  };

  const fetchSheetsSyncStatus = async () => {
    try {
      let { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('business_name', 'SYSTEM_EXCEL_SYNC')
        .maybeSingle();
        
      if (error) throw error;
      
      if (!data) {
        console.log("SYSTEM_EXCEL_SYNC row missing. Auto-creating sheets sync record...");
        const { data: newRows, error: insertError } = await supabase
          .from('clients')
          .insert({
            business_name: 'SYSTEM_EXCEL_SYNC',
            owner_name: 'SYSTEM',
            phone_number: 'SYSTEM',
            category: 'SYSTEM',
            status: 'disconnected',
            notes: JSON.stringify({ 
              webhook_url: '',
              enabled: false,
              updated_at: new Date().toISOString() 
            })
          })
          .select();
          
        if (insertError) {
          console.error("Auto-creation of sheets sync row failed:", insertError.message);
        } else if (newRows && newRows.length > 0) {
          data = newRows[0];
        }
      }
      
      if (data && data.notes) {
        try {
          const parsed = JSON.parse(data.notes);
          setSheetsSync({
            webhook_url: parsed.webhook_url || '',
            enabled: parsed.enabled || false,
          });
        } catch (e) {
          // not JSON
        }
      }
    } catch (err) {
      console.error('Error fetching Sheets sync status:', err);
    }
  };

  useEffect(() => {
    fetchGatewayStatus(true);
    fetchSmtpStatus();
    fetchSheetsSyncStatus();
    
    const interval = setInterval(() => {
      fetchGatewayStatus(false);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const handleGenerateQR = async () => {
    try {
      setActionLoading(true);
      
      const payload = {
        status: 'connecting',
        notes: JSON.stringify({ 
          connect_requested: true, 
          status: 'connecting', 
          qr_code: null,
          error_message: null,
          updated_at: new Date().toISOString() 
        })
      };

      const { error: updateError } = await supabase
        .from('clients')
        .update(payload)
        .eq('business_name', 'SYSTEM_WHATSAPP_GATEWAY');
        
      if (updateError) throw updateError;
      
      await supabase.from('activity_logs').insert({
        action_type: 'Gateway Request',
        details: 'Sent connection initialization request to local worker.'
      });

      setGateway(prev => ({
        ...prev,
        status: 'connecting',
        qr_code: '',
        error_message: ''
      }));
      
      await fetchGatewayStatus(false);
    } catch (err) {
      console.error('Error starting gateway link:', err);
      alert('Failed to request connection link.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect your WhatsApp Session? This will close the local web socket and log out.')) {
      return;
    }
    
    try {
      setActionLoading(true);
      
      const payload = {
        status: 'disconnected',
        notes: JSON.stringify({ 
          logout_requested: true, 
          status: 'disconnected', 
          qr_code: null,
          connected_phone: null,
          error_message: null,
          updated_at: new Date().toISOString() 
        })
      };

      const { error: updateError } = await supabase
        .from('clients')
        .update(payload)
        .eq('business_name', 'SYSTEM_WHATSAPP_GATEWAY');
        
      if (updateError) throw updateError;

      await supabase.from('activity_logs').insert({
        action_type: 'Gateway Disconnect',
        details: 'Requested session log out and terminal socket shutdown.'
      });

      setGateway({
        status: 'disconnected',
        qr_code: '',
        connected_phone: '',
        error_message: '',
      });
    } catch (err) {
      console.error('Error disconnecting gateway:', err);
      alert('Failed to close session.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveSmtp = async (e) => {
    if (e) e.preventDefault();
    try {
      setSmtpSaving(true);
      setSmtpStatusMsg('');
      
      const payload = {
        status: 'connected',
        notes: JSON.stringify({
          ...smtp,
          updated_at: new Date().toISOString()
        })
      };
      
      const { error } = await supabase
        .from('clients')
        .update(payload)
        .eq('business_name', 'SYSTEM_EMAIL_GATEWAY');
        
      if (error) throw error;
      
      setSmtpStatusMsg('SMTP Settings saved successfully.');
      
      await supabase.from('activity_logs').insert({
        action_type: 'Gateway Connected',
        details: 'Email Gateway settings updated.'
      });
    } catch (err) {
      console.error('Error saving SMTP settings:', err);
      setSmtpStatusMsg('Failed to save SMTP settings: ' + err.message);
    } finally {
      setSmtpSaving(false);
    }
  };

  const handleTestSmtp = async (recipientEmail) => {
    if (!recipientEmail || !recipientEmail.trim()) {
      alert("Please enter a valid recipient email address.");
      return;
    }
    
    try {
      setSmtpTesting(true);
      setSmtpStatusMsg('Sending test request to background worker...');
      
      // Save current fields and set request flags
      const payload = {
        status: 'connecting',
        notes: JSON.stringify({
          ...smtp,
          test_connection_requested: true,
          test_recipient: recipientEmail,
          test_connection_status: 'pending',
          error_message: null,
          updated_at: new Date().toISOString()
        })
      };
      
      const { error: updateError } = await supabase
        .from('clients')
        .update(payload)
        .eq('business_name', 'SYSTEM_EMAIL_GATEWAY');
        
      if (updateError) throw updateError;
      
      // Start polling for test connection results
      let checkCount = 0;
      const checkInterval = setInterval(async () => {
        checkCount += 1;
        
        const { data, error } = await supabase
          .from('clients')
          .select('notes')
          .eq('business_name', 'SYSTEM_EMAIL_GATEWAY')
          .maybeSingle();
          
        if (!error && data && data.notes) {
          try {
            const parsed = JSON.parse(data.notes);
            if (parsed.test_connection_status === 'success') {
              clearInterval(checkInterval);
              setSmtpStatusMsg('Success! SMTP connection is verified and test email was delivered.');
              setSmtpTesting(false);
            } else if (parsed.test_connection_status === 'failed') {
              clearInterval(checkInterval);
              setSmtpStatusMsg(`SMTP test failed: ${parsed.error_message || 'Unknown SMTP error'}`);
              setSmtpTesting(false);
            }
          } catch (e) {
            // parse error
          }
        }
        
        if (checkCount >= 10) {
          // Timeout after 30 seconds (10 checks * 3 seconds)
          clearInterval(checkInterval);
          setSmtpStatusMsg('SMTP test request timed out. Make sure your local background worker is running.');
          setSmtpTesting(false);
        }
      }, 3000);
      
    } catch (err) {
      console.error('Error testing SMTP:', err);
      setSmtpStatusMsg('Failed to dispatch test request: ' + err.message);
      setSmtpTesting(false);
    }
  };

  const handleSaveSheetsSync = async (e) => {
    if (e) e.preventDefault();
    try {
      setSheetsSaving(true);
      setSheetsStatusMsg('');
      
      const payload = {
        status: sheetsSync.enabled ? 'connected' : 'disconnected',
        notes: JSON.stringify({
          webhook_url: sheetsSync.webhook_url.trim(),
          enabled: sheetsSync.enabled,
          updated_at: new Date().toISOString()
        })
      };
      
      const { error } = await supabase
        .from('clients')
        .update(payload)
        .eq('business_name', 'SYSTEM_EXCEL_SYNC');
        
      if (error) throw error;
      
      setSheetsStatusMsg('Sheets/Excel Sync Settings saved successfully.');
      
      await supabase.from('activity_logs').insert({
        action_type: 'Sync Settings Updated',
        details: `Google Sheets/Excel Sync has been ${sheetsSync.enabled ? 'enabled' : 'disabled'}.`
      });
    } catch (err) {
      console.error('Error saving Sheets sync settings:', err);
      setSheetsStatusMsg('Failed to save settings: ' + err.message);
    } finally {
      setSheetsSaving(false);
    }
  };

  const handleTestSheetsSync = async () => {
    if (!sheetsSync.webhook_url || !sheetsSync.webhook_url.trim()) {
      alert("Please enter a valid Webhook URL first.");
      return;
    }
    
    try {
      setSheetsTesting(true);
      setSheetsStatusMsg('Sending test webhook trigger to background worker...');
      
      const payload = {
        notes: JSON.stringify({
          webhook_url: sheetsSync.webhook_url.trim(),
          enabled: sheetsSync.enabled,
          test_webhook_requested: true,
          test_webhook_status: 'pending',
          error_message: null,
          updated_at: new Date().toISOString()
        })
      };
      
      const { error: updateError } = await supabase
        .from('clients')
        .update(payload)
        .eq('business_name', 'SYSTEM_EXCEL_SYNC');
        
      if (updateError) throw updateError;
      
      let checkCount = 0;
      const checkInterval = setInterval(async () => {
        checkCount += 1;
        
        const { data, error } = await supabase
          .from('clients')
          .select('notes')
          .eq('business_name', 'SYSTEM_EXCEL_SYNC')
          .maybeSingle();
          
        if (!error && data && data.notes) {
          try {
            const parsed = JSON.parse(data.notes);
            if (parsed.test_webhook_status === 'success') {
              clearInterval(checkInterval);
              setSheetsStatusMsg('Success! Webhook triggered and response verified by local worker.');
              setSheetsTesting(false);
            } else if (parsed.test_webhook_status === 'failed') {
              clearInterval(checkInterval);
              setSheetsStatusMsg(`Webhook test failed: ${parsed.error_message || 'Unknown connection error'}`);
              setSheetsTesting(false);
            }
          } catch (e) {
            // parse error
          }
        }
        
        if (checkCount >= 10) {
          clearInterval(checkInterval);
          setSheetsStatusMsg('Webhook test request timed out. Make sure your local background worker is running.');
          setSheetsTesting(false);
        }
      }, 3000);
      
    } catch (err) {
      console.error('Error testing Webhook:', err);
      setSheetsStatusMsg('Failed to dispatch test request: ' + err.message);
      setSheetsTesting(false);
    }
  };

  const handleCopyCommand = () => {
    navigator.clipboard.writeText('npm run whatsapp-worker');
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  const getStatusLabelDetails = (status) => {
    switch (status) {
      case 'connected':
        return {
          title: 'Connected',
          description: 'Ready to send messages.',
          badgeColor: 'bg-emerald-500',
          textColor: 'text-emerald-800 dark:text-emerald-450',
          panelBg: 'bg-emerald-50/20 border-emerald-100 dark:bg-emerald-950/10 dark:border-emerald-900/30',
          icon: Wifi
        };
      case 'qr_ready':
        return {
          title: 'QR Code Ready',
          description: 'Scan code with WhatsApp Link Device.',
          badgeColor: 'bg-blue-500 animate-pulse',
          textColor: 'text-blue-800 dark:text-blue-400',
          panelBg: 'bg-blue-50/20 border-blue-100 dark:bg-blue-950/10 dark:border-blue-900/30',
          icon: QrCode
        };
      case 'connecting':
        return {
          title: 'Connecting...',
          description: 'Waiting for local background worker initialization.',
          badgeColor: 'bg-amber-500 animate-pulse',
          textColor: 'text-amber-800 dark:text-amber-400',
          panelBg: 'bg-amber-50/20 border-amber-100 dark:bg-amber-950/10 dark:border-amber-900/30',
          icon: RefreshCw
        };
      case 'disconnected':
      default:
        return {
          title: 'Disconnected',
          description: 'WhatsApp Gateway integration is offline.',
          badgeColor: 'bg-slate-400 dark:bg-slate-600',
          textColor: 'text-slate-700 dark:text-slate-355',
          panelBg: 'bg-slate-50 border-slate-200 dark:bg-slate-900 dark:border-slate-800',
          icon: WifiOff
        };
    }
  };

  const statusDetails = getStatusLabelDetails(gateway.status);

  return (
    <div className="flex-1 p-6 md:p-8 space-y-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">Gateway Configuration</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Configure your local WhatsApp automation node and SMTP Email relay integrations.</p>
      </div>

      {error && (
        <div className="flex items-center space-x-3 p-4 bg-amber-50 dark:bg-amber-955/20 border border-amber-205 dark:border-amber-900/30 rounded-xl text-amber-850 dark:text-amber-400">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Connection Status Panel Component */}
        <div className="lg:col-span-2">
          <GatewayConsole
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            gateway={gateway}
            loading={loading}
            actionLoading={actionLoading}
            onRefresh={fetchGatewayStatus}
            onGenerateQR={handleGenerateQR}
            onDisconnect={handleDisconnect}
            statusDetails={statusDetails}
            
            // SMTP props
            smtp={smtp}
            setSmtp={setSmtp}
            smtpSaving={smtpSaving}
            smtpStatusMsg={smtpStatusMsg}
            setSmtpStatusMsg={setSmtpStatusMsg}
            onSaveSmtp={handleSaveSmtp}
            onTestSmtp={handleTestSmtp}
            smtpTesting={smtpTesting}

            // Sheets sync props
            sheetsSync={sheetsSync}
            setSheetsSync={setSheetsSync}
            sheetsSaving={sheetsSaving}
            sheetsStatusMsg={sheetsStatusMsg}
            setSheetsStatusMsg={setSheetsStatusMsg}
            onSaveSheetsSync={handleSaveSheetsSync}
            onTestSheetsSync={handleTestSheetsSync}
            sheetsTesting={sheetsTesting}
          />
        </div>

        {/* Local Terminal setup card Component */}
        <div>
          <SetupGuide
            copiedCmd={copiedCmd}
            onCopyCmd={handleCopyCommand}
          />
        </div>
      </div>
    </div>
  );
}
