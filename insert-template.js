const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const htmlContent = fs.readFileSync('resume_email_template.html', 'utf-8');
  
  const { data, error } = await supabase
    .from('job_email_template')
    .insert({
      name: 'Modern Resume Template',
      html_content: htmlContent,
      plain_text_content: 'Please view this email in an HTML-compatible client.',
      is_default: false
    })
    .select()
    .single();

  if (error) {
    console.error('Error inserting template:', error);
  } else {
    console.log('Successfully inserted template with ID:', data.id);
  }
}

main();
