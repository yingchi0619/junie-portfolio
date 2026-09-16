'use client';
import Image from 'next/image';
import { miniweather, groundDsp, capacityProject } from './content';
export default function ProjectPreview({ id }: { id: string }) {
  if (id === 'capacity') return (
    <div className="preview capacity-project-preview" aria-label="Last-Mile Quality Intelligence actual dashboard screenshot">
      <div className="preview-chrome"><span><i /><i /><i /></span><span>LAST-MILE / QUALITY INTELLIGENCE</span><span>↗</span></div>
      <Image width={1280} height={720} unoptimized className="capacity-project-image" src={capacityProject.screenshot} alt="Actual Streamlit regional performance overview with station and DSP filters, delivery quality KPIs and capacity utilization" loading="lazy" draggable={false} />
      <div className="preview-disclaimer">Actual project screenshot · Synthetic analytics data</div>
    </div>
  );
  if (id === 'ground-dsp') return <div className="preview ground-preview" aria-label="GROUND DSP recruitment website screenshot"><div className="preview-chrome"><span><i /><i /><i /></span><span>GROUND / DSP PARTNER RECRUITMENT</span><span>↗</span></div><img className="ground-preview-image" src={groundDsp.screenshot} alt="GROUND DSP recruitment website showing its service-area map and partner recruitment introduction" loading="lazy" draggable={false} /><div className="preview-disclaimer">Live website screenshot · Application API & email notifications</div></div>;
  if (id === 'miniweather') return (
    <div className="preview mw-preview" aria-label="MiniWeather real weather and AI outfit examples">
      <div className="preview-chrome"><span><i /><i /><i /></span><span>MINIWEATHER / AI WEATHER + OOTD</span><span>↗</span></div>
      <div className="mw-live-screens">
        <Image width={407} height={695} unoptimized src={miniweather.screenshot} alt="Actual MiniWeather app showing Atlanta weather: 29°C, partly cloudy, feels like 34°C" loading="lazy" draggable={false} />
        <Image width={407} height={695} unoptimized src={miniweather.outfitScreenshot} alt="Actual Qwen and FLUX result: white cotton T-shirt, beige linen trousers and white sneakers" loading="lazy" draggable={false} />
      </div>
      <div className="preview-disclaimer">Actual app captures · Real weather + AI output · Sep 16, 2026</div>
    </div>
  );
  return (
    <div
      className={`preview preview-${id}`}
      aria-label={`${id} conceptual project visualization`}
    >
      <div className="preview-chrome">
        <span>
          <i />
          <i />
          <i />
        </span>
        <span>
          {id === 'commerce' ? 'COMMERCE / SERVER' : 'OOTD / MINI PROGRAM'}
        </span>
        <span>↗</span>
      </div>
      {id === 'commerce' ? (
        <div className="commerce-preview">
          <div className="code-panel">
            <span>SERVER LAYER</span>
            <p>
              <em>const</em> app = express();
            </p>
            <p>
              app.<b>use</b>(express.json());
            </p>
            <div className="code-line" />
            <div className="code-line short" />
            <span className="code-note">
              Illustrative code / not a source excerpt
            </span>
          </div>
          <div className="architecture">
            <div>REQUEST</div>
            <i>↓</i>
            <div className="active">NODE.JS / EXPRESS</div>
            <i>↓</i>
            <div>RESPONSE</div>
          </div>
        </div>
      ) : (
        <div className="ootd-preview">
          <span className="ootd-word">
            Everyday,
            <br />
            <i>considered.</i>
          </span>
          <div className="phone">
            <div className="phone-top">
              OOTD <span>•••</span>
            </div>
            <div className="phone-visual">
              <span>O</span>
            </div>
            <p>Outfit of the day</p>
            <div className="phone-lines">
              <i />
              <i />
            </div>
            <div className="phone-nav">
              ○ <span>⊕</span> ○
            </div>
          </div>
          <span className="ootd-caption">WECHAT / CONCEPTUAL STUDY</span>
        </div>
      )}
      <div className="preview-disclaimer">
        Conceptual visualization{' '}
        · not a production screenshot
      </div>
    </div>
  );
}
