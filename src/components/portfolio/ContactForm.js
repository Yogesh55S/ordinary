'use client';

import { useEffect, useRef, useState } from 'react';
import Icon from './Icon';
import { contact, site } from '@/data/portfolio';
import { CONTACT_LIMITS, validateContact } from '@/lib/contactValidation';

const INITIAL = {
  name: '',
  email: '',
  need: contact.form.defaultNeed,
  budget: contact.form.budgets[0],
  message: '',
};

const FIELD_ORDER = ['name', 'email', 'need', 'budget', 'message'];

export default function ContactForm() {
  const [values, setValues] = useState(INITIAL);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | sending | success | error
  const [serverMessage, setServerMessage] = useState('');
  const startedAt = useRef(0);
  const formRef = useRef(null);
  const successRef = useRef(null);

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  useEffect(() => {
    if (status === 'success') successRef.current?.focus();
  }, [status]);

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

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (status === 'sending') return;

    const { errors: fieldErrors } = validateContact(values);
    if (Object.keys(fieldErrors).length) {
      setErrors(fieldErrors);
      focusFirstError(fieldErrors);
      return;
    }

    setStatus('sending');
    setServerMessage('');
    const honeypot = new FormData(event.currentTarget).get('website') || '';

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, website: honeypot, startedAt: startedAt.current }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setStatus('success');
        setValues(INITIAL);
        return;
      }
      if (data.errors) {
        setErrors(data.errors);
        focusFirstError(data.errors);
      }
      setServerMessage(data.error || 'Something went wrong while sending.');
      setStatus('error');
    } catch (_) {
      setServerMessage('Could not reach the server. Check your connection and try again.');
      setStatus('error');
    }
  };

  const reset = () => {
    startedAt.current = Date.now();
    setStatus('idle');
    setErrors({});
  };

  if (status === 'success') {
    return (
      <div className="ol-form ol-form__success" role="status" tabIndex={-1} ref={successRef}>
        <span className="ol-form__success-icon" aria-hidden="true">
          <Icon name="check" size={30} color="#FFFFFF" strokeWidth={2.6} />
        </span>
        <h3 className="ol-form__title">{contact.form.successTitle}</h3>
        <p className="ol-form__success-text">{contact.form.successText}</p>
        <button type="button" className="ol-btn ol-btn--white ol-btn--md" onClick={reset}>
          Send another message
        </button>
      </div>
    );
  }

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
    <form ref={formRef} className="ol-form" aria-label="Project enquiry" noValidate onSubmit={handleSubmit}>
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
        <select id="c-budget" name="budget" className="ol-input" value={values.budget} onChange={update('budget')} {...fieldProps('budget')}>
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

      {status === 'error' && serverMessage && (
        <p className="ol-form__alert" role="alert">
          {serverMessage} You can also email me at <a href={`mailto:${site.email}`}>{site.email}</a>.
        </p>
      )}

      <button className="ol-btn ol-btn--ink ol-form__submit" type="submit" disabled={status === 'sending'}>
        {status === 'sending' ? 'Sending…' : contact.form.submitLabel}
        <Icon name="send" size={18} strokeWidth={2.4} />
      </button>
    </form>
  );
}
