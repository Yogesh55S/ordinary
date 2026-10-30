'use client';

import { useEffect, useRef, useState } from 'react';
import Icon from './Icon';
import { contact } from '@/data/portfolio';
import { CONTACT_LIMITS, findPlan, validateContact } from '@/lib/contactValidation';
import { PLAN_SELECT_EVENT } from '@/lib/planSelection';
import { buildWhatsAppUrl } from '@/lib/whatsappMessage';

const INITIAL = {
  name: '',
  email: '',
  need: contact.form.defaultNeed,
  budget: '', // required: the visitor must pick one (or "Not sure yet")
  plan: '',
  message: '',
};

// Anchor target for the pricing cards (data: pricing.plans[].cta.href), on both form and success views.
const FORM_ID = 'contact-form';

const FIELD_ORDER = ['name', 'email', 'need', 'budget', 'message'];

export default function ContactForm() {
  const [values, setValues] = useState(INITIAL);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | success
  const [whatsappUrl, setWhatsappUrl] = useState('');
  const startedAt = useRef(0);
  const statusRef = useRef(status);
  const formRef = useRef(null);
  const successRef = useRef(null);

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  useEffect(() => {
    statusRef.current = status;
    if (status === 'success') successRef.current?.focus();
  }, [status]);

  // A pricing card was tapped: pre-select its plan and matching "What do you need?" chip.
  useEffect(() => {
    const onSelectPlan = (event) => {
      const plan = findPlan(event.detail?.planId);
      if (!plan) return;
      setValues((current) => ({ ...current, plan: plan.id, need: plan.need ?? current.need }));
      setErrors((current) => ({ ...current, need: undefined }));
      // After a sent message, bring the form back so the selection is visible.
      if (statusRef.current === 'success') {
        startedAt.current = Date.now();
        setStatus('idle');
      }
    };
    window.addEventListener(PLAN_SELECT_EVENT, onSelectPlan);
    return () => window.removeEventListener(PLAN_SELECT_EVENT, onSelectPlan);
  }, []);

  const update = (field) => (event) => {
    const value = event.target.value;
    setValues((current) => ({ ...current, [field]: value }));
    if (errors[field]) setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const focusFirstError = (fieldErrors) => {
    const first = FIELD_ORDER.find((field) => fieldErrors[field]);
    if (!first) return;
    formRef.current?.querySelector(`[data-field="${first}"]`)?.focus();
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const { values: clean, errors: fieldErrors } = validateContact(values);
    if (Object.keys(fieldErrors).length) {
      setErrors(fieldErrors);
      focusFirstError(fieldErrors);
      return;
    }

    // Open WhatsApp with the enquiry pre-filled. This must stay synchronous in the
    // submit handler: browsers (iOS Safari especially) block windows opened later.
    const chatUrl = buildWhatsAppUrl(clean);
    window.open(chatUrl, '_blank', 'noopener,noreferrer');

    // Email copy as a backup channel, sent in the background (keepalive survives the
    // visitor switching to WhatsApp). The browser already ran the same validation.
    const honeypot = new FormData(event.currentTarget).get('website') || '';
    fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...values, website: honeypot, startedAt: startedAt.current }),
      keepalive: true,
    })
      .then((res) => {
        if (!res.ok) console.warn('[contact] email copy not sent:', res.status);
      })
      .catch(() => console.warn('[contact] email copy not sent: network error'));

    setWhatsappUrl(chatUrl);
    setStatus('success');
    setValues(INITIAL);
  };

  const reset = () => {
    startedAt.current = Date.now();
    setStatus('idle');
    setErrors({});
  };

  if (status === 'success') {
    return (
      <div id={FORM_ID} className="ol-form ol-form__success" role="status" tabIndex={-1} ref={successRef}>
        <span className="ol-form__success-icon" aria-hidden="true">
          <Icon name="check" size={30} color="#FFFFFF" strokeWidth={2.6} />
        </span>
        <h3 className="ol-form__title">{contact.form.successTitle}</h3>
        <p className="ol-form__success-text">{contact.form.successText}</p>
        {/* Fallback if the browser blocked the automatic WhatsApp window. */}
        {whatsappUrl && (
          <a className="ol-btn ol-btn--ink ol-btn--md" href={whatsappUrl} target="_blank" rel="noopener noreferrer">
            <Icon name="whatsapp" size={18} />
            {contact.form.whatsappRetryLabel}
          </a>
        )}
        <button type="button" className="ol-btn ol-btn--white ol-btn--md" onClick={reset}>
          Send another message
        </button>
      </div>
    );
  }

  const selectedPlan = findPlan(values.plan);

  const fieldProps = (field) => ({
    'data-field': field,
    'aria-invalid': errors[field] ? true : undefined,
    'aria-describedby': errors[field] ? `c-${field}-error` : undefined,
  });

  const fieldError = (field) =>
    errors[field] ? (
      <p id={`c-${field}-error`} className="ol-field__error">
        {errors[field]}
      </p>
    ) : null;

  return (
    <form ref={formRef} id={FORM_ID} className="ol-form" aria-label="Project enquiry" noValidate onSubmit={handleSubmit}>
      <h3 className="ol-form__title">{contact.form.title}</h3>

      <div className="ol-form__row">
        <div className="ol-field">
          <label htmlFor="c-name">Your name</label>
          <input
            id="c-name"
            name="name"
            type="text"
            className="ol-input"
            placeholder="Jane Doe"
            autoComplete="name"
            required
            maxLength={CONTACT_LIMITS.name.max}
            value={values.name}
            onChange={update('name')}
            {...fieldProps('name')}
          />
          {fieldError('name')}
        </div>
        <div className="ol-field">
          <label htmlFor="c-email">Email</label>
          <input
            id="c-email"
            name="email"
            type="email"
            className="ol-input"
            placeholder="you@company.com"
            autoComplete="email"
            required
            maxLength={CONTACT_LIMITS.email.max}
            value={values.email}
            onChange={update('email')}
            {...fieldProps('email')}
          />
          {fieldError('email')}
        </div>
      </div>

      {selectedPlan && (
        <p className="ol-form__plan">
          <span>
            {contact.form.planLabel}: <strong>{selectedPlan.name}</strong>
          </span>
          <button
            type="button"
            className="ol-form__plan-clear"
            aria-label={`${contact.form.clearPlanLabel} (${selectedPlan.name})`}
            onClick={() => setValues((current) => ({ ...current, plan: '' }))}
          >
            <span aria-hidden="true">×</span>
          </button>
        </p>
      )}

      <fieldset className="ol-fieldset" aria-describedby={errors.need ? 'c-need-error' : undefined}>
        <legend className="ol-legend">What do you need?</legend>
        <div className="ol-chips">
          {contact.form.needs.map((need, index) => (
            <label key={need.id} className="ol-chip">
              <input
                type="radio"
                name="need"
                value={need.id}
                checked={values.need === need.id}
                onChange={update('need')}
                data-field={index === 0 ? 'need' : undefined}
              />
              {need.label}
            </label>
          ))}
        </div>
        {fieldError('need')}
      </fieldset>

      <div className="ol-field">
        <label htmlFor="c-budget">Budget range</label>
        <select
          id="c-budget"
          name="budget"
          className="ol-input"
          required
          value={values.budget}
          onChange={update('budget')}
          {...fieldProps('budget')}
        >
          <option value="" disabled>
            {contact.form.budgetPlaceholder}
          </option>
          {contact.form.budgets.map((budget) => (
            <option key={budget} value={budget}>
              {budget}
            </option>
          ))}
        </select>
        {fieldError('budget')}
      </div>

      <div className="ol-field">
        <label htmlFor="c-msg">Project details</label>
        <textarea
          id="c-msg"
          name="message"
          rows={4}
          className="ol-input"
          placeholder="Your idea, timeline, anything I should know…"
          required
          maxLength={CONTACT_LIMITS.message.max}
          value={values.message}
          onChange={update('message')}
          {...fieldProps('message')}
        />
        {fieldError('message')}
      </div>

      {/* Honeypot: invisible to people, tempting to bots. */}
      <div className="ol-hp" aria-hidden="true">
        <label htmlFor="c-website">Website</label>
        <input id="c-website" name="website" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
      </div>

      <button className="ol-btn ol-btn--ink ol-form__submit" type="submit">
        {contact.form.submitLabel}
        <Icon name="send" size={18} strokeWidth={2.4} />
      </button>
      <p className="ol-form__hint">{contact.form.submitHint}</p>
    </form>
  );
}
