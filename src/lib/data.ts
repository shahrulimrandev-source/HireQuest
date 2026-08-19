export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  description: string;
  requirements: string[];
  benefits: string[];
  type: 'full-time' | 'part-time' | 'contract';
  remoteStatus: 'remote' | 'hybrid' | 'on-site';
  postedDate: string;
  logoUrl?: string;
}

export interface Applicant {
  id: string;
  name: string;
  position: string;
  experience: number;
  skills: string[];
  education: string;
  location: string;
  resumeLink: string;
  applicationStatus: 'pending' | 'shortlisted' | 'rejected';
  avatarUrl?: string;
  summary: string;
}

export const MOCK_JOBS: Job[] = [
  {
    id: '1',
    title: 'Senior Frontend Engineer',
    company: 'TechNova',
    location: 'San Francisco, CA',
    salary: '$140k - $180k',
    description: 'We are looking for an experienced Frontend Engineer to lead our core product team. You will be responsible for architecture, performance optimizations, and mentoring junior engineers.',
    requirements: ['React', 'TypeScript', '5+ years experience', 'GraphQL'],
    benefits: ['Health insurance', '401k match', 'Unlimited PTO', 'Home office stipend'],
    type: 'full-time',
    remoteStatus: 'remote',
    postedDate: '2d ago',
    logoUrl: 'T'
  },
  {
    id: '2',
    title: 'Product Designer',
    company: 'CreativeSpace',
    location: 'New York, NY',
    salary: '$120k - $150k',
    description: 'Join our design system team to build beautiful, accessible components for our next-generation creative suite.',
    requirements: ['Figma', 'UI/UX', 'Design Systems', 'Prototyping'],
    benefits: ['Comprehensive health', 'Gym membership', 'Learning budget'],
    type: 'full-time',
    remoteStatus: 'hybrid',
    postedDate: '1w ago',
    logoUrl: 'C'
  },
  {
    id: '3',
    title: 'Backend Developer',
    company: 'DataStream',
    location: 'Austin, TX',
    salary: '$130k - $170k',
    description: 'Scale our high-throughput streaming pipelines and microservices. You will work on solving complex distributed systems problems.',
    requirements: ['Go', 'PostgreSQL', 'Kafka', 'Kubernetes'],
    benefits: ['Competitive equity', 'Relocation package', 'Health coverage'],
    type: 'full-time',
    remoteStatus: 'on-site',
    postedDate: '3d ago',
    logoUrl: 'D'
  },
  {
    id: '4',
    title: 'React Native Engineer',
    company: 'MobileFirst',
    location: 'London, UK',
    salary: '£80k - £110k',
    description: 'Help us bring our award-winning web experience to iOS and Android using React Native.',
    requirements: ['React Native', 'iOS/Android', 'Animations', 'State Management'],
    benefits: ['Pension scheme', 'Flexible hours', 'Device of choice'],
    type: 'contract',
    remoteStatus: 'remote',
    postedDate: '5h ago',
    logoUrl: 'M'
  }
];

export const MOCK_APPLICANTS: Applicant[] = [
  {
    id: 'a1',
    name: 'Sarah Jenkins',
    position: 'Frontend Developer',
    experience: 4,
    skills: ['React', 'TypeScript', 'Tailwind', 'Next.js'],
    education: 'B.S. Computer Science, UC Berkeley',
    location: 'Remote',
    resumeLink: '#',
    applicationStatus: 'pending',
    avatarUrl: 'SJ',
    summary: 'Passionate frontend developer with a keen eye for design and 4 years of experience building scalable web applications.'
  },
  {
    id: 'a2',
    name: 'Michael Chen',
    position: 'UI/UX Designer',
    experience: 6,
    skills: ['Figma', 'User Research', 'Prototyping', 'CSS'],
    education: 'B.A. Design, RISD',
    location: 'New York, NY',
    resumeLink: '#',
    applicationStatus: 'pending',
    avatarUrl: 'MC',
    summary: 'Design systems advocate and accessibility champion. I love bridging the gap between design and engineering.'
  },
  {
    id: 'a3',
    name: 'Emily Rodriguez',
    position: 'Full Stack Engineer',
    experience: 3,
    skills: ['Node.js', 'React', 'PostgreSQL', 'AWS'],
    education: 'M.S. Software Engineering, MIT',
    location: 'San Francisco, CA',
    resumeLink: '#',
    applicationStatus: 'pending',
    avatarUrl: 'ER',
    summary: 'Product-minded engineer who enjoys working across the entire stack to deliver value to end-users quickly.'
  },
  {
    id: 'a4',
    name: 'David Kim',
    position: 'Data Engineer',
    experience: 5,
    skills: ['Python', 'Spark', 'Airflow', 'Snowflake'],
    education: 'B.S. Mathematics, UCLA',
    location: 'Austin, TX',
    resumeLink: '#',
    applicationStatus: 'pending',
    avatarUrl: 'DK',
    summary: 'Data enthusiast specializing in building robust ETL pipelines and analytical dashboards.'
  }
];
