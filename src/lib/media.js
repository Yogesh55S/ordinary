import { supabase } from './supabase';

/**
 * Uploads a file to the Supabase storage bucket 'outreach-media'
 * and registers it in the 'media' metadata table.
 * 
 * @param {File} file - Browser File object
 * @returns {Promise<Object>} - The inserted media database row
 */
export async function uploadAttachment(file) {
  if (!file) throw new Error("No file provided for upload");

  // Create a clean, unique file path to prevent collisions
  const cleanName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
  const uniqueName = `${Date.now()}_${cleanName}`;
  const filePath = `uploads/${uniqueName}`;

  // 1. Upload the file to the 'outreach-media' storage bucket
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('outreach-media')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (uploadError) {
    throw new Error(`Failed to upload to storage: ${uploadError.message}`);
  }

  // 2. Get the public retrieval URL for the uploaded asset
  const { data: urlData } = supabase.storage
    .from('outreach-media')
    .getPublicUrl(filePath);

  const fileUrl = urlData.publicUrl;

  // 3. Register the asset in the 'media' database table
  const { data: mediaRow, error: dbError } = await supabase
    .from('media')
    .insert({
      file_name: file.name,
      file_size: file.size,
      file_type: file.type,
      file_url: fileUrl,
      bucket_name: 'outreach-media'
    })
    .select()
    .single();

  if (dbError) {
    // Attempt clean up of orphaned file in storage if DB insert fails
    await supabase.storage.from('outreach-media').remove([filePath]);
    throw new Error(`Failed to register file in media table: ${dbError.message}`);
  }

  return mediaRow;
}

/**
 * Deletes a file from Supabase storage and removes its row in the 'media' table.
 * 
 * @param {string} id - Media entry UUID
 * @param {string} fileUrl - Public URL of the file
 * @param {string} bucketName - Target bucket name (defaults to 'outreach-media')
 */
export async function deleteAttachment(id, fileUrl, bucketName = 'outreach-media') {
  if (!id) return;

  try {
    if (fileUrl) {
      const bucketMarker = `${bucketName}/`;
      const markerIdx = fileUrl.indexOf(bucketMarker);
      if (markerIdx !== -1) {
        // Extract filepath inside the bucket (everything after bucket name)
        const filePath = decodeURIComponent(fileUrl.substring(markerIdx + bucketMarker.length));
        console.log(`Deleting file from Supabase storage: ${filePath}`);
        
        const { error: storageErr } = await supabase.storage
          .from(bucketName)
          .remove([filePath]);

        if (storageErr) {
          console.error(`Failed to delete storage asset: ${storageErr.message}`);
        }
      }
    }
  } catch (err) {
    console.error("Error parsing file path for deletion:", err.message);
  }

  // Remove the metadata row
  const { error: dbErr } = await supabase
    .from('media')
    .delete()
    .eq('id', id);

  if (dbErr) {
    console.error(`Failed to delete media metadata row: ${dbErr.message}`);
  }
}
