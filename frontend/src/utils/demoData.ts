/**
 * Demo Data
 * Sample reports and assessments for testing without AI
 */

export const DEMO_REPORTS = [
  {
    title: 'Border Patrol Report',
    content: 'Routine patrol along sector 7-Alpha. Observed increased vehicle movement near checkpoint Charlie. Three unidentified trucks passed through at 0300 hours. Local informant reports unusual activity in nearby village. Recommend increased surveillance.',
    expectedThreat: 'MEDIUM'
  },
  {
    title: 'Incident Report',
    content: 'Explosion reported at 1430 hours near fuel depot. Two casualties confirmed. Blast radius approximately 50 meters. Evidence suggests improvised explosive device. Area secured, investigation ongoing. Immediate medical evacuation completed.',
    expectedThreat: 'HIGH'
  },
  {
    title: 'Intelligence Report',
    content: 'Source BRAVO-3 reports suspicious communications intercepted. Possible coordination between hostile elements. Mentions of weapons cache in grid reference 42N 567890. Source reliability: moderate. Recommend verification through additional channels.',
    expectedThreat: 'HIGH'
  },
  {
    title: 'Low Threat Observation',
    content: 'Standard checkpoint operations. No unusual activity observed. Traffic flow normal. Local population cooperative. Weather conditions clear. All equipment operational. No incidents to report.',
    expectedThreat: 'LOW'
  }
];

export const DEMO_ASSESSMENT = {
  threatLevel: 'MEDIUM',
  confidence: 85,
  executiveSummary: 'Field report indicates potential security concern requiring monitoring. Increased vehicle activity and local intelligence suggest possible hostile preparation. Recommend enhanced surveillance and verification through additional sources.',
  keyFindings: [
    'Unusual vehicle movement detected at 0300 hours',
    'Three unidentified trucks passed checkpoint Charlie',
    'Local informant reports corroborate observations',
    'Pattern suggests possible coordination or supply movement'
  ],
  threats: [
    {
      type: 'ACTIVITY',
      description: 'Unusual vehicle movement during non-standard hours',
      severity: 'MEDIUM'
    },
    {
      type: 'LOCATION',
      description: 'Checkpoint Charlie identified as potential vulnerability',
      severity: 'MEDIUM'
    }
  ],
  recommendations: [
    {
      option: 'A',
      action: 'Increase surveillance at checkpoint Charlie and surrounding area',
      risk: 'LOW'
    },
    {
      option: 'B',
      action: 'Deploy additional patrol units to sector 7-Alpha',
      risk: 'MEDIUM'
    },
    {
      option: 'C',
      action: 'Conduct investigation of nearby village and verify informant intelligence',
      risk: 'MEDIUM'
    }
  ],
  intelligence: {
    entities: ['Checkpoint Charlie', 'Sector 7-Alpha', 'BRAVO-3'],
    locations: ['Checkpoint Charlie', 'Sector 7-Alpha', 'nearby village'],
    timeframe: '0300 hours',
    keywords: ['vehicle movement', 'unidentified trucks', 'surveillance', 'informant']
  },
  timestamp: new Date().toISOString()
};
