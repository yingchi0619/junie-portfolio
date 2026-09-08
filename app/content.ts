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
      type: 'Frontend prototype',
      stack: 'JavaScript · HTML / CSS · Tailwind CSS',
      intro:
        'A weather-and-outfit interface prototype connecting daily conditions with everyday decisions.',
      problem:
        'Weather details and outfit choices often live in separate experiences. This prototype brings them into one mobile-oriented interface.',
      contribution:
        'Frontend prototype work across onboarding, weather, outfit and profile screens. The repository includes browser prototypes alongside a WeChat mini program starter.',
      approach:
        'Use HTML, Tailwind CSS and JavaScript for tab navigation, weather layouts, outfit-popup interactions and profile editing. Store city and preferences locally with localStorage. Weather views include current conditions, hourly and seven-day layouts, using static sample values.',
      outcome:
        'A browsable interface prototype with local preferences and linked screens. The reviewed code does not implement live weather retrieval or a production recommendation engine; the WeChat directory remains starter code.',
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
      id: 'ootd',
      title: 'OOTD',
      type: 'Mini program project',
      stack: 'WeChat mini program',
      intro: 'A project within the WeChat mini program ecosystem.',
      problem: 'The WeChat mini program environment is the context for OOTD.',
      contribution: 'Project work on the OOTD WeChat mini program.',
      approach:
        'A mini program implementation. Detailed functionality and individual implementation scope will be added with supporting project materials.',
      outcome:
        'Included as mini program project experience; no user growth or launch results are claimed.',
      url: '',
    },
  ],
};
