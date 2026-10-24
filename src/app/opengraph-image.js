import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';
import { hero, site } from '@/data/portfolio';

export const alt = `${site.name} — Full-Stack Developer`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// Social share card in the portfolio style: paper background, ink-bordered card, red logo.
export default async function OpenGraphImage() {
  const logo = await readFile(join(process.cwd(), 'public', 'brand', 'logo-red.png'));
  const logoSrc = `data:image/png;base64,${logo.toString('base64')}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          background: '#F4F2EE',
          padding: 56,
        }}
      >
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            background: '#FFFFFF',
            border: '4px solid #1B1A19',
            borderRadius: 36,
            boxShadow: '16px 18px 0 #1B1A19',
            padding: '48px 56px',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoSrc} width={222} height={120} alt="" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ fontSize: 64, fontWeight: 900, color: '#1B1A19', letterSpacing: -2, lineHeight: 1.05 }}>
              {hero.headingLead}
            </div>
            <div style={{ fontSize: 64, fontWeight: 900, color: '#C1270A', letterSpacing: -2, lineHeight: 1.05 }}>
              {hero.rotatingWords[0]}
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 28, color: '#4A4541', fontWeight: 600 }}>Full-stack developer · MERN · React · Node.js</div>
            <div
              style={{
                display: 'flex',
                background: '#C1270A',
                color: '#FFFFFF',
                fontSize: 26,
                fontWeight: 700,
                padding: '14px 28px',
                borderRadius: 999,
                border: '3px solid #1B1A19',
              }}
            >
              {"Let's talk"}
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
