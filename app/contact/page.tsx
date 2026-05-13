'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, MessageCircle, Clock, Loader2 } from 'lucide-react';
import { ScrollReveal } from '@/components/animations/ScrollReveal';

const InstagramIcon = ({ size, className }: { size: number; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 2500 2500" className={className}><defs><radialGradient id="a" cx="332.14" cy="2511.81" r="3263.54" gradientUnits="userSpaceOnUse"><stop offset=".09" stopColor="#fa8f21"/><stop offset=".78" stopColor="#d82d7e"/></radialGradient><radialGradient id="b" cx="1516.14" cy="2623.81" r="2572.12" gradientUnits="userSpaceOnUse"><stop offset=".64" stopColor="#8c3aaa" stopOpacity="0"/><stop offset="1" stopColor="#8c3aaa"/></radialGradient></defs><path d="M833.4 1250c0-230.11 186.49-416.7 416.6-416.7s416.7 186.59 416.7 416.7-186.59 416.7-416.7 416.7-416.6-186.59-416.6-416.7m-225.26 0c0 354.5 287.36 641.86 641.86 641.86s641.86-287.36 641.86-641.86S1604.5 608.14 1250 608.14 608.14 895.5 608.14 1250m1159.13-667.31a150 150 0 1 0 150.06-149.94h-.06a150.07 150.07 0 0 0-150 149.94M745 2267.47c-121.87-5.55-188.11-25.85-232.13-43-58.36-22.72-100-49.78-143.78-93.5s-70.88-85.32-93.5-143.68c-17.16-44-37.46-110.26-43-232.13-6.06-131.76-7.27-171.34-7.27-505.15s1.31-373.28 7.27-505.15c5.55-121.87 26-188 43-232.13 22.72-58.36 49.78-100 93.5-143.78s85.32-70.88 143.78-93.5c44-17.16 110.26-37.46 232.13-43 131.76-6.06 171.34-7.27 505-7.27s373.28 1.31 505.15 7.27c121.87 5.55 188 26 232.13 43 58.36 22.62 100 49.78 143.78 93.5s70.78 85.42 93.5 143.78c17.16 44 37.46 110.26 43 232.13 6.06 131.87 7.27 171.34 7.27 505.15s-1.21 373.28-7.27 505.15c-5.55 121.87-25.95 188.11-43 232.13-22.72 58.36-49.78 100-93.5 143.68s-85.42 70.78-143.78 93.5c-44 17.16-110.26 37.46-232.13 43-131.76 6.06-171.34 7.27-505.15 7.27s-373.28-1.21-505-7.27M734.65 7.57c-133.07 6.06-224 27.16-303.41 58.06C349 97.54 279.38 140.35 209.81 209.81S97.54 349 65.63 431.24c-30.9 79.46-52 170.34-58.06 303.41C1.41 867.93 0 910.54 0 1250s1.41 382.07 7.57 515.35c6.06 133.08 27.16 223.95 58.06 303.41 31.91 82.19 74.62 152 144.18 221.43S349 2402.37 431.24 2434.37c79.56 30.9 170.34 52 303.41 58.06C868 2498.49 910.54 2500 1250 2500s382.07-1.41 515.35-7.57c133.08-6.06 223.95-27.16 303.41-58.06 82.19-32 151.86-74.72 221.43-144.18s112.18-139.24 144.18-221.43c30.9-79.46 52.1-170.34 58.06-303.41 6.06-133.38 7.47-175.89 7.47-515.35s-1.41-382.07-7.47-515.35c-6.06-133.08-27.16-224-58.06-303.41-32-82.19-74.72-151.86-144.18-221.43S2150.95 97.54 2068.86 65.63c-79.56-30.9-170.44-52.1-303.41-58.06C1632.17 1.51 1589.56 0 1250.1 0S868 1.41 734.65 7.57" fill="url(#a)"/><path d="M833.4 1250c0-230.11 186.49-416.7 416.6-416.7s416.7 186.59 416.7 416.7-186.59 416.7-416.7 416.7-416.6-186.59-416.6-416.7m-225.26 0c0 354.5 287.36 641.86 641.86 641.86s641.86-287.36 641.86-641.86S1604.5 608.14 1250 608.14 608.14 895.5 608.14 1250m1159.13-667.31a150 150 0 1 0 150.06-149.94h-.06a150.07 150.07 0 0 0-150 149.94M745 2267.47c-121.87-5.55-188.11-25.85-232.13-43-58.36-22.72-100-49.78-143.78-93.5s-70.88-85.32-93.5-143.68c-17.16-44-37.46-110.26-43-232.13-6.06-131.76-7.27-171.34-7.27-505.15s1.31-373.28 7.27-505.15c5.55-121.87 26-188 43-232.13 22.72-58.36 49.78-100 93.5-143.78s85.32-70.88 143.78-93.5c44-17.16 110.26-37.46 232.13-43 131.76-6.06 171.34-7.27 505-7.27s373.28 1.31 505.15 7.27c121.87 5.55 188 26 232.13 43 58.36 22.62 100 49.78 143.78 93.5s70.78 85.42 93.5 143.78c17.16 44 37.46 110.26 43 232.13 6.06 131.87 7.27 171.34 7.27 505.15s-1.21 373.28-7.27 505.15c-5.55 121.87-25.95 188.11-43 232.13-22.72 58.36-49.78 100-93.5 143.68s-85.42 70.78-143.78 93.5c-44 17.16-110.26 37.46-232.13-43-131.76 6.06-171.34 7.27-505.15 7.27s-373.28-1.21-505-7.27M734.65 7.57c-133.07 6.06-224 27.16-303.41 58.06C349 97.54 279.38 140.35 209.81 209.81S97.54 349 65.63 431.24c-30.9 79.46-52 170.34-58.06 303.41C1.41 867.93 0 910.54 0 1250s1.41 382.07 7.57 515.35c6.06 133.08 27.16 223.95 58.06 303.41 31.91 82.19 74.62 152 144.18 221.43S349 2402.37 431.24 2434.37c79.56 30.9 170.34 52 303.41 58.06C868 2498.49 910.54 2500 1250 2500s382.07-1.41 515.35-7.57c133.08-6.06 223.95-27.16 303.41-58.06 82.19-32 151.86-74.72 221.43-144.18s112.18-139.24 144.18-221.43c30.9-79.46 52.1-170.34 58.06-303.41 6.06-133.38 7.47-175.89 7.47-515.35s-1.41-382.07-7.47-515.35c-6.06-133.08-27.16-224-58.06-303.41-32-82.19-74.72-151.86-144.18-221.43S2150.95 97.54 2068.86 65.63c-79.56-30.9-170.44-52.1-303.41-58.06C1632.17 1.51 1589.56 0 1250.1 0S868 1.41 734.65 7.57" fill="url(#b)"/></svg>
 );

const XIcon = ({ size, className }: { size: number; className?: string }) => (
  <svg fill="currentColor" width={size} height={size} xmlns="http://www.w3.org/2000/svg" viewBox="0.254 0.25 500 451.95400000000006" className={className}><path d="M394.033.25h76.67L303.202 191.693l197.052 260.511h-154.29L225.118 294.205 86.844 452.204H10.127l179.16-204.77L.254.25H158.46l109.234 144.417zm-26.908 406.063h42.483L135.377 43.73h-45.59z"/></svg>
);

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSubmitted, setIsSubmitted] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  return (
    <main className="bg-brand-secondary min-h-screen pt-40 pb-32">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        {/* Header Section */}
        <ScrollReveal>
          <header className="max-w-4xl mb-32 space-y-8">
            <div className="flex items-center gap-3">
              <div className="h-px w-12 bg-brand-dark/20" />
              <span className="text-[11px] uppercase tracking-[0.5em] font-black text-brand-dark/40">Connect With Us</span>
            </div>
            <h1 className="text-6xl md:text-9xl font-heading text-brand-dark uppercase tracking-tighter leading-[0.85]">
              Let's <span className="italic opacity-50">Converse</span>
            </h1>
            <p className="text-brand-dark/60 text-lg md:text-xl max-w-2xl leading-relaxed uppercase tracking-[0.05em] font-medium">
              Our concierge team is here to assist with your styling journey, order inquiries, or any brand experiences.
            </p>
          </header>
        </ScrollReveal>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-24">
          {/* Contact Details Side */}
          <div className="lg:col-span-5 space-y-20">
            <ScrollReveal delay={0.2}>
              <div className="space-y-12">
                <div className="space-y-6">
                  <h3 className="text-[12px] uppercase tracking-[0.3em] font-black text-brand-dark">The Atelier</h3>
                  <div className="flex items-start gap-6 group">
                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-brand-dark group-hover:bg-brand-dark group-hover:text-white transition-all duration-500">
                      <MapPin size={20} strokeWidth={1.5} />
                    </div>
                    <p className="text-brand-dark/60 text-sm uppercase tracking-widest leading-loose font-bold">
                      12 Luxury Lane, VI <br />
                      Lagos, Nigeria <br />
                      Digital Flagship Operations
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-[12px] uppercase tracking-[0.3em] font-black text-brand-dark">Direct Lines</h3>
                  <div className="space-y-4">
                    <a href="mailto:concierge@fabtops.com" className="flex items-center gap-6 group">
                      <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-brand-dark group-hover:bg-brand-dark group-hover:text-white transition-all duration-500">
                        <Mail size={20} strokeWidth={1.5} />
                      </div>
                      <span className="text-brand-dark/60 text-sm uppercase tracking-widest font-black group-hover:text-brand-dark transition-colors">concierge@fabtops.com</span>
                    </a>
                    <a href="tel:+234000000000" className="flex items-center gap-6 group">
                      <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-brand-dark group-hover:bg-brand-dark group-hover:text-white transition-all duration-500">
                        <Phone size={20} strokeWidth={1.5} />
                      </div>
                      <span className="text-brand-dark/60 text-sm uppercase tracking-widest font-black group-hover:text-brand-dark transition-colors">+234 (0) 800 FAB TOPS</span>
                    </a>
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-[12px] uppercase tracking-[0.3em] font-black text-brand-dark">Concierge Hours</h3>
                  <div className="flex items-start gap-6 group">
                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-brand-dark">
                      <Clock size={20} strokeWidth={1.5} />
                    </div>
                    <div className="text-brand-dark/60 text-sm uppercase tracking-widest leading-loose font-bold">
                      <p>Mon — Fri: 09:00 - 18:00 WAT</p>
                      <p>Sat: 10:00 - 14:00 WAT</p>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* Social Grid */}
            <ScrollReveal delay={0.4}>
              <div className="pt-12 border-t border-brand-dark/10">
                <h3 className="text-[12px] uppercase tracking-[0.3em] font-black text-brand-dark mb-8">Social Presence</h3>
                <div className="flex gap-4">
                  {[
                    { icon: InstagramIcon, label: 'Instagram' },
                    { icon: XIcon, label: 'X (Twitter)' },
                    { icon: MessageCircle, label: 'WhatsApp' }
                  ].map((social, i) => (
                    <button key={i} className="flex-1 flex items-center justify-center gap-3 py-4 bg-white/10 hover:bg-white/40 border border-brand-dark/5 transition-all rounded-xl group">
                      <social.icon size={18} className="text-brand-dark/40 group-hover:text-brand-dark transition-colors" />
                      <span className="text-[10px] uppercase tracking-widest font-black text-brand-dark/40 group-hover:text-brand-dark transition-colors">{social.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* Contact Form Section */}
          <div className="lg:col-span-7">
            <ScrollReveal delay={0.3}>
              <div className="bg-white/20 backdrop-blur-xl border border-white/40 p-8 md:p-16 rounded-[3rem] shadow-2xl shadow-brand-dark/5">
                {isSubmitted ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="py-20 text-center space-y-8"
                  >
                    <div className="w-24 h-24 bg-brand-dark text-white rounded-full flex items-center justify-center mx-auto shadow-2xl">
                      <Send size={40} />
                    </div>
                    <div className="space-y-4">
                      <h2 className="text-3xl font-heading text-brand-dark uppercase tracking-tight">Message Received</h2>
                      <p className="text-brand-dark/60 uppercase tracking-widest text-xs font-black max-w-sm mx-auto leading-loose">
                        Our concierge will review your inquiry and respond within 24 business hours.
                      </p>
                    </div>
                    <button 
                      onClick={() => setIsSubmitted(false)}
                      className="text-[11px] uppercase tracking-[0.4em] font-black text-brand-dark hover:text-brand-primary transition-colors underline underline-offset-8"
                    >
                      Send Another Inquiry
                    </button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                      <div className="space-y-4">
                        <label className="text-[10px] uppercase tracking-[0.3em] font-black text-brand-dark/40 ml-4">Your Identity</label>
                        <input 
                          required
                          type="text" 
                          placeholder="FULL NAME"
                          className="w-full bg-white/40 border border-transparent focus:border-brand-dark/20 focus:bg-white/60 py-6 px-8 rounded-2xl text-xs uppercase tracking-widest font-black text-brand-dark transition-all outline-none placeholder:text-brand-dark/20"
                        />
                      </div>
                      <div className="space-y-4">
                        <label className="text-[10px] uppercase tracking-[0.3em] font-black text-brand-dark/40 ml-4">Digital Reference</label>
                        <input 
                          required
                          type="email" 
                          placeholder="EMAIL ADDRESS"
                          className="w-full bg-white/40 border border-transparent focus:border-brand-dark/20 focus:bg-white/60 py-6 px-8 rounded-2xl text-xs uppercase tracking-widest font-black text-brand-dark transition-all outline-none placeholder:text-brand-dark/20"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] uppercase tracking-[0.3em] font-black text-brand-dark/40 ml-4">Inquiry Subject</label>
                      <select className="w-full bg-white/40 border border-transparent focus:border-brand-dark/20 focus:bg-white/60 py-6 px-8 rounded-2xl text-xs uppercase tracking-widest font-black text-brand-dark transition-all outline-none appearance-none cursor-pointer">
                        <option>ORDER ASSISTANCE</option>
                        <option>STYLING ADVICE</option>
                        <option>RETURNS & EXCHANGES</option>
                        <option>COLLABORATIONS</option>
                        <option>OTHER INQUIRIES</option>
                      </select>
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] uppercase tracking-[0.3em] font-black text-brand-dark/40 ml-4">Your Message</label>
                      <textarea 
                        required
                        placeholder="HOW CAN WE ASSIST YOU?"
                        rows={6}
                        className="w-full bg-white/40 border border-transparent focus:border-brand-dark/20 focus:bg-white/60 py-8 px-8 rounded-[2rem] text-xs uppercase tracking-widest font-black text-brand-dark transition-all outline-none placeholder:text-brand-dark/20 resize-none"
                      />
                    </div>

                    <button 
                      disabled={isSubmitting}
                      className="w-full bg-brand-dark text-white py-8 rounded-[2rem] text-[11px] uppercase tracking-[0.5em] font-black hover:bg-brand-primary transition-all shadow-2xl shadow-brand-dark/20 flex items-center justify-center gap-4 group"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="animate-spin" size={18} />
                          Processing
                        </>
                      ) : (
                        <>
                          Dispatch Message
                          <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </main>
  );
}

function ArrowRight({ size, className }: { size: number; className?: string }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}
