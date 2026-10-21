import { useState } from 'react';
import { RefreshCw, AlertCircle, Smartphone, Mail, Save, Send, FileSpreadsheet, ExternalLink, Code, Check } from 'lucide-react';

export default function GatewayConsole({
  activeTab,
  setActiveTab,
  gateway,
  loading,
  actionLoading,
  onRefresh,
  onGenerateQR,
  onDisconnect,
  statusDetails,
  
  // SMTP props
  smtp,
  setSmtp,
  smtpSaving,
  smtpStatusMsg,
  setSmtpStatusMsg,
  onSaveSmtp,
  onTestSmtp,
  smtpTesting,

  // Sheets sync props
  sheetsSync,
  setSheetsSync,
  sheetsSaving,
  sheetsStatusMsg,
  setSheetsStatusMsg,
  onSaveSheetsSync,
  onTestSheetsSync,
  sheetsTesting
}) {
  const [testRecipient, setTestRecipient] = useState('');
  const [copiedScript, setCopiedScript] = useState(false);
  const StatusIcon = statusDetails.icon;

  const appsScriptCode = `function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    
    // Auto-create headers if sheet is empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Timestamp", 
        "Business Name", 
        "Owner Name",
        "Phone Number",
        "Email Address",
        "Category",
        "City",
        "Channel", 
        "Status", 
        "Template Name", 
        "Attachments", 
        "Error Details"
      ]);
      sheet.getRange(1, 1, 1, 12).setFontWeight("bold");
    }
    
    // Append row
    sheet.appendRow([
      data.timestamp || new Date(),
      data.business_name || "",
      data.owner_name || "",
      data.phone_number || "",
      data.email || "",
      data.category || "",
      data.city || "",
      data.channel || "whatsapp",
      data.status || "Sent",
      data.message || "",
      data.attachments || "",
      data.error_message || ""
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({ result: "success", received: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({ result: "error", error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`;

  const handleCopyScript = () => {
    navigator.clipboard.writeText(appsScriptCode);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  return (
    <div className="bg-white dark:bg-ink-800 border border-slate-200 dark:border-slate-800/60 rounded-2xl shadow-xs overflow-hidden">
      {/* Header with Tabs */}
      <div className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
        <div className="flex border-b border-slate-100 dark:border-slate-800 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('whatsapp')}
            className={`flex-1 sm:flex-initial flex items-center justify-center space-x-2 py-3.5 sm:py-4 px-4 sm:px-6 font-bold text-sm whitespace-nowrap border-b-2 transition-all shrink-0 ${
              activeTab === 'whatsapp'
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-500 dark:text-indigo-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <Smartphone className="h-4 w-4" />
            <span>WhatsApp Node</span>
          </button>
          <button
            onClick={() => setActiveTab('email')}
            className={`flex-1 sm:flex-initial flex items-center justify-center space-x-2 py-3.5 sm:py-4 px-4 sm:px-6 font-bold text-sm whitespace-nowrap border-b-2 transition-all shrink-0 ${
              activeTab === 'email'
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-500 dark:text-indigo-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <Mail className="h-4 w-4" />
            <span>Email Gateway (SMTP)</span>
          </button>
          <button
            onClick={() => setActiveTab('sheets')}
            className={`flex-1 sm:flex-initial flex items-center justify-center space-x-2 py-3.5 sm:py-4 px-4 sm:px-6 font-bold text-sm whitespace-nowrap border-b-2 transition-all shrink-0 ${
              activeTab === 'sheets'
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-500 dark:text-indigo-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>Excel / Sheets Sync</span>
          </button>
        </div>
      </div>

      {/* Tab Contents */}
      {activeTab === 'whatsapp' && (
        <div>
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg">WhatsApp Connection</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Local node.js background socket status console</p>
            </div>
            <button
              onClick={() => onRefresh(true)}
              disabled={loading}
              className="p-2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Force refresh"
            >
              <RefreshCw className={`h-4.5 w-4.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Dynamic Status Card */}
            <div className={`p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${statusDetails.panelBg} transition-all`}>
              <div className="flex items-center space-x-4">
                <div className={`h-11 w-11 rounded-xl flex items-center justify-center bg-white dark:bg-ink-900 border border-slate-100 dark:border-slate-800 shadow-xs ${statusDetails.textColor}`}>
                  <StatusIcon className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-base">{statusDetails.title}</span>
                    <span className="relative flex h-2 w-2">
                      <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${gateway.status === 'connecting' || gateway.status === 'qr_ready' ? 'animate-ping' : ''} ${statusDetails.badgeColor}`}></span>
                      <span className={`relative inline-flex rounded-full h-2 w-2 ${statusDetails.badgeColor}`}></span>
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{statusDetails.description}</p>
                </div>
              </div>

              <div className="shrink-0 flex items-center space-x-3">
                {gateway.status === 'connected' ? (
                  <button
                    onClick={onDisconnect}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-rose-50 dark:bg-rose-900/20 hover:bg-rose-100 dark:hover:bg-rose-900/30 text-rose-700 dark:text-rose-400 font-bold border border-rose-200 dark:border-rose-900/30 rounded-xl text-xs transition-all shadow-xs"
                  >
                    Disconnect Number
                  </button>
                ) : (
                  <button
                    onClick={onGenerateQR}
                    disabled={actionLoading || gateway.status === 'connecting'}
                    className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-all shadow-sm hover:shadow-md"
                  >
                    {gateway.status === 'qr_ready' ? 'Regenerate QR Code' : 'Generate QR Code'}
                  </button>
                )}
              </div>
            </div>

            {/* QR Code Display */}
            {gateway.status === 'qr_ready' && gateway.qr_code && (
              <div className="flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-ink-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
                <div className="bg-white p-5 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xs">
                  <img 
                    src={gateway.qr_code} 
                    alt="WhatsApp Web QR Code" 
                    className="h-56 w-56 object-contain"
                  />
                </div>
                <div className="text-center mt-4 max-w-xs space-y-1">
                  <span className="font-bold text-slate-700 dark:text-slate-300 text-sm">Scan QR Code</span>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">Open WhatsApp on your phone &gt; Linked Devices &gt; Link a Device, then scan this QR code.</p>
                </div>
              </div>
            )}

            {/* Active Connection Info */}
            {gateway.status === 'connected' && gateway.connected_phone && (
              <div className="p-4 bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-xl space-y-1 text-sm text-slate-700 dark:text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400 dark:text-slate-500 font-semibold">Connected Device:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{gateway.connected_phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 dark:text-slate-500 font-semibold">Active Mode:</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-400">Local Daemon Node</span>
                </div>
              </div>
            )}

            {/* Error Messages */}
            {gateway.error_message && (
              <div className="p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-900/30 rounded-xl flex items-start space-x-3 text-sm text-rose-800 dark:text-rose-400">
                <AlertCircle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-rose-900 dark:text-rose-300">Gateway Error Detected</h4>
                  <p className="text-xs text-rose-800 dark:text-rose-400 mt-0.5 leading-relaxed">{gateway.error_message}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'email' && (
        <div>
          <div className="p-5 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg">Email SMTP Gateway</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Configure outbound email relay properties using your standard SMTP server</p>
          </div>

          <form onSubmit={onSaveSmtp} className="p-6 space-y-6">
            {smtpStatusMsg && (
              <div className={`p-4 rounded-xl border text-sm flex items-start space-x-3 ${
                smtpStatusMsg.toLowerCase().includes('success')
                  ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/30 text-emerald-800 dark:text-emerald-400'
                  : 'bg-indigo-50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900/30 text-indigo-800 dark:text-indigo-400'
              }`}>
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                <span>{smtpStatusMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Host */}
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">SMTP Host *</label>
                <input
                  type="text"
                  required
                  value={smtp.smtp_host}
                  onChange={(e) => setSmtp({ ...smtp, smtp_host: e.target.value })}
                  placeholder="smtp.gmail.com / smtp.mailgun.org"
                  className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-100 dark:bg-ink-900"
                />
              </div>

              {/* Port */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">SMTP Port *</label>
                <input
                  type="text"
                  required
                  value={smtp.smtp_port}
                  onChange={(e) => setSmtp({ ...smtp, smtp_port: e.target.value })}
                  placeholder="587 / 465"
                  className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-100 dark:bg-ink-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* User */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">SMTP Username *</label>
                <input
                  type="text"
                  required
                  value={smtp.smtp_user}
                  onChange={(e) => setSmtp({ ...smtp, smtp_user: e.target.value })}
                  placeholder="user@gmail.com"
                  className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-100 dark:bg-ink-900"
                />
              </div>

              {/* Pass */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">SMTP Password *</label>
                <input
                  type="password"
                  required
                  value={smtp.smtp_pass}
                  onChange={(e) => setSmtp({ ...smtp, smtp_pass: e.target.value })}
                  placeholder="••••••••••••••••"
                  className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-100 dark:bg-ink-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Sender Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Sender Display Name</label>
                <input
                  type="text"
                  value={smtp.sender_name}
                  onChange={(e) => setSmtp({ ...smtp, sender_name: e.target.value })}
                  placeholder="ordinary CRM"
                  className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-100 dark:bg-ink-900"
                />
              </div>

              {/* Sender Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Sender Email Address *</label>
                <input
                  type="email"
                  required
                  value={smtp.sender_email}
                  onChange={(e) => setSmtp({ ...smtp, sender_email: e.target.value })}
                  placeholder="outreach@yourdomain.com"
                  className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-100 dark:bg-ink-900"
                />
              </div>
            </div>

            {/* SSL/TLS Toggle */}
            <div className="flex items-center space-x-3 py-1">
              <input
                id="smtp_secure"
                type="checkbox"
                checked={smtp.smtp_secure}
                onChange={(e) => setSmtp({ ...smtp, smtp_secure: e.target.checked })}
                className="h-4 w-4 rounded-sm border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:bg-ink-900 dark:border-slate-800"
              />
              <label htmlFor="smtp_secure" className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase cursor-pointer select-none">
                Use Secure SSL/TLS (Required for Port 465, disable for Port 587 STARTTLS)
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row sm:justify-between items-stretch sm:items-center gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="submit"
                disabled={smtpSaving || smtpTesting}
                className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-all shadow-sm hover:shadow-md disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                <span>{smtpSaving ? 'Saving...' : 'Save Settings'}</span>
              </button>

              {/* SMTP test connector tool */}
              <div className="flex items-center space-x-2">
                <input
                  type="email"
                  placeholder="test@example.com"
                  value={testRecipient}
                  onChange={(e) => setTestRecipient(e.target.value)}
                  disabled={smtpTesting}
                  className="px-3 py-2 max-w-[200px] border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-100 dark:bg-ink-900"
                />
                <button
                  type="button"
                  onClick={() => onTestSmtp(testRecipient)}
                  disabled={smtpSaving || smtpTesting}
                  className="inline-flex items-center justify-center space-x-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-ink-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border border-slate-200 dark:border-slate-800 rounded-xl text-xs transition-all disabled:opacity-50"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>{smtpTesting ? 'Testing...' : 'Test Connection'}</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'sheets' && (
        <div>
          <div className="p-5 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg">Excel & Google Sheets Live Sync</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Sync outreach success and failure logs in real-time to a connected web spreadsheet.</p>
          </div>

          <div className="p-6 space-y-6">
            {sheetsStatusMsg && (
              <div className={`p-4 rounded-xl border text-sm flex items-start space-x-3 ${
                sheetsStatusMsg.toLowerCase().includes('success')
                  ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/30 text-emerald-800 dark:text-emerald-400'
                  : 'bg-indigo-50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900/30 text-indigo-800 dark:text-indigo-400'
              }`}>
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                <span>{sheetsStatusMsg}</span>
              </div>
            )}

            <form onSubmit={onSaveSheetsSync} className="space-y-4">
              {/* Webhook URL */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Google Sheets Webhook URL *</label>
                <input
                  type="url"
                  required
                  value={sheetsSync.webhook_url}
                  onChange={(e) => setSheetsSync({ ...sheetsSync, webhook_url: e.target.value })}
                  placeholder="https://script.google.com/macros/s/.../exec"
                  className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-100 dark:bg-ink-900"
                />
              </div>

              {/* Sync Toggle */}
              <div className="flex items-center space-x-3 py-1">
                <input
                  id="sheets_sync_enabled"
                  type="checkbox"
                  checked={sheetsSync.enabled}
                  onChange={(e) => setSheetsSync({ ...sheetsSync, enabled: e.target.checked })}
                  className="h-4 w-4 rounded-sm border-slate-300 text-indigo-600 dark:text-indigo-600 focus:ring-indigo-500 dark:bg-ink-900 dark:border-slate-800"
                />
                <label htmlFor="sheets_sync_enabled" className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase cursor-pointer select-none">
                  Enable Real-Time Excel/Sheets Sync Webhook
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row sm:justify-between items-stretch sm:items-center gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="submit"
                  disabled={sheetsSaving || sheetsTesting}
                  className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-all shadow-sm hover:shadow-md disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  <span>{sheetsSaving ? 'Saving...' : 'Save Settings'}</span>
                </button>

                <button
                  type="button"
                  onClick={onTestSheetsSync}
                  disabled={sheetsSaving || sheetsTesting}
                  className="inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-ink-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border border-slate-200 dark:border-slate-800 rounded-xl text-xs transition-all disabled:opacity-50"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>{sheetsTesting ? 'Testing Webhook...' : 'Test Webhook'}</span>
                </button>
              </div>
            </form>

            {/* Instruction Guide */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 bg-slate-50/40 dark:bg-slate-900/10">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-lg">
                  <Code className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Google Sheets Setup Instructions</h4>
                  <p className="text-[10px] text-slate-400">Map outreach reporting to a Google Sheet automatically using this helper script</p>
                </div>
              </div>

              <ol className="list-decimal pl-4 text-xs text-slate-600 dark:text-slate-400 space-y-2 leading-relaxed">
                <li>Create a new **Google Sheet** on your Google Drive.</li>
                <li>Go to the top menu and select **Extensions &gt; Apps Script**.</li>
                <li>Clear any existing text inside the code editor page, and paste the code block below.</li>
                <li>Click **Save** (floppy disk icon) at the top of the editor.</li>
                <li>Click **Deploy &gt; New Deployment** in the top-right corner.</li>
                <li>Click the gear icon next to "Select type" and select **Web App**.</li>
                <li>Set Description to `ordinary Webhook`, set Execute as to **"Me"**, and set Who has access to **"Anyone"** (essential for incoming API calls).</li>
                <li>Click **Deploy**, authorize permissions when prompted, and **copy the Web App URL** to paste into the field above!</li>
              </ol>

              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">Apps Script Code Block</span>
                  <button
                    onClick={handleCopyScript}
                    className="inline-flex items-center space-x-1.5 text-xs text-indigo-600 dark:text-indigo-400 hover:underline transition-all font-semibold"
                  >
                    {copiedScript ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Save className="h-3.5 w-3.5" />}
                    <span>{copiedScript ? 'Copied!' : 'Copy Code'}</span>
                  </button>
                </div>
                <pre className="p-3 bg-slate-50 dark:bg-ink-900 border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-[10px] max-h-48 overflow-y-auto text-slate-700 dark:text-slate-400 leading-normal">
                  {appsScriptCode}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
