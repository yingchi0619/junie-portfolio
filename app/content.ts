// Add verified URLs, dates and project evidence here. Empty links are never rendered.
export const profile = {
  name: 'Yingchi Zhu',
  preferredName: 'Junie',
  location: 'New Jersey / NYC',
  email: '',
  linkedin: '',
  github: '',
  resume: '',
  roleDates: '',
  skills: {
    Engineering: ['React', 'Next.js', 'TypeScript', 'Node.js'],
    Data: ['Python', 'SQL', 'PostgreSQL'],
    Infrastructure: ['AWS', 'Docker', 'CI/CD'],
  },
  projects: [
    {
      id: 'capacity',
      title: 'Root Cause & Capacity',
      type: 'Personal analytics project',
      stack: 'Streamlit · Pandas · Plotly',
      intro:
        'Connecting delivery performance, capacity utilization and the reasons behind exceptions.',
      problem:
        'Delivery timeliness and capacity utilization need to be considered together when examining last-mile exceptions.',
      contribution:
        'A logistics dashboard covering delivery timeliness, capacity utilization, exception causes and capacity adjustment scenarios.',
      approach:
        'Use Streamlit, Pandas and Plotly to explore these operational questions. The interactive example below isolates the relationship between parcel volume and available capacity.',
      outcome:
        'An analytical project for exploring capacity trade-offs. The example on this site uses synthetic data; no measured business impact or production deployment is claimed.',
      url: '',
    },
    {
      id: 'miniweather',
      title: 'MiniWeather',
      type: 'WeChat Mini Program · Product Engineering',
      stack: 'JavaScript · WXML / WXSS · Rule engine · Weather adapter',
      intro:
        'Weather-powered personal styling assistant.',
      problem:
        'A forecast does not tell you what to wear. Temperature swings, rain and personal comfort preferences need to become practical, understandable outfit choices.',
      contribution:
        'Built Today, Forecast, Style, Profile, onboarding, city selection and outfit detail flows. A native WeChat interface and accessible browser preview share the same weather-aware outfit engine, personal style preferences and formatting logic.',
      approach:
        'Use deterministic rules to combine apparent temperature, hourly and weekly forecasts, rain, wind and personal sensitivity. Separate weather access, preference persistence and presentation. The responsive mini-program UI includes recovery for denied location, unavailable weather, malformed storage and empty collections.',
      outcome:
        'A working browser demo with explicitly labeled synthetic weather and explainable rule-based recommendations, not connected AI. The project reports 18 Node/native-logic tests and 12 browser tests passing. A weather adapter exists, but the live backend, WeChat DevTools compilation and physical-device validation remain outstanding. Screenshots show the browser preview.',
      url: 'https://github.com/yingchi0619/miniweather',
    },
    {
      id: 'commerce',
      title: 'Commerce, behind the scenes.',
      type: 'Backend project',
      stack: 'Node.js · Express',
      intro: 'An e-commerce backend built with Node.js and Express.',
      problem:
        'The server-side layer of an e-commerce application is the focus of this project.',
      contribution: 'Backend project work using Node.js and Express.',
      approach:
        'A server-side e-commerce implementation. Endpoint, authentication and database details are not specified in the available project material.',
      outcome:
        'Demonstrates a backend project focus. No traffic, revenue or production reliability metrics are claimed.',
      url: '',
    },
    {
      id: 'ground-dsp',
      title: 'GROUND DSP Partner Recruitment',
      type: 'DSP Recruitment · Full-stack Web Development',
      stack: 'HTML / CSS · JavaScript · Python · SQLite · Resend API',
      intro: 'A live recruitment website connecting delivery service partners with the operations team.',
      problem: 'Prospective Delivery Service Partners (DSPs) need a clear way to explore service areas and apply. The operations team needs structured applications and timely notification when a partner expresses interest.',
      contribution: 'Built the DSP recruitment website with an interactive station map, a multilingual application form and an API-backed submission flow. Connected email notifications so new applications are sent to me for follow-up.',
      approach: 'The JavaScript form sends application details to a Python API. The server checks required fields, saves the application in SQLite and calls the Resend email API to notify the recruitment contact. The interface handles submission progress, success and failure states.',
      outcome: 'A publicly accessible recruitment site with a working application workflow and email notification integration. This project connects frontend interaction, backend data handling and my experience with DSP onboarding. No recruitment-volume or conversion metrics are claimed.',
      url: 'https://github.com/yingchi0619/GROUND_DSP_WEBSITE',
    },
  ],
};

export const miniweather = {
  demo: '/projects/miniweather/miniweather/prototype/index.html',
  caseStudy: '/projects/miniweather/docs/case-study.html',
  screenshotBase: '/projects/miniweather/docs/screenshots/',
  highlights: ['Weather-aware outfit engine', 'Personal style preferences', 'Hourly & weekly forecasts', 'Responsive mini-program UI'],
};

export const groundDsp = {
  live: 'https://ground-dsp-website.onrender.com/',
  screenshot: '/projects/ground-dsp/website.png',
};
