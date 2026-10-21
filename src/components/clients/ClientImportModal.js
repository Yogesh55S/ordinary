import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { X, Upload, FileCode, CheckCircle, AlertTriangle, AlertCircle, RefreshCw, Copy, Check } from 'lucide-react';

export default function ClientImportModal({ isOpen, onClose, onImportSuccess, clients = [] }) {
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'paste' | 'demo'
  const [inputText, setInputText] = useState('');
  const [fileName, setFileName] = useState('');
  const [parsedData, setParsedData] = useState([]);
  const [parseError, setParseError] = useState('');
  const [importing, setImporting] = useState(false);
  const [copiedText, setCopiedText] = useState('');

  const fileInputRef = useRef(null);

  // Clear states when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setActiveTab('upload');
      setInputText('');
      setFileName('');
      setParsedData([]);
      setParseError('');
      setImporting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Custom robust CSV Parser
  const parseCSV = (text) => {
    const lines = [];
    let row = [''];
    let inQuotes = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      const next = text[i + 1];
      if (c === '"') {
        if (inQuotes && next === '"') {
          row[row.length - 1] += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (c === ',' && !inQuotes) {
        row.push('');
      } else if ((c === '\r' || c === '\n') && !inQuotes) {
        if (c === '\r' && next === '\n') {
          i++;
        }
        lines.push(row);
        row = [''];
      } else {
        row[row.length - 1] += c;
      }
    }
    if (row.length > 1 || row[0] !== '') {
      lines.push(row);
    }

    if (lines.length < 2) return [];
    
    // Normalize headers: strip quotes, trim, lowercase, replace spaces/underscores
    const headers = lines[0].map(h => 
      h.trim().toLowerCase().replace(/^["']|["']$/g, '').replace(/[\s_]+/g, '')
    );

    return lines.slice(1).map(rowValues => {
      const obj = {};
      headers.forEach((header, index) => {
        let field = header;
        if (header.includes('business')) field = 'business_name';
        else if (header.includes('owner')) field = 'owner_name';
        else if (header.includes('phone') || header.includes('mobile')) field = 'phone_number';
        else if (header.includes('email')) field = 'email';
        else if (header.includes('web')) field = 'website';
        else if (header.includes('city') || header.includes('address')) field = 'city';
        else if (header.includes('cat')) field = 'category';
        else if (header.includes('tag')) field = 'tagsString';
        else if (header.includes('note')) field = 'notes';
        else if (header.includes('stat')) field = 'status';

        let rawVal = rowValues[index] ? rowValues[index].trim() : '';
        // Strip wrap quotes if present
        rawVal = rawVal.replace(/^["']|["']$/g, '');
        obj[field] = rawVal;
      });
      return obj;
    });
  };

  // Custom robust JSON Parser
  const parseJSON = (text) => {
    const parsed = JSON.parse(text);
    const arr = Array.isArray(parsed) ? parsed : [parsed];
    return arr.map(item => {
      const obj = {};
      Object.keys(item).forEach(key => {
        let normalizedKey = key.trim().toLowerCase().replace(/[\s_]+/g, '');
        let field = normalizedKey;
        if (normalizedKey.includes('business')) field = 'business_name';
        else if (normalizedKey.includes('owner')) field = 'owner_name';
        else if (normalizedKey.includes('phone') || normalizedKey.includes('mobile')) field = 'phone_number';
        else if (normalizedKey.includes('email')) field = 'email';
        else if (normalizedKey.includes('web')) field = 'website';
        else if (normalizedKey.includes('city') || normalizedKey.includes('address')) field = 'city';
        else if (normalizedKey.includes('cat')) field = 'category';
        else if (normalizedKey.includes('tag')) field = 'tagsString';
        else if (normalizedKey.includes('note')) field = 'notes';
        else if (normalizedKey.includes('stat')) field = 'status';

        obj[field] = item[key] !== null && item[key] !== undefined ? String(item[key]).trim() : '';
      });
      return obj;
    });
  };

  // Run validation on parsed rows
  const validateRows = (rows) => {
    // Find phone number duplicates in the current DB clients
    const dbPhones = new Set(clients.map(c => (c.phone_number || '').replace(/\D/g, '')));
    
    return rows.map((row, idx) => {
      const businessName = (row.business_name || '').trim();
      let rawPhone = (row.phone_number || '').trim();
      let cleanedPhone = rawPhone.replace(/[\s-()]/g, '');
      if (cleanedPhone.startsWith('+')) {
        cleanedPhone = '+' + cleanedPhone.replace(/\D/g, '');
      } else {
        cleanedPhone = cleanedPhone.replace(/\D/g, '');
      }

      const errors = [];
      let status = 'valid'; // 'valid' | 'warning' | 'error'

      if (!businessName) {
        errors.push('Missing business name');
        status = 'error';
      }
      if (!rawPhone) {
        errors.push('Missing phone number');
        status = 'error';
      } else if (!/^\+?\d{8,15}$/.test(cleanedPhone)) {
        errors.push('Invalid phone format (need 8-15 digits with country code)');
        status = 'error';
      } else {
        const digitsOnly = cleanedPhone.replace(/\D/g, '');
        if (dbPhones.has(digitsOnly)) {
          errors.push('Phone already exists in CRM (will be skipped)');
          status = 'warning';
        }
      }

      // Validate/Normalize Outreach status
      let clientStatus = 'New';
      if (row.status) {
        const testStatus = row.status.trim().toLowerCase();
        if (['new', 'lead', 'active', 'inactive', 'archived'].includes(testStatus)) {
          clientStatus = testStatus.charAt(0).toUpperCase() + testStatus.slice(1);
        }
      }

      // Convert tagsString to tags array
      const tags = row.tagsString
        ? row.tagsString.split(',').map(t => t.trim()).filter(Boolean)
        : [];

      return {
        ...row,
        index: idx + 1,
        business_name: businessName,
        phone_number: cleanedPhone,
        status: clientStatus,
        tags,
        validationStatus: status,
        validationMessage: errors.join(', ')
      };
    });
  };

  const processImportText = (text, format = 'csv') => {
    setParseError('');
    if (!text.trim()) {
      setParsedData([]);
      return;
    }
    try {
      let parsed = [];
      if (format === 'json') {
        parsed = parseJSON(text);
      } else {
        parsed = parseCSV(text);
      }
      
      if (parsed.length === 0) {
        setParseError('No rows detected. Ensure headers and row data are correctly formatted.');
        setParsedData([]);
      } else {
        const validated = validateRows(parsed);
        setParsedData(validated);
      }
    } catch (err) {
      console.error(err);
      setParseError(`Parsing failed: ${err.message || 'Invalid format'}`);
      setParsedData([]);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    setParseError('');

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const extension = file.name.split('.').pop().toLowerCase();
      processImportText(text, extension === 'json' ? 'json' : 'csv');
    };
    reader.onerror = () => {
      setParseError('Failed to read file.');
    };
    reader.readAsText(file);
  };

  const handlePasteChange = (e) => {
    const val = e.target.value;
    setInputText(val);
    // Simple auto-detect format
    const format = val.trim().startsWith('[') || val.trim().startsWith('{') ? 'json' : 'csv';
    processImportText(val, format);
  };

  const loadDemoData = (format) => {
    let demoText = '';
    if (format === 'csv') {
      demoText = `Business Name, Owner Name, Phone Number, Email, Website, City, Category, Tags, Notes, Status
"Pizza Palace","Mario Rossi","+919876543201","mario@pizza.com","https://pizzapalace.com","Delhi","Retail","VIP, Food","Outreach scheduled","Lead"
"Tech Wizards","Sarah Connor","+919876543202","sarah@techwizards.io","","Mumbai","Tech","Tech, Enterprise","Spoke with CTO","Active"
"Invalid Co.","","","","","","","","Missing business name & phone",""`;
    } else {
      demoText = `[
  {
    "Business Name": "Pizza Palace",
    "Owner Name": "Mario Rossi",
    "Phone Number": "+919876543201",
    "Email": "mario@pizza.com",
    "Website": "https://pizzapalace.com",
    "City": "Delhi",
    "Category": "Retail",
    "Tags": "VIP, Food",
    "Notes": "Outreach scheduled",
    "Status": "Lead"
  },
  {
    "Business Name": "Tech Wizards",
    "Owner Name": "Sarah Connor",
    "Phone Number": "+919876543202",
    "Email": "sarah@techwizards.io",
    "City": "Mumbai",
    "Category": "Tech",
    "Tags": "Tech, Enterprise",
    "Notes": "Spoke with CTO",
    "Status": "Active"
  },
  {
    "Business Name": "Invalid Co.",
    "Notes": "Missing business name & phone"
  }
]`;
    }
    setInputText(demoText);
    setActiveTab('paste');
    processImportText(demoText, format);
  };

  const copyToClipboard = (text, name) => {
    navigator.clipboard.writeText(text);
    setCopiedText(name);
    setTimeout(() => setCopiedText(''), 2000);
  };

  const handleImportSubmit = async () => {
    const validRows = parsedData.filter(d => d.validationStatus === 'valid');
    if (validRows.length === 0) {
      alert('No valid rows to import. Please resolve error alerts.');
      return;
    }

    try {
      setImporting(true);
      
      const payload = validRows.map(row => ({
        business_name: row.business_name,
        owner_name: row.owner_name || null,
        phone_number: row.phone_number,
        email: row.email || null,
        website: row.website || null,
        city: row.city || null,
        category: row.category || null,
        tags: row.tags || [],
        notes: row.notes || null,
        status: row.status || 'New',
        updated_at: new Date().toISOString()
      }));

      const { error } = await supabase
        .from('clients')
        .insert(payload);

      if (error) throw error;

      // Log to activity logs
      await supabase.from('activity_logs').insert({
        action_type: 'Bulk Imported Clients',
        details: `Imported ${validRows.length} clients into the CRM.`
      });

      alert(`Success! Imported ${validRows.length} clients successfully.`);
      onImportSuccess();
    } catch (err) {
      console.error(err);
      alert(`Import failed: ${err.message}`);
    } finally {
      setImporting(false);
    }
  };

  const demoCSV = `Business Name, Owner Name, Phone Number, Email, Website, City, Category, Tags, Notes, Status
"Acme Retail","John Doe","+919876543210","john@acme.com","https://acme.com","Mumbai","Retail","VIP, Lead","Outreach scheduled","Lead"`;

  const demoJSON = `[
  {
    "Business Name": "Acme Retail",
    "Owner Name": "John Doe",
    "Phone Number": "+919876543210",
    "Email": "john@acme.com",
    "Website": "https://acme.com",
    "City": "Mumbai",
    "Category": "Retail",
    "Tags": "VIP, Lead",
    "Notes": "Outreach scheduled",
    "Status": "Lead"
  }
]`;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-xs transition-opacity duration-300"
      ></div>

      {/* Modal Container */}
      <div className="relative bg-white dark:bg-ink-800 rounded-t-3xl sm:rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[92dvh] sm:max-h-[90vh] overflow-hidden transition-all scale-100 border border-slate-200 dark:border-slate-800">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 dark:text-slate-205">
            Bulk Import Clients
          </h3>
          <button 
            onClick={onClose}
            className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 px-6 bg-slate-50/20 dark:bg-ink-800">
          <button
            onClick={() => setActiveTab('upload')}
            className={`py-3 px-4 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'upload'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Upload File
          </button>
          <button
            onClick={() => setActiveTab('paste')}
            className={`py-3 px-4 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'paste'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Paste Raw Text
          </button>
          <button
            onClick={() => setActiveTab('demo')}
            className={`py-3 px-4 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'demo'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Samples & Demo
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Tab 1: Upload File */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 rounded-2xl p-8 text-center cursor-pointer hover:bg-indigo-50/5 dark:hover:bg-indigo-950/5 transition-all flex flex-col items-center justify-center space-y-3"
              >
                <div className="h-12 w-12 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center">
                  <Upload className="h-6 w-6" />
                </div>
                <div>
                  <span className="font-bold text-sm text-slate-800 dark:text-slate-200">
                    {fileName ? fileName : 'Choose CSV or JSON file'}
                  </span>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                    Drag and drop your file here, or click to browse. Supports .csv and .json.
                  </p>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".csv,.json"
                  className="hidden"
                />
              </div>
              {fileName && (
                <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900/40 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800/80">
                  <span className="text-xs font-semibold text-slate-500 truncate max-w-sm">Selected: {fileName}</span>
                  <button 
                    onClick={() => {
                      setFileName('');
                      setParsedData([]);
                    }}
                    className="text-xs text-rose-500 font-semibold hover:underline"
                  >
                    Clear File
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Paste Raw Text */}
          {activeTab === 'paste' && (
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Paste CSV or JSON Content</label>
              <textarea
                value={inputText}
                onChange={handlePasteChange}
                rows={8}
                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-100 dark:bg-ink-900 font-mono resize-y"
                placeholder={`Business Name, Phone Number, Owner Name...\n"My Shop","+919876543201","John Smith"`}
              />
            </div>
          )}

          {/* Tab 3: Schema & Demo */}
          {activeTab === 'demo' && (
            <div className="space-y-6 text-sm text-slate-600 dark:text-slate-350">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* CSV block */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 dark:text-slate-200">CSV Header Schema</span>
                    <button
                      onClick={() => copyToClipboard(demoCSV, 'csv')}
                      className="inline-flex items-center space-x-1 text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      {copiedText === 'csv' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      <span>Copy Template</span>
                    </button>
                  </div>
                  <pre className="p-3 bg-slate-50 dark:bg-ink-900 border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-xs overflow-x-auto text-slate-700 dark:text-slate-300">
                    {demoCSV}
                  </pre>
                  <p className="text-[11px] text-slate-400 mt-1">Headers are case-insensitive and match close aliases (e.g. Mobile number, Phone, Business).</p>
                </div>
 
                {/* JSON block */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 dark:text-slate-200">JSON Schema Array</span>
                    <button
                      onClick={() => copyToClipboard(demoJSON, 'json')}
                      className="inline-flex items-center space-x-1 text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      {copiedText === 'json' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      <span>Copy Template</span>
                    </button>
                  </div>
                  <pre className="p-3 bg-slate-50 dark:bg-ink-900 border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-xs overflow-x-auto text-slate-700 dark:text-slate-300">
                    {demoJSON}
                  </pre>
                  <p className="text-[11px] text-slate-400 mt-1">Structure can be a single client object or a JSON array of client objects.</p>
                </div>
              </div>
 
              {/* Demo Loader Buttons */}
              <div className="bg-indigo-50/50 dark:bg-indigo-950/20 p-4 border border-indigo-100 dark:border-indigo-900/30 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h4 className="font-bold text-indigo-900 dark:text-indigo-305 text-sm">Interactive Sandbox Demo</h4>
                  <p className="text-xs text-indigo-700 dark:text-indigo-400 mt-0.5">Load mock client datasets instantly to review parsing previews and verification badges.</p>
                </div>
                <div className="flex space-x-2 shrink-0">
                  <button
                    onClick={() => loadDemoData('csv')}
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs shadow-sm transition-all"
                  >
                    Load Mock CSV
                  </button>
                  <button
                    onClick={() => loadDemoData('json')}
                    className="px-3.5 py-1.5 bg-white border border-indigo-200 dark:bg-ink-900 dark:border-indigo-950 text-indigo-600 dark:text-indigo-400 font-semibold rounded-xl text-xs shadow-sm hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-all"
                  >
                    Load Mock JSON
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Error display */}
          {parseError && (
            <div className="flex items-center space-x-3 p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 rounded-xl text-rose-800 dark:text-rose-400">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span className="text-xs font-semibold">{parseError}</span>
            </div>
          )}

          {/* Preview Table Section */}
          {parsedData.length > 0 && (
            <div className="space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Parsed Preview Logs ({parsedData.length} records detected)</span>
                <div className="flex items-center space-x-3 text-xs">
                  <span className="flex items-center text-emerald-600 dark:text-emerald-400 font-medium">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 mr-1.5"></span>
                    {parsedData.filter(d => d.validationStatus === 'valid').length} Ready
                  </span>
                  {parsedData.filter(d => d.validationStatus === 'warning').length > 0 && (
                    <span className="flex items-center text-amber-500 dark:text-amber-400 font-medium">
                      <span className="h-2 w-2 rounded-full bg-amber-500 mr-1.5"></span>
                      {parsedData.filter(d => d.validationStatus === 'warning').length} Duplicate
                    </span>
                  )}
                  {parsedData.filter(d => d.validationStatus === 'error').length > 0 && (
                    <span className="flex items-center text-rose-500 dark:text-rose-450 font-medium">
                      <span className="h-2 w-2 rounded-full bg-rose-500 mr-1.5"></span>
                      {parsedData.filter(d => d.validationStatus === 'error').length} Errors
                    </span>
                  )}
                </div>
              </div>

              <div className="border border-slate-200 dark:border-slate-800/80 rounded-2xl overflow-hidden max-h-72 overflow-y-auto">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-left text-xs text-slate-600 dark:text-slate-300">
                  <thead className="bg-slate-50 dark:bg-slate-900/40 text-slate-400 font-bold sticky top-0 uppercase">
                    <tr>
                      <th className="px-4 py-3 w-8">#</th>
                      <th className="px-4 py-3">Business Name</th>
                      <th className="px-4 py-3">Owner</th>
                      <th className="px-4 py-3">Phone</th>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Validation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-600 dark:text-slate-300">
                    {parsedData.map((row) => (
                      <tr 
                        key={row.index} 
                        className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/10 ${
                          row.validationStatus === 'error' 
                            ? 'bg-rose-50/10 dark:bg-rose-950/5' 
                            : row.validationStatus === 'warning'
                            ? 'bg-amber-50/10 dark:bg-amber-955/5'
                            : ''
                        }`}
                      >
                        <td className="px-4 py-3 text-slate-400 font-medium">{row.index}</td>
                        <td className="px-4 py-3 font-bold text-slate-800 dark:text-slate-200">
                          {row.business_name || <span className="text-rose-500 italic">None</span>}
                        </td>
                        <td className="px-4 py-3">{row.owner_name || '—'}</td>
                        <td className="px-4 py-3 font-mono">{row.phone_number || <span className="text-rose-500 italic">None</span>}</td>
                        <td className="px-4 py-3 truncate max-w-[120px]">{row.email || '—'}</td>
                        <td className="px-4 py-3">{row.status}</td>
                        <td className="px-4 py-3 text-right font-semibold">
                          {row.validationStatus === 'valid' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Ready
                            </span>
                          )}
                          {row.validationStatus === 'warning' && (
                            <span 
                              className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] bg-amber-50 dark:bg-amber-955/30 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30"
                              title={row.validationMessage}
                            >
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Duplicate
                            </span>
                          )}
                          {row.validationStatus === 'error' && (
                            <span 
                              className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30"
                              title={row.validationMessage}
                            >
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Error
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-[10px] text-slate-400">Errors must be fixed in the raw text or source files before those lines can be imported. Warning duplicates will be automatically skipped to maintain clean contact lists.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-ink-800 transition-colors">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-xl text-sm transition-all"
          >
            Cancel
          </button>
          
          <button
            onClick={handleImportSubmit}
            disabled={importing || parsedData.filter(d => d.validationStatus === 'valid').length === 0}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed space-x-2"
          >
            {importing ? (
              <>
                <RefreshCw className="h-4.5 w-4.5 animate-spin" />
                <span>Importing...</span>
              </>
            ) : (
              <>
                <CheckCircle className="h-4.5 w-4.5" />
                <span>Import {parsedData.filter(d => d.validationStatus === 'valid').length} Clients</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
