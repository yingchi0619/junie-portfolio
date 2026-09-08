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
      type: 'AI-assisted product prototype',
      stack: 'JavaScript · Weather API · DeepSeek API · Image generation',
      intro:
        'A weather-and-outfit experience that turns local conditions and personal preferences into a visual daily recommendation.',
      problem:
        'Weather data alone does not answer the practical question: what should I wear today? MiniWeather combines local conditions with the user’s style and comfort preferences.',
      contribution:
        'Designed the end-to-end interaction across onboarding, weather, outfit and profile screens, including the inputs and response states for an AI-generated outfit recommendation.',
      approach:
        'Call a weather API with the user’s city, then combine the returned daily temperature with the saved outfit-preference description and the style selected on the OOTD page. Send that context to APIs powered by the open-source DeepSeek model to generate recommendation copy and an outfit preview image.',
      outcome:
        'A browsable mobile-oriented prototype that demonstrates the complete product flow. The local version currently shows sample weather and UI states because its backend APIs are not connected; it should not be read as a live weather service or deployed recommendation engine.',
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
