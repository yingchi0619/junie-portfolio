'use client';
import { miniweather, groundDsp } from './content';
export default function ProjectPreview({ id }: { id: string }) {
  if (id === 'ground-dsp') return <div className="preview ground-preview" aria-label="GROUND DSP recruitment website screenshot"><div className="preview-chrome"><span><i /><i /><i /></span><span>GROUND / DSP PARTNER RECRUITMENT</span><span>↗</span></div><img className="ground-preview-image" src={groundDsp.screenshot} alt="GROUND DSP recruitment website showing its service-area map and partner recruitment introduction" loading="lazy" draggable={false} /><div className="preview-disclaimer">Live website screenshot · Application API & email notifications</div></div>;
  if (id === 'miniweather') return (
    <div className="preview mw-preview" aria-label="MiniWeather actual browser preview screenshots">
      <div className="preview-chrome"><span><i /><i /><i /></span><span>MINIWEATHER / PRODUCT ENGINEERING</span><span>↗</span></div>
      <div className="mw-preview-screens">
        {[
          ['01-today.png', 'Today: sample weather and a recommended outfit'],
          ['02-forecast.png', 'Forecast: hourly and weekly synthetic weather'],
          ['04-style.png', 'Style: personal clothing preferences'],
        ].map(([file, alt]) => <img key={file} src={miniweather.screenshotBase + file} alt={alt} loading="lazy" draggable={false} />)}
      </div>
      <div className="preview-disclaimer">Actual browser preview · Synthetic weather · Rule-based recommendations</div>
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
          {id === 'capacity'
            ? 'CAPACITY / ANALYTICS'
            : id === 'miniweather'
              ? 'MINIWEATHER / PROTOTYPE'
              : id === 'commerce'
                ? 'COMMERCE / SERVER'
                : 'OOTD / MINI PROGRAM'}
        </span>
        <span>↗</span>
      </div>
      {id === 'capacity' ? (
        <div className="dashboard-preview">
          <div className="dash-side">
            <b>RC /</b>
            <span>Overview</span>
            <span>Capacity</span>
            <span>Exceptions</span>
            <span>Scenarios</span>
          </div>
          <div className="dash-content">
            <div className="dash-title">
              <span>Capacity overview</span>
              <span>Illustrative data</span>
            </div>
            <div className="dash-metrics">
              <div>
                <span>Daily volume</span>
                <strong>1,200</strong>
              </div>
              <div>
                <span>Available capacity</span>
                <strong>1,500</strong>
              </div>
              <div>
                <span>Load</span>
                <strong>
                  80<small>%</small>
                </strong>
              </div>
            </div>
            <div className="dash-chart">
              <div className="chart-grid" />
              <svg viewBox="0 0 420 105" aria-hidden="true">
                <path
                  d="M0 80 L45 66 L90 77 L135 34 L180 48 L225 20 L270 42 L315 16 L360 27 L420 5"
                  fill="none"
                  stroke="#667457"
                  strokeWidth="2"
                />
                <path
                  d="M0 95 L45 85 L90 87 L135 65 L180 80 L225 58 L270 65 L315 40 L360 45 L420 30"
                  fill="none"
                  stroke="#c7bba2"
                  strokeWidth="1"
                />
              </svg>
            </div>
            <div className="dash-bottom">
              <span>VOLUME / CAPACITY</span>
              <span>EXPLORE THE RELATIONSHIP →</span>
            </div>
          </div>
        </div>
      ) : id === 'miniweather' ? (
        <div className="weather-preview">
          <div className="weather-overview">
            <span className="weather-city">BEIJING / SAMPLE CONDITIONS</span>
            <div className="weather-now">
              <strong>
                23<span>°</span>
              </strong>
              <svg viewBox="0 0 64 64" aria-hidden="true">
                <circle
                  cx="32"
                  cy="32"
                  r="12"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <path
                  d="M32 5V12M32 52V59M5 32H12M52 32H59M13 13L18 18M46 46L51 51M13 51L18 46M46 18L51 13"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
              </svg>
            </div>
            <p>
              Clear skies.
              <br />
              <em>A considered day.</em>
            </p>
            <span className="weather-footer">WEATHER / OUTFIT / PROFILE</span>
          </div>
          <div className="weather-details">
            <div className="weather-context">
              <span>CONTEXT ASSEMBLY</span>
              <div>
                <small>CITY WEATHER</small>
                <b>23° / CLEAR</b>
              </div>
              <div>
                <small>USER PREFERENCE</small>
                <b>COMFORT / COLOR</b>
              </div>
              <div>
                <small>TODAY’S STYLE</small>
                <b>USER SELECTED</b>
              </div>
            </div>
            <div
              className="weather-ai-flow"
              aria-label="AI recommendation flow"
            >
              <span>↓</span>
              <strong>DEEPSEEK</strong>
              <span>↓</span>
            </div>
            <div className="weather-output">
              <span>GENERATED OUTPUT</span>
              <div>
                <i>IMAGE</i>
                <p>
                  Outfit preview
                  <br />+ recommendation
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : id === 'commerce' ? (
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
        {id === 'capacity'
          ? 'Synthetic visualization'
          : 'Conceptual visualization'}{' '}
        · not a production screenshot
      </div>
    </div>
  );
}
