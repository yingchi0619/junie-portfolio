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
      type: 'Operations Intelligence · Data & Analytics',
      stack: 'Python · DuckDB / SQL · Streamlit · Pandas · Plotly',
      intro:
        'A last-mile operations control tower connecting delivery quality, root-cause diagnosis and capacity planning.',
      problem:
        'Regional operations teams need a consistent way to identify service deterioration, understand its drivers and evaluate capacity changes across stations and DSPs.',
      contribution:
        'Built the Last-Mile Regional Quality Intelligence System: a DuckDB KPI layer, SQL analysis, Python root-cause pipelines and a Streamlit dashboard with executive, station / DSP, root-cause, capacity and East ZIP difficulty views.',
      approach:
        'Transform reproducible package-level data into weighted KPIs, provider benchmarks, exception Pareto analysis, utilization thresholds and anomaly alerts. Compare constrained capacity transfers through before-and-after scenarios. The standalone ZIP difficulty map uses public data.',
      outcome:
        'A working analytics application with bilingual EN / 中文 navigation. The image shown here is the actual project dashboard captured in its repository. Operational metrics and capacity scenarios use synthetic project data; the ZIP map uses separate public sources.',
      url: 'https://github.com/yingchi0619/last-mile-quality-intelligence',
    },
    {
      id: 'miniweather',
      title: 'MiniWeather',
      type: 'AI Weather + OOTD Web App',
      stack: 'Next.js · TypeScript · Open-Meteo · Cloudflare Workers AI',
      intro:
        'Real weather. Personal style. An AI-generated outfit for the day ahead.',
      problem:
        'A forecast does not tell you what to wear. Temperature swings, rain and personal comfort preferences need to become practical, understandable outfit choices.',
      contribution:
        'Rebuilt MiniWeather as a responsive full-stack web app with city search, browser geolocation, current weather, hourly and seven-day forecasts, and a personalized AI styling studio. Deployed the working application on Render.',
      approach:
        'Normalize Open-Meteo weather on the server, then combine temperature, feels-like temperature, rain, wind, humidity and UV with style and comfort preferences. Qwen generates validated outfit JSON and an image prompt; FLUX uses that same prompt to visualize the recommendation. Server-side credentials, recent-result caching and retry states support the full flow.',
      outcome:
        'A live application connecting real weather to AI outfit recommendations and generated imagery. The examples below were captured from the running application with real API responses on September 16, 2026; they are saved examples, not current forecasts. AI generation depends on provider availability and usage limits.',
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
  demo: 'https://miniweather-py9p.onrender.com/',
  screenshot: '/projects/miniweather/live/dashboard.png',
  outfitScreenshot: '/projects/miniweather/live/outfit.png',
  highlights: ['Live Open-Meteo forecasts', 'Qwen outfit recommendations', 'FLUX outfit imagery', 'Responsive full-stack web app'],
};

export const groundDsp = {
  live: 'https://ground-dsp-website.onrender.com/',
  screenshot: '/projects/ground-dsp/website.png',
};

export const capacityProject = {
  screenshot: '/projects/last-mile-quality-intelligence/executive-overview.jpg',
};
