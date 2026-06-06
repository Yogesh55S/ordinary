'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, AlertCircle } from 'lucide-react';
import { uploadAttachment, deleteAttachment } from '@/lib/media';

// Import modular templates subcomponents
import TemplateFilters from '@/components/templates/TemplateFilters';
import TemplateGrid from '@/components/templates/TemplateGrid';
import TemplateModal from '@/components/templates/TemplateModal';

export default function TemplatesPage() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  
  // Copy clipboard tracking
  const [copiedId, setCopiedId] = useState(null);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    template_name: '',
    category: '',
    message_content: '',
    attachments: [],
    channel: 'whatsapp', // 'whatsapp' | 'email'
    subject: '', // For email template subject
  });
  
  const [formErrors, setFormErrors] = useState({});
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [pendingDeletions, setPendingDeletions] = useState([]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setTemplates(data || []);
    } catch (err) {
      console.error('Error fetching templates:', err);
      setError('Failed to load templates. Please check connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  // Unique categories list
  const categories = Array.from(
    new Set(
      templates
        .map((t) => t.category)
        .filter((cat) => cat && cat.trim() !== '')
    )
  );

  // Filter & Search
  const filteredTemplates = templates.filter((template) => {
    const matchesSearch = 
      (template.template_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (template.message_content || '').toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesCategory = categoryFilter === 'All' || template.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  const handleCopy = (template) => {
    let textToCopy = template.message_content;
    if (textToCopy.startsWith('[EMAIL]\nSubject:')) {
      const parts = textToCopy.split('---');
      textToCopy = parts.slice(1).join('---').trim();
    }
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(template.id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2050);
  };

  const handleAddClick = () => {
    setEditingTemplate(null);
    setFormData({
      template_name: '',
      category: '',
      message_content: '',
      attachments: [],
      channel: 'whatsapp',
      subject: '',
    });
    setFormErrors({});
    setUploadError(null);
    setPendingDeletions([]);
    setIsModalOpen(true);
  };

  const handleEditClick = (template) => {
    setEditingTemplate(template);
    
    let channel = 'whatsapp';
    let subject = '';
    let body = template.message_content || '';
    
    if (body.startsWith('[EMAIL]\nSubject:')) {
      channel = 'email';
      const parts = body.split('---');
      const header = parts[0] || '';
      body = parts.slice(1).join('---').trim();
      
      const subjectLine = header.split('\n')[1] || '';
      subject = subjectLine.replace('Subject:', '').trim();
    }

    setFormData({
      template_name: template.template_name || '',
      category: template.category || '',
      message_content: body,
      attachments: template.attachments || [],
      channel,
      subject,
    });
    
    setFormErrors({});
    setUploadError(null);
    setPendingDeletions([]);
    setIsModalOpen(true);
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploadingFile(true);
    setUploadError(null);
    try {
      const uploadedRows = [];
      for (const file of files) {
        const mediaRow = await uploadAttachment(file);
        uploadedRows.push({
          id: mediaRow.id,
          file_name: mediaRow.file_name,
          file_size: mediaRow.file_size,
          file_type: mediaRow.file_type,
          file_url: mediaRow.file_url,
        });
      }
      setFormData(prev => ({
        ...prev,
        attachments: [...(prev.attachments || []), ...uploadedRows]
      }));
    } catch (err) {
      console.error("Upload error:", err);
      setUploadError(err.message || "Failed to upload file.");
    } finally {
      setUploadingFile(false);
      e.target.value = '';
    }
  };

  const handleRemoveAttachment = (id) => {
    const fileToRemove = (formData.attachments || []).find(a => a.id === id);
    if (fileToRemove) {
      setPendingDeletions(prev => [...prev, fileToRemove]);
    }
    setFormData(prev => ({
      ...prev,
      attachments: (prev.attachments || []).filter(a => a.id !== id)
    }));
  };

  const handleDeleteClick = async (template) => {
    if (!confirm(`Are you sure you want to delete template "${template.template_name}"? This will delete the template and permanently remove its attachments from cloud storage.`)) {
      return;
    }
    
    try {
      setLoading(true);
      
      // 1. Delete associated media files from storage & db
      if (template.attachments && template.attachments.length > 0) {
        for (const attachment of template.attachments) {
          await deleteAttachment(attachment.id, attachment.file_url, 'outreach-media');
        }
      }
      
      // 2. Delete template record
      const { error: deleteError } = await supabase
        .from('templates')
        .delete()
        .eq('id', template.id);
        
      if (deleteError) throw deleteError;
      
      // Log
      await supabase.from('activity_logs').insert({
        action_type: 'Deleted Template',
        details: `Deleted template "${template.template_name}" and its attachments from system.`
      });

      fetchTemplates();
    } catch (err) {
      console.error('Error deleting template:', err);
      alert('Failed to delete template: ' + err.message);
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.template_name.trim()) {
      errors.template_name = 'Template name is required';
    }
    if (!formData.message_content.trim()) {
      errors.message_content = 'Message content is required';
    }
    if (formData.channel === 'email' && !formData.subject.trim()) {
      errors.subject = 'Email subject line is required';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Compile email message content
    let finalContent = formData.message_content.trim();
    if (formData.channel === 'email') {
      finalContent = `[EMAIL]\nSubject: ${formData.subject.trim()}\n---\n${finalContent}`;
    }

    const payload = {
      template_name: formData.template_name.trim(),
      category: formData.category.trim() || null,
      message_content: finalContent,
      attachments: formData.attachments || [],
    };

    try {
      setLoading(true);
      
      if (editingTemplate) {
        // Edit template
        const { error: updateError } = await supabase
          .from('templates')
          .update(payload)
          .eq('id', editingTemplate.id);
          
        if (updateError) throw updateError;

        await supabase.from('activity_logs').insert({
          action_type: 'Updated Template',
          details: `Updated template content for "${payload.template_name}".`
        });
      } else {
        // Add template
        const { error: insertError } = await supabase
          .from('templates')
          .insert(payload);
          
        if (insertError) throw insertError;

        await supabase.from('activity_logs').insert({
          action_type: 'Created Template',
          details: `Added new template "${payload.template_name}" to template list.`
        });
      }
      
      // Cleanup deleted attachments from storage
      if (pendingDeletions.length > 0) {
        for (const item of pendingDeletions) {
          await deleteAttachment(item.id, item.file_url, 'outreach-media');
        }
        setPendingDeletions([]);
      }

      setIsModalOpen(false);
      fetchTemplates();
    } catch (err) {
      console.error('Error saving template:', err);
      alert('Failed to save template: ' + err.message);
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">Message Templates</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Design customizable WhatsApp and Email outreach message patterns with tags.</p>
        </div>
        <button
          onClick={handleAddClick}
          className="inline-flex items-center justify-center px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm shadow-sm transition-all space-x-2"
        >
          <Plus className="h-4.5 w-4.5" />
          <span>Add Template</span>
        </button>
      </div>

      {error && (
        <div className="flex items-center space-x-3 p-4 bg-amber-50 dark:bg-amber-955/20 border border-amber-205 dark:border-amber-900/30 rounded-xl text-amber-850 dark:text-amber-400">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {/* Search & Filter Component */}
      <TemplateFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        categories={categories}
      />

      {/* Grid view Component */}
      <TemplateGrid
        templates={filteredTemplates}
        loading={loading}
        copiedId={copiedId}
        onCopy={handleCopy}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
      />

      {/* Add/Edit Modal Component */}
      <TemplateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleFormSubmit}
        categories={categories}
        formErrors={formErrors}
        editingTemplate={editingTemplate}
        
        // Attachment props
        uploadingFile={uploadingFile}
        uploadError={uploadError}
        onFileUpload={handleFileUpload}
        onRemoveAttachment={handleRemoveAttachment}
      />
    </div>
  );
}
