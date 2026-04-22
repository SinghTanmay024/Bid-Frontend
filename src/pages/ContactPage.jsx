import { useState } from 'react';
import toast from 'react-hot-toast';

const CONTACT_INFO = [
  {
    icon: '📍',
    title: 'Our Location',
    lines: ['123 WinBid Street', 'New York, NY 10001, USA'],
  },
  {
    icon: '✉️',
    title: 'Email Us',
    lines: ['support@winbid.com', 'sales@winbid.com'],
  },
  {
    icon: '📞',
    title: 'Call Us',
    lines: [
      '+91 8604500009 (Sales)',
      '+91 8604500009 (Support)',
    ],
    note: 'Business Hours: Monday - Friday, 9:00 AM - 6:00 PM EST',
  },
];

export default function ContactPage() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    subject: '',
    message: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = 'First name is required.';
    if (!form.lastName.trim()) e.lastName = 'Last name is required.';
    if (!form.email.trim()) {
      e.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      e.email = 'Enter a valid email address.';
    }
    if (!form.subject.trim()) e.subject = 'Subject is required.';
    if (!form.message.trim()) e.message = 'Message is required.';
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setLoading(true);
    // Simulate submission — replace with real API call when backend ready
    await new Promise((r) => setTimeout(r, 1200));
    toast.success("Message sent! We'll get back to you within 24 hours.");
    setForm({ firstName: '', lastName: '', email: '', subject: '', message: '' });
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0A0E1A] pt-16">
      {/* Hero */}
      <div
        className="relative py-16 px-4 text-center overflow-hidden"
        style={{
          background:
            'radial-gradient(ellipse at 50% 0%, rgba(168,85,247,0.12) 0%, transparent 65%), #0A0E1A',
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
            backgroundSize: '80px 80px',
          }}
        />
        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#A855F7]/30 bg-[#A855F7]/10 text-[#D8B4FE] text-sm font-medium mb-6">
            <span>💬</span>
            We&apos;d Love to Hear From You
          </div>
          <h1
            className="font-bold text-white mb-4"
            style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', lineHeight: 1.15 }}
          >
            Contact{' '}
            <span className="gradient-text">Us</span>
          </h1>
          <p className="text-[#9CA3AF] text-base leading-relaxed">
            Whether you have a question about our services, partnerships, or anything
            else, our team is ready to answer all your questions.
          </p>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* ── Contact Form ── */}
          <div className="lg:col-span-3">
            <div className="glass-card rounded-2xl p-8">
              <h2 className="text-white font-bold text-xl mb-6">Send us a message</h2>

              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                {/* Name row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field
                    label="First Name"
                    name="firstName"
                    value={form.firstName}
                    onChange={handleChange}
                    error={errors.firstName}
                    placeholder="John"
                    required
                  />
                  <Field
                    label="Last Name"
                    name="lastName"
                    value={form.lastName}
                    onChange={handleChange}
                    error={errors.lastName}
                    placeholder="Doe"
                    required
                  />
                </div>

                <Field
                  label="Email Address"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  error={errors.email}
                  placeholder="you@example.com"
                  required
                />

                <Field
                  label="Subject"
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  error={errors.subject}
                  placeholder="How can we help you?"
                  required
                />

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-[#E5E7EB] mb-1">
                    Your Message <span className="text-[#6366F1]">*</span>
                  </label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    rows={5}
                    placeholder="Tell us more about your question or feedback…"
                    className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:border-transparent text-sm bg-[#0A0E1A] text-[#E5E7EB] placeholder-[#6B7280] resize-none ${
                      errors.message
                        ? 'border-red-500 focus:ring-red-500/40'
                        : 'border-white/10 focus:ring-[#6366F1]/50'
                    }`}
                  />
                  {errors.message && (
                    <p className="mt-1 text-xs text-red-400">{errors.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#A855F7] text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/25"
                >
                  {loading ? 'Sending…' : 'Send Message →'}
                </button>
              </form>
            </div>
          </div>

          {/* ── Contact Info ── */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            <div className="glass-card rounded-2xl p-6">
              <h2 className="text-white font-bold text-xl mb-2">Contact Information</h2>
              <p className="text-[#9CA3AF] text-sm mb-6 leading-relaxed">
                Feel free to reach out to us through any of these channels. Our support
                team typically responds within 24 hours.
              </p>

              <div className="flex flex-col gap-6">
                {CONTACT_INFO.map((item) => (
                  <div key={item.title} className="flex gap-4">
                    <div className="shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-[#6366F1]/20 to-[#A855F7]/20 border border-white/10 flex items-center justify-center text-lg">
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-[#E5E7EB] font-semibold text-sm mb-1">
                        {item.title}
                      </p>
                      {item.lines.map((line) => (
                        <p key={line} className="text-[#9CA3AF] text-sm">
                          {line}
                        </p>
                      ))}
                      {item.note && (
                        <p className="text-[#6B7280] text-xs mt-1">{item.note}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick response badge */}
            <div className="rounded-2xl border border-[#10B981]/20 bg-[#10B981]/5 p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#10B981]/20 flex items-center justify-center text-xl shrink-0">
                ⚡
              </div>
              <div>
                <p className="text-white font-semibold text-sm">Quick Response</p>
                <p className="text-[#9CA3AF] text-xs mt-0.5">
                  We typically reply within 24 hours on business days.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Reusable input field ── */
function Field({ label, name, type = 'text', value, onChange, error, placeholder, required }) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#E5E7EB] mb-1">
        {label} {required && <span className="text-[#6366F1]">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:border-transparent text-sm bg-[#0A0E1A] text-[#E5E7EB] placeholder-[#6B7280] ${
          error
            ? 'border-red-500 focus:ring-red-500/40'
            : 'border-white/10 focus:ring-[#6366F1]/50'
        }`}
      />
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}
