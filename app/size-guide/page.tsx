'use client';

import { ScrollReveal } from '@/components/animations/ScrollReveal';

export default function SizeGuidePage() {
  const sizeData = [
    { size: 'XS', uk: '6', us: '2', bust: '31.5-32.5', waist: '24-25', hips: '34-35' },
    { size: 'S', uk: '8', us: '4', bust: '33.5-34.5', waist: '26-27', hips: '36-37' },
    { size: 'M', uk: '10', us: '6', bust: '35.5-36.5', waist: '28-29', hips: '38-39' },
    { size: 'L', uk: '12', us: '8', bust: '38-39.5', waist: '30.5-32', hips: '40.5-42' },
    { size: 'XL', uk: '14', us: '10', bust: '41-43', waist: '33.5-35.5', hips: '43.5-45.5' },
  ];

  return (
    <div className="bg-white min-h-screen pt-40 pb-32">
      <div className="max-w-5xl mx-auto px-6">
        <ScrollReveal>
          <span className="text-xs uppercase tracking-[0.5em] text-pink-600 font-bold mb-8 block text-center">Fit Guidance</span>
          <h1 className="text-5xl md:text-7xl font-serif-logo text-black mb-16 text-center leading-tight">
            The Perfect <span className="italic text-pink-600">Fit</span>
          </h1>
          <p className="text-lg text-gray-500 font-light max-w-2xl mx-auto text-center mb-24 leading-relaxed">
            Finding your perfect FabTops size is essential for the ultimate silhouette. If you find yourself between sizes, we generally recommend sizing up for structured pieces and staying true to size for our stretch collections.
          </p>
        </ScrollReveal>

        {/* Size Chart Table */}
        <ScrollReveal delay={0.2}>
          <div className="overflow-x-auto border border-pink-100 rounded-[2rem] bg-white shadow-xl shadow-pink-100/30">
            <table className="w-full text-left border-collapse">
              <thead className="bg-pink-50">
                <tr>
                  {['Size', 'UK', 'US', 'Bust (in)', 'Waist (in)', 'Hips (in)'].map((head) => (
                    <th key={head} className="p-8 text-[10px] uppercase tracking-[0.3em] font-black text-pink-900 border-b border-pink-100">{head}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sizeData.map((row) => (
                  <tr key={row.size} className="hover:bg-pink-50/30 transition-colors">
                    <td className="p-8 text-sm font-black text-black">{row.size}</td>
                    <td className="p-8 text-sm text-gray-500">{row.uk}</td>
                    <td className="p-8 text-sm text-gray-500">{row.us}</td>
                    <td className="p-8 text-sm text-gray-500">{row.bust}</td>
                    <td className="p-8 text-sm text-gray-500">{row.waist}</td>
                    <td className="p-8 text-sm text-gray-500">{row.hips}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ScrollReveal>

        {/* Measurement Tips */}
        <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-16">
          {[
            { title: "Bust", desc: "Measure around the fullest part of your chest with a soft tape measure." },
            { title: "Waist", desc: "Measure around the narrowest part of your natural waistline." },
            { title: "Hips", desc: "Measure around the fullest part of your hips, keeping feet together." }
          ].map((tip, i) => (
            <ScrollReveal key={tip.title} delay={i * 0.1}>
              <div className="text-center">
                <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center text-pink-600 mx-auto mb-6 text-xs font-black">{i + 1}</div>
                <h3 className="text-sm uppercase tracking-widest font-black text-black mb-4">{tip.title}</h3>
                <p className="text-sm text-gray-400 font-medium leading-relaxed">{tip.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </div>
  );
}
