const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const QRCode = require('qrcode');
const qrcodeTerminal = require('qrcode-terminal');
const { createClient } = require('@supabase/supabase-js');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

const { getPostHogServer, shutdownPostHog } = require('../lib/posthog-server.cjs');
getPostHogServer();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Error: Missing Supabase environment variables in .env.local");
  console.error("Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.");
  process.exit(1);
}

// Service role client bypasses RLS and allows background reads/writes
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  }
});

let sock = null;
let isConnecting = false;
let checkInterval = null;
let scheduleInterval = null;
let isProcessingSchedules = false;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper to format a phone number to a WhatsApp JID
function formatToWhatsappJid(phone, senderPhone) {
  let cleaned = phone.trim();
  
  // Strip leading '+' or '00'
  if (cleaned.startsWith('+')) {
    cleaned = cleaned.slice(1);
  } else if (cleaned.startsWith('00')) {
    cleaned = cleaned.slice(2);
  }
  
  // Remove all non-digits
  cleaned = cleaned.replace(/\D/g, '');
  
  // Strip leading '0' if it's an 11-digit number (e.g. 09876543210 -> 9876543210)
  if (cleaned.startsWith('0') && cleaned.length === 11) {
    cleaned = cleaned.slice(1);
  }
  
  // If the number length is 10 (or less), we need to prepend a country code
  if (cleaned.length <= 10) {
    let countryCode = '91'; // default fallback for India
    if (senderPhone) {
      const jidUser = senderPhone.split(':')[0].split('@')[0];
      const cleanSender = jidUser.replace(/\D/g, '');
      if (cleanSender.length > 10) {
        countryCode = cleanSender.slice(0, cleanSender.length - 10);
      }
    }
    cleaned = countryCode + cleaned;
    console.log(`Auto-formatted recipient number ${phone} using country code ${countryCode} -> ${cleaned}`);
  }
  
  return `${cleaned}@s.whatsapp.net`;
}

// Helper to clean up auth credentials directory
function clearAuthDir() {
  const authDir = path.resolve(__dirname, '../../.baileys_auth');
  if (fs.existsSync(authDir)) {
    try {
      fs.rmSync(authDir, { recursive: true, force: true });
      console.log("Cleared local session credentials folder .baileys_auth");
    } catch (err) {
      console.error("Failed to clear session folder:", err.message);
    }
  }
}

// Download file helper for attachments
async function downloadFile(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP fetch error! status: ${response.status}`);
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

// Update database SYSTEM_WHATSAPP_GATEWAY row
async function updateGatewayStatus(fields) {
  const timestamp = new Date().toISOString();
  const updateData = {
    status: fields.status,
    notes: JSON.stringify({
      status: fields.status,
      qr_code: fields.qr_code || null,
      connected_phone: fields.connected_phone || null,
      error_message: fields.error_message || null,
      updated_at: timestamp
    })
  };
  
  const { error } = await supabase
    .from('clients')
    .update(updateData)
    .eq('business_name', 'SYSTEM_WHATSAPP_GATEWAY');

  if (error) {
    console.error("Error updating gateway status in Supabase:", error.message);
  }
}

// Trigger Google Sheets Webhook Sync
async function triggerSheetsWebhook(payload) {
  // Only sync successfully sent messages to Google Sheets
  if (payload.status !== 'Sent') {
    return;
  }
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('notes')
      .eq('business_name', 'SYSTEM_EXCEL_SYNC')
      .limit(1)
      .maybeSingle();

    if (error || !data || !data.notes) {
      return;
    }

    let config = {};
    try {
      config = JSON.parse(data.notes);
    } catch (e) {
      return;
    }

    if (!config.enabled || !config.webhook_url) {
      return;
    }

    console.log(`Syncing outreach event to Google Sheets webhook: ${config.webhook_url}...`);
    
    const response = await fetch(config.webhook_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        timestamp: new Date().toISOString(),
        ...payload
      }),
      redirect: 'follow'
    });

    if (!response.ok) {
      console.error(`Sheets Webhook sync failed. HTTP Status: ${response.status}`);
    } else {
      console.log('Sheets Webhook sync completed successfully.');
    }
  } catch (err) {
    console.error('Error triggering Sheets Webhook sync:', err.message);
  }
}

// Connect to WhatsApp
async function connectToWhatsApp() {
  if (isConnecting) return;
  isConnecting = true;
  console.log("Initializing WhatsApp Web Socket...");
  await updateGatewayStatus({ status: 'connecting' });

  try {
    const authDir = path.resolve(__dirname, '../../.baileys_auth');
    const { state, saveCreds } = await useMultiFileAuthState(authDir);

    sock = makeWASocket({
      auth: state,
      printQRInTerminal: false, // Handled manually
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;
      
      // On QR code event
      if (qr) {
        console.log("\nWhatsApp QR Code received! Scan it to connect:");
        qrcodeTerminal.generate(qr, { small: true });
        
        try {
          // Generate base64 data url for the frontend setting page
          const qrBase64 = await QRCode.toDataURL(qr);
          await updateGatewayStatus({
            status: 'qr_ready',
            qr_code: qrBase64,
          });
        } catch (err) {
          console.error("Failed to generate QR data URL:", err.message);
        }
      }

      if (connection === 'connecting') {
        console.log("Connecting to WhatsApp...");
        await updateGatewayStatus({ status: 'connecting' });
      }

      if (connection === 'open') {
        const userId = sock.user?.id || '';
        const phoneDigits = userId.split(':')[0].split('@')[0];
        console.log(`WhatsApp Link Connected successfully! Linked phone: ${phoneDigits}`);
        
        await updateGatewayStatus({
          status: 'connected',
          connected_phone: phoneDigits,
        });
        
        // Log connection to activity logs
        await supabase.from('activity_logs').insert({
          action_type: 'Gateway Connected',
          details: `WhatsApp socket link opened for user profile ${phoneDigits}.`
        });
        
        isConnecting = false;
      }

      if (connection === 'close') {
        isConnecting = false;
        const statusCode = lastDisconnect?.error instanceof Boom 
          ? lastDisconnect.error.output?.statusCode 
          : null;
          
        const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
        
        console.log(`WhatsApp connection closed. Status code: ${statusCode}. Reconnecting? ${shouldReconnect}`);
        
        if (!shouldReconnect) {
          console.log("Logged out from WhatsApp. Wiping auth folder...");
          clearAuthDir();
          sock = null;
          await updateGatewayStatus({ status: 'disconnected' });
        } else {
          console.log("Lost connection. Re-establishing socket in 5 seconds...");
          sock = null;
          await updateGatewayStatus({ 
            status: 'connecting', 
            error_message: 'Reconnecting socket link...' 
          });
          setTimeout(connectToWhatsApp, 5000);
        }
      }
    });

  } catch (err) {
    console.error("WhatsApp initialization error:", err.message);
    isConnecting = false;
    await updateGatewayStatus({
      status: 'disconnected',
      error_message: err.message
    });
  }
}

// Process schedules
async function processSchedules() {
  if (isProcessingSchedules) {
    console.log("processSchedules is already running. Skipping this cycle to prevent overlaps.");
    return;
  }
  isProcessingSchedules = true;
  console.log("Checking pending schedules queue...");
  
  try {
    // Read all Pending/Scheduled outreach records
    const { data: schedules, error } = await supabase
      .from('outreach_schedules')
      .select(`
        id,
        client_id,
        template_id,
        custom_message,
        attachments,
        schedule_date,
        schedule_time,
        status,
        clients ( business_name, owner_name, phone_number, email, category, city ),
        templates ( template_name )
      `)
      .in('status', ['Pending', 'Scheduled']);
      
    if (error) throw error;
    
    if (!schedules || schedules.length === 0) {
      console.log("Queue is empty.");
      return;
    }

    const now = new Date();
    
    for (const schedule of schedules) {
      const { schedule_date, schedule_time } = schedule;
      
      // Combine date and time to parse
      const scheduleDateTime = new Date(`${schedule_date}T${schedule_time}`);
      
      // Check if scheduled date+time has passed
      if (scheduleDateTime > now) {
        continue;
      }
      
      const client = schedule.clients;
      const businessName = client ? client.business_name : 'Unknown Client';
      const ownerName = client ? client.owner_name : '';
      const phoneNumber = client ? client.phone_number : '';
      const emailAddress = client ? client.email : '';
      const category = client ? client.category : '';
      const city = client ? client.city : '';
      const templateName = schedule.templates?.template_name || 'Custom Message';
      
      console.log(`Processing outreach ID ${schedule.id} for "${businessName}"`);

      // Determine outreach channel (Email vs WhatsApp)
      const isEmail = schedule.custom_message?.startsWith('[EMAIL]\nSubject:');

      if (isEmail) {
        // --- 1. EMAIL OUTREACH DISPATCH ---
        console.log(`Dispatching Email outreach to ${emailAddress}...`);
        
        if (!emailAddress) {
          console.warn("Cannot dispatch email: Recipient address is empty.");
          await supabase.from('outreach_schedules')
            .update({ status: 'Failed' })
            .eq('id', schedule.id);
            
          await supabase.from('activity_logs').insert({
            action_type: 'Delivery Failed',
            details: `Email outreach failed for "${businessName}": Missing email address.`
          });
          await triggerSheetsWebhook({
            business_name: businessName,
            owner_name: ownerName,
            phone_number: phoneNumber,
            email: emailAddress,
            category: category,
            city: city,
            channel: 'email',
            status: 'Failed',
            message: templateName,
            error_message: 'Missing email address'
          });
          continue;
        }

        // Fetch SMTP configuration
        const { data: smtpGateway, error: smtpErr } = await supabase
          .from('clients')
          .select('notes')
          .eq('business_name', 'SYSTEM_EMAIL_GATEWAY')
          .limit(1)
          .maybeSingle();

        if (smtpErr || !smtpGateway || !smtpGateway.notes) {
          console.warn("Cannot dispatch email: SMTP settings not configured in database.");
          await supabase.from('outreach_schedules')
            .update({ status: 'Failed' })
            .eq('id', schedule.id);
            
          await supabase.from('activity_logs').insert({
            action_type: 'Delivery Failed',
            details: `Email outreach failed for "${businessName}": SMTP Email Gateway is not configured.`
          });
          await triggerSheetsWebhook({
            business_name: businessName,
            owner_name: ownerName,
            phone_number: phoneNumber,
            email: emailAddress,
            category: category,
            city: city,
            channel: 'email',
            status: 'Failed',
            message: templateName,
            error_message: 'SMTP settings not configured'
          });
          continue;
        }

        let smtpConfig = {};
        try {
          smtpConfig = JSON.parse(smtpGateway.notes);
        } catch (e) {
          console.error("SMTP notes JSON parse failed:", e.message);
        }

        const host = process.env.SMTP_HOST || smtpConfig.smtp_host;
        const port = process.env.SMTP_PORT || smtpConfig.smtp_port;
        const user = process.env.SMTP_USER || smtpConfig.smtp_user;
        const pass = process.env.SMTP_PASS || smtpConfig.smtp_pass;
        const secure = process.env.SMTP_SECURE !== undefined ? (process.env.SMTP_SECURE === 'true') : (smtpConfig.smtp_secure || false);
        const sName = process.env.SENDER_NAME || smtpConfig.sender_name || 'ordinary CRM';
        const sEmail = process.env.SENDER_EMAIL || smtpConfig.sender_email || user;

        if (!host || !user || !pass) {
          console.warn("Cannot dispatch email: Incomplete SMTP config settings (missing host, user, or pass).");
          await supabase.from('outreach_schedules')
            .update({ status: 'Failed' })
            .eq('id', schedule.id);
            
          await supabase.from('activity_logs').insert({
            action_type: 'Delivery Failed',
            details: `Email outreach failed for "${businessName}": SMTP host/user/pass configuration is incomplete.`
          });
          await triggerSheetsWebhook({
            business_name: businessName,
            owner_name: ownerName,
            phone_number: phoneNumber,
            email: emailAddress,
            category: category,
            city: city,
            channel: 'email',
            status: 'Failed',
            message: templateName,
            error_message: 'Incomplete SMTP config'
          });
          continue;
        }

        // Parse subject and body content
        const parts = schedule.custom_message.split('---');
        const header = parts[0] || '';
        let messageText = parts.slice(1).join('---').trim();

        const subjectLine = header.split('\n')[1] || '';
        let subjectText = subjectLine.replace('Subject:', '').trim();

        // Perform tag substitutions
        subjectText = subjectText.replace(/\{business_name\}/g, businessName);
        subjectText = subjectText.replace(/\{owner_name\}/g, ownerName);
        
        messageText = messageText.replace(/\{business_name\}/g, businessName);
        messageText = messageText.replace(/\{owner_name\}/g, ownerName);

        // Fetch and download attachments
        let emailAttachments = [];
        if (schedule.attachments && schedule.attachments.length > 0) {
          const { data: mediaItems } = await supabase
            .from('media')
            .select('*')
            .in('id', schedule.attachments);

          if (mediaItems && mediaItems.length > 0) {
            for (const media of mediaItems) {
              try {
                console.log(`Downloading email file attachment: ${media.file_name}...`);
                const buffer = await downloadFile(media.file_url);
                emailAttachments.push({
                  filename: media.file_name,
                  content: buffer,
                  contentType: media.file_type
                });
              } catch (dlErr) {
                console.error(`Failed to download attachment ${media.file_name}:`, dlErr.message);
              }
            }
          }
        }

        try {
          // Initialize transporter
          const transporter = nodemailer.createTransport({
            host: host,
            port: parseInt(port) || 587,
            secure: secure,
            auth: {
              user: user,
              pass: pass
            }
          });

          await transporter.sendMail({
            from: `"${sName}" <${sEmail}>`,
            to: emailAddress,
            subject: subjectText,
            text: messageText,
            attachments: emailAttachments
          });

          // Update schedule status to Sent
          await supabase.from('outreach_schedules')
            .update({ status: 'Sent' })
            .eq('id', schedule.id);
            
          // Log to activity_logs
          await supabase.from('activity_logs').insert({
            action_type: 'Email Sent',
            details: `Outreach email delivered to "${businessName}" (${emailAddress}).`
          });
          
          console.log(`Successfully sent email outreach to ${emailAddress}`);
          await triggerSheetsWebhook({
            business_name: businessName,
            owner_name: ownerName,
            phone_number: phoneNumber,
            email: emailAddress,
            category: category,
            city: city,
            channel: 'email',
            status: 'Sent',
            message: templateName,
            attachments: emailAttachments.map(a => a.filename).join(', ')
          });
        } catch (sendErr) {
          console.error("Email send error:", sendErr.message);
          
          await supabase.from('outreach_schedules')
            .update({ status: 'Failed' })
            .eq('id', schedule.id);
            
          await supabase.from('activity_logs').insert({
            action_type: 'Delivery Failed',
            details: `Email outreach failed for "${businessName}": ${sendErr.message}`
          });
          await triggerSheetsWebhook({
            business_name: businessName,
            owner_name: ownerName,
            phone_number: phoneNumber,
            email: emailAddress,
            category: category,
            city: city,
            channel: 'email',
            status: 'Failed',
            message: templateName,
            attachments: emailAttachments.map(a => a.filename).join(', '),
            error_message: sendErr.message
          });
        }

      } else {
        // --- 2. WHATSAPP OUTREACH DISPATCH ---
        console.log(`Dispatching WhatsApp message to ${phoneNumber}...`);

        // Verify WhatsApp connection state
        if (!sock || !sock.user || !sock.user.id) {
          console.warn("Cannot dispatch outreach: WhatsApp is offline.");
          await supabase.from('outreach_schedules')
            .update({ status: 'Failed' })
            .eq('id', schedule.id);
            
          await supabase.from('activity_logs').insert({
            action_type: 'Delivery Failed',
            details: `WhatsApp outreach failed for "${businessName}": WhatsApp Gateway connection is offline.`
          });
          await triggerSheetsWebhook({
            business_name: businessName,
            owner_name: ownerName,
            phone_number: phoneNumber,
            email: emailAddress,
            category: category,
            city: city,
            channel: 'whatsapp',
            status: 'Failed',
            message: templateName,
            error_message: 'WhatsApp Gateway offline'
          });
          continue;
        }

        if (!phoneNumber) {
          console.warn("Cannot dispatch: Phone number is empty.");
          await supabase.from('outreach_schedules')
            .update({ status: 'Failed' })
            .eq('id', schedule.id);
            
          await supabase.from('activity_logs').insert({
            action_type: 'Delivery Failed',
            details: `WhatsApp outreach failed for "${businessName}": Missing phone number.`
          });
          await triggerSheetsWebhook({
            business_name: businessName,
            owner_name: ownerName,
            phone_number: phoneNumber,
            email: emailAddress,
            category: category,
            city: city,
            channel: 'whatsapp',
            status: 'Failed',
            message: templateName,
            error_message: 'Missing phone number'
          });
          continue;
        }

        // Perform tag substitutions
        let messageText = schedule.custom_message;
        messageText = messageText.replace(/\{business_name\}/g, businessName);
        messageText = messageText.replace(/\{owner_name\}/g, ownerName);

        const senderId = sock?.user?.id || '';
        const senderPhone = senderId.split(':')[0].split('@')[0];
        const recipientJid = formatToWhatsappJid(phoneNumber, senderPhone);
        const cleanedPhone = recipientJid.split('@')[0];
        
        let mediaItems = [];
        try {
          console.log(`Verifying WhatsApp registration for ${recipientJid}...`);
          const onWaResults = await sock.onWhatsApp(recipientJid);
          if (!onWaResults || onWaResults.length === 0 || !onWaResults[0].exists) {
            throw new Error(`The phone number ${phoneNumber} is not registered on WhatsApp.`);
          }
          const verifiedJid = onWaResults[0].jid;
          console.log(`Sending WhatsApp message to ${verifiedJid}...`);
          
          // Send primary text message
          await sock.sendMessage(verifiedJid, { text: messageText });
          
          // Send any attachments
          if (schedule.attachments && schedule.attachments.length > 0) {
            const { data: fetchedMedia } = await supabase
              .from('media')
              .select('*')
              .in('id', schedule.attachments);
            mediaItems = fetchedMedia || [];
          }

          if (mediaItems.length > 0) {
            for (const media of mediaItems) {
              try {
                console.log(`Downloading WhatsApp file attachment: ${media.file_name}...`);
                const buffer = await downloadFile(media.file_url);
                const mimeType = media.file_type || '';
                
                console.log(`Sending WhatsApp attachment ${media.file_name} (${mimeType})...`);
                if (mimeType.startsWith('image/')) {
                  await sock.sendMessage(verifiedJid, { image: buffer, caption: media.file_name });
                } else if (mimeType.startsWith('video/')) {
                  await sock.sendMessage(verifiedJid, { video: buffer, caption: media.file_name });
                } else if (mimeType.startsWith('audio/')) {
                  await sock.sendMessage(verifiedJid, { audio: buffer, mimetype: mimeType });
                } else {
                  await sock.sendMessage(verifiedJid, { document: buffer, fileName: media.file_name, mimetype: mimeType });
                }
              } catch (dlErr) {
                console.error(`Failed to send attachment ${media.file_name}:`, dlErr.message);
              }
            }
          }

          // Update schedule status to Sent
          await supabase.from('outreach_schedules')
            .update({ status: 'Sent' })
            .eq('id', schedule.id);

          // Update client status to Archived (only for WhatsApp dispatches)
          if (schedule.client_id) {
            const { error: clientUpdateErr } = await supabase
              .from('clients')
              .update({ status: 'Archived', updated_at: new Date().toISOString() })
              .eq('id', schedule.client_id);
            if (clientUpdateErr) {
              console.error(`Failed to update client ${schedule.client_id} status to Archived:`, clientUpdateErr.message);
            } else {
              console.log(`Successfully updated client ${schedule.client_id} status to Archived`);
            }
          }
            
          // Log to activity_logs
          await supabase.from('activity_logs').insert({
            action_type: 'Message Sent',
            details: `Outreach delivered to "${businessName}" (${phoneNumber}).`
          });

          // Attempt to archive chat on WhatsApp app
          try {
            console.log(`Archiving chat on WhatsApp app for ${cleanedPhone}...`);
            await sock.chatModify({ archive: true }, verifiedJid);
            console.log(`Successfully archived chat for ${cleanedPhone} on device`);
          } catch (archiveErr) {
            console.error(`Failed to archive chat for ${cleanedPhone} on device:`, archiveErr.message);
          }
          
          console.log(`Successfully sent outreach to ${cleanedPhone}`);
          const attachmentNames = mediaItems.map(m => m.file_name).join(', ');
          await triggerSheetsWebhook({
            business_name: businessName,
            owner_name: ownerName,
            phone_number: phoneNumber,
            email: emailAddress,
            category: category,
            city: city,
            channel: 'whatsapp',
            status: 'Sent',
            message: templateName,
            attachments: attachmentNames
          });
        } catch (sendErr) {
          console.error("Message dispatch error:", sendErr.message);
          
          await supabase.from('outreach_schedules')
            .update({ status: 'Failed' })
            .eq('id', schedule.id);
            
          await supabase.from('activity_logs').insert({
            action_type: 'Delivery Failed',
            details: `Outreach failed for "${businessName}": ${sendErr.message}`
          });
          await triggerSheetsWebhook({
            business_name: businessName,
            owner_name: ownerName,
            phone_number: phoneNumber,
            email: emailAddress,
            category: category,
            city: city,
            channel: 'whatsapp',
            status: 'Failed',
            message: templateName,
            attachments: mediaItems.map(m => m.file_name).join(', '),
            error_message: sendErr.message
          });
        }
      }

      // Add a randomized delay (e.g. 15 to 30 seconds) between outreach messages
      // to mimic human behavior and avoid WhatsApp's reach-out spam filters (Error 463).
      const cooldownMs = Math.floor(Math.random() * 15000) + 15000;
      console.log(`Outreach processed. Cooling down for ${cooldownMs / 1000}s before next send...`);
      await delay(cooldownMs);
    }
  } catch (err) {
    console.error("Error in processSchedules cycle:", err.message);
  } finally {
    isProcessingSchedules = false;
  }
}

// Poll gateway rows for frontend signals
async function checkGatewaySignals() {
  // --- 1. WHATSAPP GATEWAY SIGNALS ---
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('business_name', 'SYSTEM_WHATSAPP_GATEWAY')
      .limit(1)
      .maybeSingle();
      
    if (!error && data) {
      let parsedNotes = {};
      if (data.notes) {
        try {
          parsedNotes = JSON.parse(data.notes);
        } catch (e) {
          // notes is not JSON yet
        }
      }

      // Check for logout_requested
      if (parsedNotes.logout_requested || data.status === 'disconnected') {
        if (sock) {
          console.log("Disconnect signal received. Logging out from WhatsApp...");
          try {
            await sock.logout();
          } catch (err) {
            // If socket fails during logout, manually clear session
            clearAuthDir();
            sock = null;
            await updateGatewayStatus({ status: 'disconnected' });
          }
        } else {
          // Ensure credentials folder is wiped anyway
          clearAuthDir();
        }
      }
      
      // Check for connect_requested
      else if ((parsedNotes.connect_requested || data.status === 'connecting') && !sock && !isConnecting) {
        console.log("Connect signal received. Starting WhatsApp Link flow...");
        
        // Reset request flags to avoid loop triggers
        await supabase.from('clients')
          .update({
            notes: JSON.stringify({ status: 'connecting', updated_at: new Date().toISOString() })
          })
          .eq('business_name', 'SYSTEM_WHATSAPP_GATEWAY');
          
        connectToWhatsApp();
      }
    }
  } catch (err) {
    console.error("Error checking WhatsApp gateway signals:", err.message);
  }

  // --- 2. EMAIL SMTP TEST CONNECTION SIGNALS ---
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('business_name', 'SYSTEM_EMAIL_GATEWAY')
      .limit(1)
      .maybeSingle();

    if (!error && data && data.notes) {
      let parsed = {};
      try {
        parsed = JSON.parse(data.notes);
      } catch (e) {}

      if (parsed.test_connection_requested) {
        console.log(`SMTP Connection Test requested for recipient: ${parsed.test_recipient}...`);

        const host = process.env.SMTP_HOST || parsed.smtp_host;
        const port = process.env.SMTP_PORT || parsed.smtp_port;
        const user = process.env.SMTP_USER || parsed.smtp_user;
        const pass = process.env.SMTP_PASS || parsed.smtp_pass;
        const secure = process.env.SMTP_SECURE !== undefined ? (process.env.SMTP_SECURE === 'true') : (parsed.smtp_secure || false);
        const sName = process.env.SENDER_NAME || parsed.sender_name || 'ordinary CRM';
        const sEmail = process.env.SENDER_EMAIL || parsed.sender_email || user;

        try {
          // Initialize nodemailer transporter
          const transporter = nodemailer.createTransport({
            host: host,
            port: parseInt(port) || 587,
            secure: secure,
            auth: {
              user: user,
              pass: pass
            }
          });

          // Verify connection configuration
          await transporter.verify();
          console.log("SMTP verify succeeded. Sending test email...");

          // Send test email
          await transporter.sendMail({
            from: `"${sName}" <${sEmail}>`,
            to: parsed.test_recipient,
            subject: 'SMTP Connection Test - ordinary',
            text: 'Hello! This is a test email sent from the ordinary Outreach Automation background worker. Your SMTP settings are correctly configured!'
          });

          console.log("SMTP Test connection success! Updating database state...");
          
          await supabase
            .from('clients')
            .update({
              notes: JSON.stringify({
                ...parsed,
                test_connection_requested: false,
                test_connection_status: 'success',
                error_message: null,
                updated_at: new Date().toISOString()
              })
            })
            .eq('business_name', 'SYSTEM_EMAIL_GATEWAY');

        } catch (testErr) {
          console.error("SMTP Connection verification failed:", testErr.message);
          
          await supabase
            .from('clients')
            .update({
              notes: JSON.stringify({
                ...parsed,
                test_connection_requested: false,
                test_connection_status: 'failed',
                error_message: testErr.message,
                updated_at: new Date().toISOString()
              })
            })
            .eq('business_name', 'SYSTEM_EMAIL_GATEWAY');
        }
      }
    }
  } catch (err) {
    console.error("Error checking Email gateway signals:", err.message);
  }

  // --- 3. EXCEL WEBHOOK TEST SIGNALS ---
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('business_name', 'SYSTEM_EXCEL_SYNC')
      .limit(1)
      .maybeSingle();

    if (!error && data && data.notes) {
      let parsed = {};
      try {
        parsed = JSON.parse(data.notes);
      } catch (e) {}

      if (parsed.test_webhook_requested) {
        console.log(`Webhook test connection requested for URL: ${parsed.webhook_url}...`);
        
        try {
          const testPayload = {
            timestamp: new Date().toISOString(),
            business_name: "Test Business Inc.",
            owner_name: "John Doe",
            phone_number: "+919876543200",
            email: "test@business.com",
            category: "Retail",
            city: "Mumbai",
            channel: "whatsapp",
            status: "Sent",
            message: "Test Template",
            attachments: "test_invoice.pdf",
            error_message: ""
          };

          const response = await fetch(parsed.webhook_url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(testPayload),
            redirect: 'follow'
          });

          if (response.ok) {
            console.log("Sheets Webhook test connection success! Updating database...");
            await supabase
              .from('clients')
              .update({
                notes: JSON.stringify({
                  ...parsed,
                  test_webhook_requested: false,
                  test_webhook_status: 'success',
                  error_message: null,
                  updated_at: new Date().toISOString()
                })
              })
              .eq('business_name', 'SYSTEM_EXCEL_SYNC');
          } else {
            throw new Error(`Server responded with status \${response.status}`);
          }
        } catch (testErr) {
          console.error("Sheets Webhook verification failed:", testErr.message);
          await supabase
            .from('clients')
            .update({
              notes: JSON.stringify({
                ...parsed,
                test_webhook_requested: false,
                test_webhook_status: 'failed',
                error_message: testErr.message,
                updated_at: new Date().toISOString()
              })
            })
            .eq('business_name', 'SYSTEM_EXCEL_SYNC');
        }
      }
    }
  } catch (err) {
    console.error("Error checking Excel sync signals:", err.message);
  }
}

// Start worker
async function startWorker() {
  console.log("Starting ordinary Background WhatsApp & Email Worker...");
  
  // Check if session files already exist (auto-connect)
  const authDir = path.resolve(__dirname, '../../.baileys_auth');
  const hasAuthCreds = fs.existsSync(path.join(authDir, 'creds.json'));
  
  // Read database status
  const { data, error: selectError } = await supabase
    .from('clients')
    .select('status')
    .eq('business_name', 'SYSTEM_WHATSAPP_GATEWAY')
    .limit(1)
    .maybeSingle();

  let dbStatus = 'disconnected';
  if (data) {
    dbStatus = data.status;
  } else {
    console.log("SYSTEM_WHATSAPP_GATEWAY row missing. Auto-creating gateway record in worker...");
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
      console.error("Auto-creation of gateway row failed in worker:", insertError.message);
    } else if (newRows && newRows.length > 0) {
      dbStatus = newRows[0].status;
    }
  }
  
  if (hasAuthCreds || dbStatus === 'connected' || dbStatus === 'connecting') {
    console.log("Active session files or database state found. Reconnecting automatically...");
    connectToWhatsApp();
  } else {
    console.log("Idle. Waiting for 'Generate QR Code' request from settings dashboard...");
    await updateGatewayStatus({ status: 'disconnected' });
  }

  // Poll for frontend requests every 5 seconds
  checkInterval = setInterval(checkGatewaySignals, 5000);

  // Process outreach schedules every 30 seconds
  scheduleInterval = setInterval(processSchedules, 30000);
  
  // Initial check after 5 seconds
  setTimeout(processSchedules, 5000);
}

async function shutdownWorker() {
  clearInterval(checkInterval);
  clearInterval(scheduleInterval);
  await shutdownPostHog();
  process.exit(0);
}

process.on('SIGINT', shutdownWorker);
process.on('SIGTERM', shutdownWorker);

// Run
startWorker();
