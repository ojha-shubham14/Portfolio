/**
 * Solar System Developer Portfolio - Project Data Configuration
 * Data-driven mapping between celestial bodies and real developer projects.
 */

export const PLANETS_CONFIG = [
  {
    id: 'mercury',
    name: 'Mercury',
    radius: 0.9,
    orbitRadius: 16,
    orbitSpeed: 0.038,
    rotationSpeed: 0.008,
    color: '#9e968f',
    hasAtmosphere: false,
    project: {
      slot: '02',
      title: 'Orbital Slot // Mercury',
      subtitle: 'Upcoming High-Throughput Service',
      status: 'COMING SOON',
      type: 'slot',
      tagline: 'Reserved for an upcoming low-latency systems engineering project.',
      description: 'This orbital slot is reserved for high-performance backend pipelines and algorithmic services currently undergoing architecture design and benchmarking.',
      technologies: ['C++', 'Python', 'AsyncIO', 'Redis'],
      features: [
        'Architecture blueprinting in progress',
        'Low-latency event loops & throughput benchmarks',
        'Direct memory and asynchronous resource optimization'
      ],
      github: null,
      demo: null
    }
  },
  {
    id: 'venus',
    name: 'Venus',
    radius: 1.5,
    orbitRadius: 23,
    orbitSpeed: 0.026,
    rotationSpeed: -0.004,
    color: '#e3bb76',
    hasAtmosphere: true,
    atmosphereColor: '#e0c080',
    project: {
      slot: '03',
      title: 'Orbital Slot // Venus',
      subtitle: 'Upcoming Distributed Systems Project',
      status: 'COMING SOON',
      type: 'slot',
      tagline: 'Reserved for upcoming distributed workflow and queue architecture.',
      description: 'This orbital slot is reserved for a distributed worker architecture designed to orchestrate asynchronous batch workloads and fault-tolerant message buses.',
      technologies: ['FastAPI', 'Python', 'Redis Queues', 'Docker'],
      features: [
        'Resilient worker architecture specifications',
        'Dead-letter isolation and backoff retry logic',
        'Telemetry stream design'
      ],
      github: null,
      demo: null
    }
  },
  {
    id: 'earth',
    name: 'Earth',
    radius: 1.6,
    orbitRadius: 31,
    orbitSpeed: 0.019,
    rotationSpeed: 0.015,
    color: '#2b82c9',
    hasAtmosphere: true,
    atmosphereColor: '#4ca3ff',
    hasClouds: true,
    hasMoon: true,
    moon: {
      radius: 0.42,
      orbitRadius: 3.2,
      orbitSpeed: 0.065,
      color: '#c5c5c5'
    },
    project: {
      slot: '01',
      title: 'JANSAHAY',
      subtitle: 'AI-Driven Scheme Matching Platform',
      status: 'FLAGSHIP PROJECT',
      type: 'active',
      tagline: 'Empowering citizens by automatically matching public welfare schemes through intelligent RAG pipelines and multi-criteria eligibility filtering.',
      description: 'Citizens frequently miss out on critical government benefits due to fragmented portals, bureaucratic eligibility rules, and language barriers. JanSahay bridges this gap with an intuitive natural-language conversational engine backed by a resilient FastAPI service, vector retrieval, and normalized relational modeling.',
      technologies: ['React', 'FastAPI', 'Python', 'LangChain', 'RAG / Vector Search', 'MySQL', 'Docker'],
      features: [
        'Semantic Profile & Scheme Matching using dense vector embeddings',
        'Multi-attribute Eligibility Reasoning (Age, Income, Occupation, Region)',
        'Conversational Q&A with strict citation grounding to prevent hallucination',
        'High-performance FastAPI REST API layer with optimized MySQL relational mapping',
        'Responsive, accessible user interface built in React'
      ],
      github: 'https://github.com/ojha-shubham14/JanSahay',
      demo: 'https://ojha-shubham14.github.io/JanSahay/'
    }
  },
  {
    id: 'mars',
    name: 'Mars',
    radius: 1.2,
    orbitRadius: 40,
    orbitSpeed: 0.014,
    rotationSpeed: 0.013,
    color: '#c1440e',
    hasAtmosphere: true,
    atmosphereColor: '#c1440e',
    project: {
      slot: '04',
      title: 'Orbital Slot // Mars',
      subtitle: 'Upcoming AI Reasoning Pipeline',
      status: 'COMING SOON',
      type: 'slot',
      tagline: 'Reserved for an advanced retrieval & agentic orchestration engine.',
      description: 'Currently prototyping multi-step agentic workflows and tool-calling integrations using open-weights LLMs and customized vector stores.',
      technologies: ['Python', 'FastAPI', 'LangChain', 'ChromaDB'],
      features: [
        'Agentic tool-use orchestration',
        'Context-aware reranking algorithms',
        'Evaluation benchmarks for groundedness'
      ],
      github: null,
      demo: null
    }
  },
  {
    id: 'jupiter',
    name: 'Jupiter',
    radius: 3.6,
    orbitRadius: 52,
    orbitSpeed: 0.009,
    rotationSpeed: 0.024,
    color: '#c88b3a',
    hasAtmosphere: false,
    project: {
      slot: '05',
      title: 'Orbital Slot // Jupiter',
      subtitle: 'Upcoming Data Scale Platform',
      status: 'COMING SOON',
      type: 'slot',
      tagline: 'Reserved for large-scale data ingestion and analytics pipeline.',
      description: 'Design phase for a high-concurrency ingestion pipeline capable of parsing, validating, and indexing high-volume transactional streams into analytical stores.',
      technologies: ['Python', 'PostgreSQL', 'Redis', 'Docker'],
      features: [
        'Stream ingestion and batching mechanisms',
        'Schema migration and partition strategies',
        'Automated health checks and observability'
      ],
      github: null,
      demo: null
    }
  },
  {
    id: 'saturn',
    name: 'Saturn',
    radius: 3.0,
    orbitRadius: 65,
    orbitSpeed: 0.0068,
    rotationSpeed: 0.021,
    color: '#e2bf7d',
    hasRings: true,
    rings: {
      innerRadius: 3.8,
      outerRadius: 6.8
    },
    project: {
      slot: '06',
      title: 'Orbital Slot // Saturn',
      subtitle: 'Upcoming Full-Stack Ecosystem',
      status: 'COMING SOON',
      type: 'slot',
      tagline: 'Reserved for an end-to-end full-stack platform with real-time telemetry.',
      description: 'Architecting an end-to-end web system integrating reactive frontend component trees with strict typed backend API contracts.',
      technologies: ['React', 'TypeScript', 'FastAPI', 'SQL'],
      features: [
        'Strict end-to-end contract typing',
        'Real-time WebSocket / SSE telemetry',
        'State reconciliation & optimistic UI updates'
      ],
      github: null,
      demo: null
    }
  },
  {
    id: 'uranus',
    name: 'Uranus',
    radius: 2.1,
    orbitRadius: 76,
    orbitSpeed: 0.0048,
    rotationSpeed: -0.014,
    color: '#65c6c4',
    hasAtmosphere: true,
    atmosphereColor: '#7be3e1',
    project: {
      slot: '07',
      title: 'Orbital Slot // Uranus',
      subtitle: 'Upcoming Systems Utility',
      status: 'COMING SOON',
      type: 'slot',
      tagline: 'Reserved for an open-source developer tooling utility.',
      description: 'Conceptualizing developer tooling for API contract testing, schema mock generation, and benchmark profiling.',
      technologies: ['Python', 'C++', 'CLI', 'Git'],
      features: [
        'Command-line developer utility',
        'Rapid specification linting and validation',
        'Automated regression assertions'
      ],
      github: null,
      demo: null
    }
  },
  {
    id: 'neptune',
    name: 'Neptune',
    radius: 2.0,
    orbitRadius: 87,
    orbitSpeed: 0.0035,
    rotationSpeed: 0.016,
    color: '#274687',
    hasAtmosphere: true,
    atmosphereColor: '#3d6cdb',
    project: {
      slot: '08',
      title: 'Orbital Slot // Neptune',
      subtitle: 'Upcoming Deep Research Project',
      status: 'COMING SOON',
      type: 'slot',
      tagline: 'Reserved for algorithmic research and system performance benchmarking.',
      description: 'A focused investigation into data structures, memory-efficient graphs, and advanced algorithmic paradigms.',
      technologies: ['C++', 'Algorithms', 'DSA'],
      features: [
        'Algorithmic complexity benchmarks',
        'Memory optimization studies',
        'Rigorous unit and stress tests'
      ],
      github: null,
      demo: null
    }
  }
];
