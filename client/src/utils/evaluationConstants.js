export const EVALUATION_WEIGHTS = {
  team: 0.15,
  market: 0.15,
  product: 0.15,
  traction: 0.15,
  businessModel: 0.10,
  competitiveAdvantage: 0.10,
  financials: 0.10,
  fundraising: 0.10,
};

export const CATEGORIES = [
  { id: 'team', name: 'Founding Team & Execution', weight: 0.15, description: 'Domain expertise, technical capability, track record, and team completeness.' },
  { id: 'market', name: 'Market Opportunity & TAM', weight: 0.15, description: 'Target market size, growth velocity, macro trends, and timing.' },
  { id: 'product', name: 'Product Quality & Innovation', weight: 0.15, description: 'User experience, technical differentiation, product-market fit, and defensibility.' },
  { id: 'traction', name: 'Traction & Growth Velocity', weight: 0.15, description: 'Revenue metrics, user retention, customer acquisition rate, and milestones.' },
  { id: 'businessModel', name: 'Business Model & Unit Economics', weight: 0.10, description: 'Monetization strategy, gross margins, LTV/CAC ratio, and scalability.' },
  { id: 'competitiveAdvantage', name: 'Competitive Moat & Advantage', weight: 0.10, description: 'IP, network effects, switching costs, barriers to entry, and positioning.' },
  { id: 'financials', name: 'Financial Discipline & Projections', weight: 0.10, description: 'Burn rate, runway, revenue predictability, and capital efficiency.' },
  { id: 'fundraising', name: 'Fundraising Terms & Valuation', weight: 0.10, description: 'Valuation alignment, round terms, capital requirement appropriateness, and exit potential.' },
];

export const INVESTMENT_DECISIONS = [
  'Undecided',
  'Interested',
  'Need More Information',
  'High Potential',
  'Pass',
];

export const EVALUATION_STATUSES = ['Draft', 'Completed'];

export const SCORE_LABELS = {
  1: 'Very Weak',
  2: 'Weak',
  3: 'Below Average',
  4: 'Fair',
  5: 'Average',
  6: 'Good',
  7: 'Strong',
  8: 'Very Strong',
  9: 'Excellent',
  10: 'Exceptional',
};

export const calculateOverallScore = (scores = {}) => {
  let totalScore = 0;
  let totalWeightEvaluated = 0;

  Object.keys(EVALUATION_WEIGHTS).forEach((cat) => {
    const scoreVal = Number(scores[cat]);
    if (!isNaN(scoreVal) && scoreVal >= 1 && scoreVal <= 10) {
      const weight = EVALUATION_WEIGHTS[cat];
      totalScore += scoreVal * weight;
      totalWeightEvaluated += weight;
    }
  });

  if (totalWeightEvaluated === 0) return 0;
  const normalized = totalScore / totalWeightEvaluated;
  return Math.round(normalized * 10) / 10;
};

export const getScoreInterpretation = (score) => {
  if (score >= 9.0) return { label: 'Exceptional Opportunity', color: 'emerald' };
  if (score >= 7.5) return { label: 'Strong Opportunity', color: 'brand' };
  if (score >= 6.0) return { label: 'Promising Venture', color: 'indigo' };
  if (score >= 4.5) return { label: 'Moderate / Undecided', color: 'amber' };
  if (score >= 3.0) return { label: 'Needs Improvement', color: 'orange' };
  return { label: 'High Risk / Weak', color: 'rose' };
};
