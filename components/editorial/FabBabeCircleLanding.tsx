import { FabBabeSubscribeForm } from '@/components/layout/FabBabeSubscribeForm';

const BENEFITS = [
  'New arrivals before everyone else',
  'Exclusive member-only discounts',
  'Styling tips and fashion inspiration',
  'Birthday surprises',
  'Early access to sales',
  'Monthly Fab Babe picks',
];

export function FabBabeCircleLanding() {
  return (
    <section className="bg-brand-light px-6 py-32 md:px-12">
      <div className="mx-auto grid max-w-7xl gap-16 rounded-[3rem] border border-brand-dark/5 bg-white/70 p-10 shadow-xl shadow-brand-dark/5 backdrop-blur-xl lg:grid-cols-[1.15fr,0.85fr] lg:p-16">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.45em] text-brand-accent">Community Access</p>
          <h2 className="mt-4 text-5xl font-heading uppercase tracking-tight text-brand-dark md:text-7xl">
            Join the Circle
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-brand-dark/85">
            Be the first to hear what FabTops is creating next and stay connected to the women shaping the Circle.
          </p>

          <ul className="mt-10 grid gap-4 md:grid-cols-2">
            {BENEFITS.map((benefit) => (
              <li
                key={benefit}
                className="flex items-start gap-3 rounded-[1.5rem] border border-brand-dark/6 bg-brand-light/80 px-5 py-4 text-sm font-medium text-brand-dark/80"
              >
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-brand-accent" />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-[2rem] border border-brand-dark/6 bg-white px-6 py-8 shadow-sm md:px-8 md:py-10">
          <p className="text-[10px] font-black uppercase tracking-[0.35em] text-brand-dark/75">Fab Babe Updates</p>
          <h3 className="mt-4 text-2xl font-heading uppercase tracking-tight text-brand-dark md:text-3xl">
            Your Circle starts with one email.
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-brand-dark/85">
            Join our retention channel for private drops, styling guidance, and the monthly Fab Babe picks.
          </p>

          <div className="mt-8">
            <FabBabeSubscribeForm source="fab-babe-home" variant="inline" />
          </div>
        </div>
      </div>
    </section>
  );
}
