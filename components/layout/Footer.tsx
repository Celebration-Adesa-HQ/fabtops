import Image from 'next/image';
import Link from 'next/link';
import { CurrencySelector } from './CurrencySelector';
import { NewsletterForm } from './NewsletterForm';

const SOCIAL_LINKS = [
  {
    name: 'Instagram',
    href: 'https://instagram.com/fabtops',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 2500 2500">
        <defs>
          <radialGradient id="insta_a" cx="332.14" cy="2511.81" r="3263.54" gradientUnits="userSpaceOnUse">
            <stop offset=".09" stopColor="#fa8f21"/><stop offset=".78" stopColor="#d82d7e"/>
          </radialGradient>
          <radialGradient id="insta_b" cx="1516.14" cy="2623.81" r="2572.12" gradientUnits="userSpaceOnUse">
            <stop offset=".64" stopColor="#8c3aaa" stopOpacity="0"/><stop offset="1" stopColor="#8c3aaa"/>
          </radialGradient>
        </defs>
        <path d="M833.4 1250c0-230.11 186.49-416.7 416.6-416.7s416.7 186.59 416.7 416.7-186.59 416.7-416.7 416.7-416.6-186.59-416.6-416.7m-225.26 0c0 354.5 287.36 641.86 641.86 641.86s641.86-287.36 641.86-641.86S1604.5 608.14 1250 608.14 608.14 895.5 608.14 1250m1159.13-667.31a150 150 0 1 0 150.06-149.94h-.06a150.07 150.07 0 0 0-150 149.94M745 2267.47c-121.87-5.55-188.11-25.85-232.13-43-58.36-22.72-100-49.78-143.78-93.5s-70.88-85.32-93.5-143.68c-17.16-44-37.46-110.26-43-232.13-6.06-131.76-7.27-171.34-7.27-505.15s1.31-373.28 7.27-505.15c5.55-121.87 26-188 43-232.13 22.72-58.36 49.78-100 93.5-143.78s85.32-70.88 143.78-93.5c44-17.16 110.26-37.46 232.13-43 131.76-6.06 171.34-7.27 505-7.27s373.28 1.31 505.15 7.27c121.87 5.55 188 26 232.13 43 58.36 22.62 100 49.78 143.78 93.5s70.78 85.42 93.5 143.78c17.16 44 37.46 110.26 43 232.13 6.06 131.87 7.27 171.34 7.27 505.15s-1.21 373.28-7.27 505.15c-5.55 121.87-25.95 188.11-43 232.13-22.72 58.36-49.78 100-93.5 143.68s-85.42 70.78-143.78 93.5c-44 17.16-110.26 37.46-232.13 43-131.76 6.06-171.34 7.27-505.15 7.27s-373.28-1.21-505-7.27M734.65 7.57c-133.07 6.06-224 27.16-303.41 58.06C349 97.54 279.38 140.35 209.81 209.81S97.54 349 65.63 431.24c-30.9 79.46-52 170.34-58.06 303.41C1.41 867.93 0 910.54 0 1250s1.41 382.07 7.57 515.35c6.06 133.08 27.16 223.95 58.06 303.41 31.91 82.19 74.62 152 144.18 221.43S349 2402.37 431.24 2434.37c79.56 30.9 170.34 52 303.41 58.06C868 2498.49 910.54 2500 1250 2500s382.07-1.41 515.35-7.57c133.08-6.06 223.95-27.16 303.41-58.06 82.19-32 151.86-74.72 221.43-144.18s112.18-139.24 144.18-221.43c30.9-79.46 52.1-170.34 58.06-303.41 6.06-133.38 7.47-175.89 7.47-515.35s-1.41-382.07-7.47-515.35c-6.06-133.08-27.16-224-58.06-303.41-32-82.19-74.72-151.86-144.18-221.43S2150.95 97.54 2068.86 65.63c-79.56-30.9-170.44-52.1-303.41-58.06C1632.17 1.51 1589.56 0 1250.1 0S868 1.41 734.65 7.57" fill="url(#insta_a)"/><path d="M833.4 1250c0-230.11 186.49-416.7 416.6-416.7s416.7 186.59 416.7 416.7-186.59 416.7-416.7 416.7-416.6-186.59-416.6-416.7m-225.26 0c0 354.5 287.36 641.86 641.86 641.86s641.86-287.36 641.86-641.86S1604.5 608.14 1250 608.14 608.14 895.5 608.14 1250m1159.13-667.31a150 150 0 1 0 150.06-149.94h-.06a150.07 150.07 0 0 0-150 149.94M745 2267.47c-121.87-5.55-188.11-25.85-232.13-43-58.36-22.72-100-49.78-143.78-93.5s-70.88-85.32-93.5-143.68c-17.16-44-37.46-110.26-43-232.13-6.06-131.76-7.27-171.34-7.27-505.15s1.31-373.28 7.27-505.15c5.55-121.87 26-188 43-232.13 22.72-58.36 49.78-100 93.5-143.78s85.32-70.88 143.78-93.5c44-17.16 110.26-37.46 232.13-43 131.76-6.06 171.34-7.27 505-7.27s373.28 1.31 505.15 7.27c121.87 5.55 188 26 232.13 43 58.36 22.62 100 49.78 143.78 93.5s70.78 85.42 93.5 143.78c17.16 44 37.46 110.26 43 232.13 6.06 131.87 7.27 171.34 7.27 505.15s-1.21 373.28-7.27 505.15c-5.55 121.87-25.95 188.11-43 232.13-22.72 58.36-49.78 100-93.5 143.68s-85.42 70.78-143.78 93.5c-44 17.16-110.26 37.46-232.13 43-131.76 6.06-171.34 7.27-505.15 7.27s-373.28-1.21-505-7.27M734.65 7.57c-133.07 6.06-224 27.16-303.41 58.06C349 97.54 279.38 140.35 209.81 209.81S97.54 349 65.63 431.24c-30.9 79.46-52 170.34-58.06 303.41C1.41 867.93 0 910.54 0 1250s1.41 382.07 7.57 515.35c6.06 133.08 27.16 223.95 58.06 303.41 31.91 82.19 74.62 152 144.18 221.43S349 2402.37 431.24 2434.37c79.56 30.9 170.34 52 303.41 58.06C868 2498.49 910.54 2500 1250 2500s382.07-1.41 515.35-7.57c133.08-6.06 223.95-27.16 303.41-58.06 82.19-32 151.86-74.72 221.43-144.18s112.18-139.24 144.18-221.43c30.9-79.46 52.1-170.34 58.06-303.41 6.06-133.38 7.47-175.89 7.47-515.35s-1.41-382.07-7.47-515.35c-6.06-133.08-27.16-224-58.06-303.41-32-82.19-74.72-151.86-144.18-221.43S2150.95 97.54 2068.86 65.63c-79.56-30.9-170.44-52.1-303.41-58.06C1632.17 1.51 1589.56 0 1250.1 0S868 1.41 734.65 7.57" fill="url(#insta_b)"/></svg>
    )
  },
  {
    name: 'Facebook',
    href: 'https://facebook.com/fabtops',
    icon: (
      <svg width="20" height="20" viewBox="17006.82 17511.1 8157.8 8157.8" xmlns="http://www.w3.org/2000/svg">
        <linearGradient id="fb_a" gradientUnits="userSpaceOnUse" x1="21085.72" x2="21085.72" y1="18249.39" y2="25150.62">
          <stop offset="0" stopColor="#00b2ff"/><stop offset="1" stopColor="#006aff"/>
        </linearGradient>
        <circle cx="21085.72" cy="21590" fill="#fff" r="4078.9"/>
        <path d="M21085.72 18309.17c1811.95 0 3280.83 1468.88 3280.83 3280.83s-1468.88 3280.83-3280.83 3280.83-3280.83-1468.88-3280.83-3280.83 1468.88-3280.83 3280.83-3280.83z" fill="url(#fb_a)"/>
        <path d="M21512.01 24843.29v-2534.17h714.43l94.7-891.91h-809.13l1.2-446.44c0-232.63 22.1-357.22 356.24-357.22h446.68v-892.06h-714.59c-858.35 0-1160.42 432.65-1160.42 1160.34v535.45h-535.07v891.99h535.07v2498.09c208.45 41.53 423.95 63.47 644.6 63.47a3310.9 3310.9 0 0 0 426.29-27.54z" fill="#fff"/>
      </svg>
    )
  },
  {
    name: 'X',
    href: 'https://twitter.com/fabtops',
    icon: (
      <svg viewBox="0 0 1200 1226.37" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor">
        <path d="M714.163 519.284L1160.89 0h-105.86L667.137 450.887 357.328 0H0l468.492 681.821L0 1226.37h105.866l409.625-476.152 327.181 476.152H1200L714.137 519.284zM569.165 687.828l-47.468-67.894-377.686-540.24h162.604l304.797 435.991 47.468 67.894 396.2 566.721H892.476L569.165 687.854z"/>
      </svg>
    )
  }
];

const FOOTER_LINKS = {
  Shopping: [
    { name: 'New Arrivals', href: '/shop' },
    { name: 'The Circle', href: '/circle' },
    { name: 'Best Sellers', href: '/shop/best-sellers' },
    { name: 'Collections', href: '/shop/collections' },
    { name: 'Archive', href: '/archive' },
  ],
  'Customer Care': [
    { name: 'Our Story', href: '/about' },
    { name: 'Shipping & Returns', href: '/shipping' },
    { name: 'Size Guide', href: '/size-guide' },
    { name: 'Contact Us', href: '/contact' },
  ]
};

export function Footer() {
  return (
    <footer className="bg-brand-dark text-brand-light pt-24 pb-12 px-6 md:px-12 border-t border-brand-light/5">
      <div className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16 md:gap-8">
          {/* Brand & Newsletter */}
          <div className="md:col-span-5 space-y-10">
            <div className="space-y-6">
              <Image src="/logo/Fab and Luxe Combined.png" alt="FabTops" width={200} height={200} className='w-48' priority />
              <p className="text-brand-light/60 max-w-sm text-sm leading-relaxed">
                Contemporary, premium fashion rooted in confidence, femininity, and self-expression. 
                Crafted for the modern woman who lives with intention.
              </p>
            </div>

            <NewsletterForm />
          </div>

          {/* Navigation Links */}
          <div className="md:col-span-5 grid grid-cols-2 gap-8">
            {Object.entries(FOOTER_LINKS).map(([title, links]) => (
              <div key={title} className="space-y-8">
                <h3 className="text-[11px] uppercase tracking-[0.2em] font-bold">{title}</h3>
                <ul className="space-y-4">
                  {links.map((link) => (
                    <li key={link.name}>
                      <Link 
                        href={link.href} 
                        className="text-sm text-brand-light/60 hover:text-brand-primary transition-colors duration-300"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Social Links Sidebar */}
          <div className="md:col-span-2 space-y-8">
            <h3 className="text-[11px] uppercase tracking-[0.2em] font-bold">Follow Us</h3>
            <div className="flex md:flex-col items-center md:items-start gap-6">
              {SOCIAL_LINKS.map((social) => (
                <Link 
                  key={social.name} 
                  href={social.href} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-4 text-brand-light/60 hover:text-brand-primary transition-all duration-300"
                >
                  <div className="transition-transform duration-500 group-hover:scale-110">
                    {social.icon}
                  </div>
                  <span className="hidden md:inline text-[10px] uppercase tracking-widest font-bold opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500">
                    {social.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Legal Footer */}
        <div className="mt-24 pt-10 border-t border-brand-light/10 flex flex-col md:flex-row items-center justify-between gap-8 text-[10px] uppercase tracking-[0.2em] text-brand-light/40">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 text-center md:text-left">
            <p>© 2024 FabTops Digital Flagship.</p>
            <div className="flex items-center gap-8">
              <Link href="/privacy" className="hover:text-brand-light transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-brand-light transition-colors">Terms of Service</Link>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <CurrencySelector variant="footer" />
            <div className="h-px w-8 bg-brand-light/10" />
            <span className="hover:text-brand-light cursor-pointer transition-colors">English</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
