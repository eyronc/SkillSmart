function minutes(value) {
  return value * 60
}

export const INTERVIEW_TEMPLATES = {
  'Frontend Developer': {
    jobTitle: 'Frontend Developer',
    challengeMode: 'UI bug triage',
    inputMode: 'text',
    timeLimitSeconds: minutes(3),
    passingScore: 70,
    scenarioPrompt:
      'A landing page looks correct on desktop, but the mobile hero overlaps the call-to-action button and the nav menu pushes content off-screen. Explain how you would diagnose the issue and ship a safe fix.',
    instructions: [
      'Walk through how you would reproduce and isolate the bug.',
      'Explain the likely CSS or layout causes.',
      'Describe the fix and how you would validate it before release.',
    ],
    rubric: [
      {
        key: 'diagnosis',
        label: 'Diagnosis',
        description: 'Identifies the responsive layout problem clearly.',
        keywords: ['responsive', 'viewport', 'breakpoint', 'media query'],
      },
      {
        key: 'debugging',
        label: 'Debugging Process',
        description: 'Uses a structured inspection workflow.',
        keywords: ['devtools', 'inspect', 'reproduce', 'isolate'],
      },
      {
        key: 'fix-plan',
        label: 'Fix Plan',
        description: 'Proposes a concrete layout or styling fix.',
        keywords: ['css', 'flex', 'grid', 'overflow'],
      },
      {
        key: 'validation',
        label: 'Validation',
        description: 'Explains how the fix would be tested before release.',
        keywords: ['test', 'mobile', 'cross-browser', 'regression'],
      },
    ],
    followUpQuestions: [
      'How would you prevent this regression in future releases?',
      'What metrics or QA checks would you add after shipping the fix?',
    ],
  },
  'Backend Developer': {
    jobTitle: 'Backend Developer',
    challengeMode: 'API troubleshooting case',
    inputMode: 'text',
    timeLimitSeconds: minutes(3),
    passingScore: 70,
    scenarioPrompt:
      'An orders endpoint suddenly starts returning intermittent 500 errors after a new release. Explain how you would investigate, stabilize the service, and prevent the issue from recurring.',
    instructions: [
      'Start with your incident triage steps.',
      'Describe how you would inspect logs, requests, and dependencies.',
      'Close with the remediation and follow-up plan.',
    ],
    rubric: [
      {
        key: 'triage',
        label: 'Triage',
        description: 'Starts with a sensible incident-response flow.',
        keywords: ['logs', 'status code', 'request', 'response'],
      },
      {
        key: 'api-thinking',
        label: 'API Thinking',
        description: 'Reasoning includes endpoint and payload concerns.',
        keywords: ['endpoint', 'payload', 'validation', 'contract'],
      },
      {
        key: 'resilience',
        label: 'Resilience',
        description: 'Mentions safeguards that improve service stability.',
        keywords: ['retry', 'timeout', 'authentication', 'idempotent'],
      },
      {
        key: 'delivery',
        label: 'Remediation',
        description: 'Ends with testing, monitoring, or rollback thinking.',
        keywords: ['testing', 'monitoring', 'rollback', 'deploy'],
      },
    ],
    followUpQuestions: [
      'When would you roll back versus hotfix the endpoint?',
      'How would you verify that dependent services are not the root cause?',
    ],
  },
  'Fullstack Developer': {
    jobTitle: 'Fullstack Developer',
    challengeMode: 'Feature planning challenge',
    inputMode: 'text',
    timeLimitSeconds: minutes(4),
    passingScore: 72,
    scenarioPrompt:
      'Your team needs to add a saved jobs feature that works across web, API, and database layers within one sprint. Explain how you would break down the work from UI through backend and persistence.',
    instructions: [
      'Cover frontend, backend, and database work.',
      'Describe how you would phase delivery inside one sprint.',
      'Mention risks, testing, and rollout strategy.',
    ],
    rubric: [
      {
        key: 'scoping',
        label: 'Scoping',
        description: 'Breaks the feature into workable parts.',
        keywords: ['requirements', 'user flow', 'acceptance criteria', 'scope'],
      },
      {
        key: 'architecture',
        label: 'Architecture',
        description: 'Shows awareness of frontend, API, and data design.',
        keywords: ['frontend', 'api', 'database', 'state'],
      },
      {
        key: 'delivery',
        label: 'Delivery Plan',
        description: 'Builds a realistic shipping sequence.',
        keywords: ['phases', 'milestone', 'testing', 'deployment'],
      },
      {
        key: 'risk',
        label: 'Risk Awareness',
        description: 'Mentions risk controls or tradeoffs.',
        keywords: ['security', 'edge case', 'rollback', 'performance'],
      },
    ],
    followUpQuestions: [
      'What would you ship first if the sprint slipped?',
      'How would you structure ownership between frontend and backend engineers?',
    ],
  },
  'HR Specialist': {
    jobTitle: 'HR Specialist',
    challengeMode: 'People operations scenario',
    inputMode: 'text',
    timeLimitSeconds: minutes(3),
    passingScore: 70,
    scenarioPrompt:
      'Two employees report the same workplace conflict with different versions of what happened. Explain how you would handle the situation fairly and professionally.',
    instructions: [
      'Describe your first steps with both employees.',
      'Explain how policy and documentation shape your response.',
      'End with the outcome and follow-up actions.',
    ],
    rubric: [
      {
        key: 'empathy',
        label: 'Empathy',
        description: 'Shows respect and care for both employees.',
        keywords: ['listen', 'support', 'fair', 'understand'],
      },
      {
        key: 'policy',
        label: 'Policy Use',
        description: 'Anchors the response in process or compliance.',
        keywords: ['policy', 'document', 'compliance', 'process'],
      },
      {
        key: 'decision',
        label: 'Investigation',
        description: 'Explains how facts would be gathered before action.',
        keywords: ['investigate', 'facts', 'follow-up', 'action plan'],
      },
      {
        key: 'communication',
        label: 'Communication',
        description: 'Keeps the response confidential and clear.',
        keywords: ['confidential', 'clear', 'stakeholders', 'timeline'],
      },
    ],
    followUpQuestions: [
      'How would you document the incident in the HR system?',
      'When would you escalate to legal or leadership?',
    ],
  },
  'Data Analyst': {
    jobTitle: 'Data Analyst',
    challengeMode: 'Insight presentation case',
    inputMode: 'text',
    timeLimitSeconds: minutes(3),
    passingScore: 70,
    scenarioPrompt:
      'A dashboard shows weekly signups are flat, but conversions dropped sharply for one segment. Explain how you would investigate and what recommendation you would bring to the product team.',
    instructions: [
      'Frame the business question first.',
      'Explain the analysis path and what you would compare.',
      'Close with a recommendation and the next experiment.',
    ],
    rubric: [
      {
        key: 'framing',
        label: 'Problem Framing',
        description: 'Defines the question and metric clearly.',
        keywords: ['metric', 'goal', 'question', 'baseline'],
      },
      {
        key: 'analysis',
        label: 'Analysis Path',
        description: 'Breaks the data into useful checks.',
        keywords: ['trend', 'segment', 'comparison', 'outlier'],
      },
      {
        key: 'recommendation',
        label: 'Recommendation',
        description: 'Turns the findings into action.',
        keywords: ['recommend', 'next step', 'experiment', 'priority'],
      },
      {
        key: 'communication',
        label: 'Communication',
        description: 'Explains the answer in stakeholder-friendly language.',
        keywords: ['chart', 'story', 'stakeholder', 'confidence'],
      },
    ],
    followUpQuestions: [
      'What if the drop is only visible on one device type?',
      'How would you communicate uncertainty in the recommendation?',
    ],
  },
  'Customer Service Representative': {
    jobTitle: 'Customer Service Representative',
    challengeMode: 'Spoken situational challenge',
    inputMode: 'speech-preferred',
    timeLimitSeconds: 90,
    passingScore: 72,
    scenarioPrompt:
      'A customer calls because their order arrived damaged and they are angry. Respond as if this is a live call. Your goal is to calm them down, take ownership, explain the next step, and close professionally.',
    instructions: [
      'Speak as if you are already on the call with the customer.',
      'Acknowledge the frustration and show empathy early.',
      'Explain the resolution clearly and end with a professional close.',
    ],
    rubric: [
      {
        key: 'empathy',
        label: 'Empathy',
        description: 'Shows empathy and acknowledges the customer emotion.',
        keywords: ['sorry', 'understand', 'frustrating', 'help'],
      },
      {
        key: 'de-escalation',
        label: 'De-escalation',
        description: 'Uses calming language and keeps control of the call.',
        keywords: ['calm', 'resolve', 'take care', 'stay with'],
      },
      {
        key: 'ownership',
        label: 'Ownership',
        description: 'Takes responsibility for guiding the resolution.',
        keywords: ['i will', 'let me', 'take ownership', 'follow up'],
      },
      {
        key: 'resolution',
        label: 'Resolution Steps',
        description: 'Explains the next concrete action for the customer.',
        keywords: ['replacement', 'refund', 'return', 'next step'],
      },
      {
        key: 'closing',
        label: 'Professional Closing',
        description: 'Closes the conversation politely and clearly.',
        keywords: ['anything else', 'thank you', 'appreciate', 'confirm'],
      },
    ],
    followUpQuestions: [
      'What would you do if the customer refused the offered solution?',
      'How would you document the call in the CRM afterward?',
    ],
    practicePack: {
      title: 'Customer Service Call Playbook',
      overview:
        'Use a five-step structure: acknowledge the problem, apologize, take ownership, explain the next action, and close with a clear confirmation.',
      sampleAnswer:
        'Thank you for calling, and I am really sorry your order arrived damaged. I understand how frustrating that is, especially when you were expecting it in good condition. Let me take care of this for you right now. I am going to review the order details, confirm whether you prefer a replacement or refund, and make sure the next step is processed today. Once I submit that request, I will confirm the timeline and the exact follow-up you can expect from us. Before we end the call, I will also check if there is anything else I can help you with so you do not have to call back again.',
      commonMistakes: [
        'Skipping empathy and jumping straight into policy.',
        'Sounding defensive or implying the customer caused the problem.',
        'Giving a vague promise instead of a concrete next step.',
        'Ending the call without confirming the resolution and timeline.',
      ],
      questionBank: [
        {
          question: 'What would you say in the first 15 seconds of the call?',
          strongPoints: [
            'Acknowledge the issue immediately.',
            'Use an apology without blaming anyone.',
            'Signal that you are going to help solve it.',
          ],
        },
        {
          question: 'How would you calm down an angry customer who keeps interrupting?',
          strongPoints: [
            'Stay calm and avoid matching their tone.',
            'Use short validation phrases like “I understand” or “I can help with that.”',
            'Redirect the call toward a clear resolution path.',
          ],
        },
        {
          question: 'How would you explain the next step if the item must be replaced?',
          strongPoints: [
            'State the action clearly: replacement, refund, or return workflow.',
            'Give a realistic timeline.',
            'Confirm what the customer should expect next.',
          ],
        },
        {
          question: 'How would you close the conversation professionally?',
          strongPoints: [
            'Summarize what was done.',
            'Confirm the follow-up or tracking expectation.',
            'Offer one final chance for additional help before ending politely.',
          ],
        },
      ],
    },
  },
  'SEO Manager': {
    jobTitle: 'SEO Manager',
    challengeMode: 'Mini SEO audit',
    inputMode: 'text',
    timeLimitSeconds: minutes(3),
    passingScore: 70,
    scenarioPrompt:
      'Traffic is flat on a key landing page even though content volume increased. Walk through a quick SEO audit and describe the actions you would prioritize this week.',
    instructions: [
      'Cover both technical and content checks.',
      'Explain how keyword intent influences your next step.',
      'Close with how you would measure improvement.',
    ],
    rubric: [
      {
        key: 'audit',
        label: 'Audit Coverage',
        description: 'Includes technical SEO review points.',
        keywords: ['crawl', 'index', 'meta', 'internal linking'],
      },
      {
        key: 'keyword-strategy',
        label: 'Keyword Strategy',
        description: 'Connects the page to search intent and keywords.',
        keywords: ['keywords', 'intent', 'cluster', 'serp'],
      },
      {
        key: 'content-plan',
        label: 'Content Plan',
        description: 'Suggests a concrete content optimization move.',
        keywords: ['content', 'landing page', 'brief', 'optimize'],
      },
      {
        key: 'measurement',
        label: 'Measurement',
        description: 'Defines what success would be measured with.',
        keywords: ['ctr', 'traffic', 'conversion', 'analytics'],
      },
    ],
    followUpQuestions: [
      'How would you prioritize fixes if engineering time is limited?',
      'What would you do if rankings improved but conversions did not?',
    ],
  },
  'DevOps Engineer': {
    jobTitle: 'DevOps Engineer',
    challengeMode: 'Incident response challenge',
    inputMode: 'text',
    timeLimitSeconds: minutes(3),
    passingScore: 72,
    scenarioPrompt:
      'A deployment completed successfully, but the production app started timing out within minutes. Explain how you would respond, stabilize the system, and prevent this from repeating.',
    instructions: [
      'Start with your incident triage and containment steps.',
      'Explain the signals or tooling you would check.',
      'Close with the post-incident improvements.',
    ],
    rubric: [
      {
        key: 'triage',
        label: 'Triage',
        description: 'Begins with incident containment and signal review.',
        keywords: ['logs', 'alert', 'rollback', 'blast radius'],
      },
      {
        key: 'infra',
        label: 'Infrastructure Reasoning',
        description: 'Explains where to inspect the delivery stack.',
        keywords: ['pipeline', 'container', 'deployment', 'kubernetes'],
      },
      {
        key: 'reliability',
        label: 'Reliability',
        description: 'Uses monitoring and incident learning well.',
        keywords: ['monitor', 'health check', 'incident', 'postmortem'],
      },
      {
        key: 'security',
        label: 'Security',
        description: 'Keeps secrets or access controls in view.',
        keywords: ['secrets', 'access', 'least privilege', 'audit'],
      },
    ],
    followUpQuestions: [
      'When would you prefer rollback over a forward fix?',
      'How would you tighten observability after this incident?',
    ],
  },
  'Cloud Engineer': {
    jobTitle: 'Cloud Engineer',
    challengeMode: 'Architecture trade-off review',
    inputMode: 'text',
    timeLimitSeconds: minutes(3),
    passingScore: 72,
    scenarioPrompt:
      'A startup wants a secure cloud architecture for a customer portal that must handle traffic spikes without overspending. Explain the architecture you would propose and the tradeoffs you would make.',
    instructions: [
      'Describe the main infrastructure components.',
      'Explain the security and disaster recovery choices.',
      'Address cost controls alongside scalability.',
    ],
    rubric: [
      {
        key: 'architecture',
        label: 'Architecture',
        description: 'Design includes core cloud building blocks.',
        keywords: ['vpc', 'subnet', 'load balancer', 'storage'],
      },
      {
        key: 'security',
        label: 'Security',
        description: 'Mentions practical cloud security controls.',
        keywords: ['iam', 'encryption', 'security group', 'least privilege'],
      },
      {
        key: 'resilience',
        label: 'Resilience',
        description: 'Shows redundancy and recovery thinking.',
        keywords: ['backup', 'failover', 'multi-az', 'recovery'],
      },
      {
        key: 'cost',
        label: 'Cost Optimization',
        description: 'Balances scale with cost discipline.',
        keywords: ['autoscaling', 'reserved', 'cost', 'optimize'],
      },
    ],
    followUpQuestions: [
      'How would you pitch this design to a non-technical stakeholder?',
      'What would you change if compliance requirements increased?',
    ],
  },
  'IT Project Manager': {
    jobTitle: 'IT Project Manager',
    challengeMode: 'Prioritization workshop',
    inputMode: 'text',
    timeLimitSeconds: minutes(3),
    passingScore: 70,
    scenarioPrompt:
      'Mid-sprint, leadership requests a new high-visibility feature while the team is already handling two blockers. Explain how you would prioritize work, align stakeholders, and keep delivery realistic.',
    instructions: [
      'Describe how you would assess urgency and impact.',
      'Explain how you would communicate the tradeoffs.',
      'Close with the plan for the sprint and risk management.',
    ],
    rubric: [
      {
        key: 'prioritization',
        label: 'Prioritization',
        description: 'Evaluates impact, scope, and dependencies clearly.',
        keywords: ['impact', 'dependency', 'priority', 'scope'],
      },
      {
        key: 'planning',
        label: 'Planning',
        description: 'Turns priorities into an actionable sprint plan.',
        keywords: ['sprint', 'timeline', 'owner', 'milestone'],
      },
      {
        key: 'stakeholders',
        label: 'Stakeholder Alignment',
        description: 'Keeps communication and expectations aligned.',
        keywords: ['stakeholder', 'alignment', 'update', 'expectation'],
      },
      {
        key: 'risk',
        label: 'Risk Management',
        description: 'Surfaces blockers and mitigation paths.',
        keywords: ['risk', 'mitigation', 'blocker', 'contingency'],
      },
    ],
    followUpQuestions: [
      'How would you document the decision trail inside Jira?',
      'What would you do if leadership rejected the recommended tradeoff?',
    ],
  },
}

export function getInterviewTemplate(jobTitle) {
  return INTERVIEW_TEMPLATES[jobTitle] || null
}