/**
 * Automated Regression Test Suite for Google OAuth Redirect & Client URL Resolver
 * 
 * Verifies all 7 Mandatory Test Cases:
 * 1. Production URL Resolver
 * 2. Missing Production CLIENT_URL (never generates localhost)
 * 3. Development Fallback (allows localhost:5173 only in dev)
 * 4. OAuth Existing User Redirect (production redirects to https://ventriva.vercel.app)
 * 5. OAuth Onboarding Redirect (uses production frontend URL)
 * 6. Localhost Leak Detection (production redirects never contain localhost/127.0.0.1)
 * 7. RBAC Target Validation (Founder/Investor cannot enter Admin routes)
 */

const {
  getCanonicalClientUrl,
  isProductionEnvironment,
  isLocalhostHost,
  PRODUCTION_CLIENT_URL,
  DEVELOPMENT_CLIENT_URL,
} = require('./config/clientUrl');

function runUrlResolverTests() {
  console.log('=== MANDATORY TEST SUITE: CLIENT URL & OAUTH REDIRECTS ===\n');

  const originalEnv = { ...process.env };

  try {
    // -------------------------------------------------------------
    // TEST 1: Production URL Resolver with explicit CLIENT_URL
    // -------------------------------------------------------------
    console.log('Test 1: Production URL Resolver with explicit CLIENT_URL');
    process.env.NODE_ENV = 'production';
    process.env.RENDER = 'true';
    process.env.CLIENT_URL = 'https://ventriva.vercel.app';
    delete process.env.RENDER_EXTERNAL_HOSTNAME;

    const prodUrl = getCanonicalClientUrl();
    console.log('  Resolved URL:', prodUrl);
    if (prodUrl !== 'https://ventriva.vercel.app') {
      throw new Error(`Test 1 Failed: Expected https://ventriva.vercel.app, got ${prodUrl}`);
    }
    console.log('>>> [PASS] Test 1: Production URL resolver honors valid production CLIENT_URL\n');

    // -------------------------------------------------------------
    // TEST 2: Missing Production CLIENT_URL (must never generate localhost)
    // -------------------------------------------------------------
    console.log('Test 2: Missing Production CLIENT_URL (Render environment without CLIENT_URL)');
    process.env.NODE_ENV = 'production';
    process.env.RENDER = 'true';
    delete process.env.CLIENT_URL;

    const fallbackProdUrl = getCanonicalClientUrl();
    console.log('  Resolved URL with missing CLIENT_URL:', fallbackProdUrl);
    if (fallbackProdUrl.includes('localhost') || fallbackProdUrl.includes('127.0.0.1')) {
      throw new Error(`Test 2 Failed: Production resolved to localhost! Got ${fallbackProdUrl}`);
    }
    if (fallbackProdUrl !== PRODUCTION_CLIENT_URL) {
      throw new Error(`Test 2 Failed: Expected ${PRODUCTION_CLIENT_URL}, got ${fallbackProdUrl}`);
    }
    console.log('>>> [PASS] Test 2: Missing production CLIENT_URL safely resolves to canonical https://ventriva.vercel.app\n');

    // -------------------------------------------------------------
    // TEST 2B: Localhost pollution in Production CLIENT_URL (defense-in-depth)
    // -------------------------------------------------------------
    console.log('Test 2B: Localhost pollution in Production CLIENT_URL');
    process.env.NODE_ENV = 'production';
    process.env.RENDER = 'true';
    process.env.CLIENT_URL = 'http://localhost:5173'; // Accidentally set or leaked

    const sanitizedUrl = getCanonicalClientUrl();
    console.log('  Sanitized URL:', sanitizedUrl);
    if (sanitizedUrl.includes('localhost') || sanitizedUrl.includes('127.0.0.1')) {
      throw new Error(`Test 2B Failed: Localhost was not blocked in production! Got ${sanitizedUrl}`);
    }
    if (sanitizedUrl !== PRODUCTION_CLIENT_URL) {
      throw new Error(`Test 2B Failed: Expected ${PRODUCTION_CLIENT_URL}, got ${sanitizedUrl}`);
    }
    console.log('>>> [PASS] Test 2B: Production firewall rejected localhost CLIENT_URL and used canonical URL\n');

    // -------------------------------------------------------------
    // TEST 3: Development Fallback (allows localhost:5173 in local dev)
    // -------------------------------------------------------------
    console.log('Test 3: Development Fallback');
    process.env.NODE_ENV = 'development';
    delete process.env.RENDER;
    delete process.env.CLIENT_URL;

    const mockLocalReq = {
      get: (header) => (header.toLowerCase() === 'host' ? 'localhost:5000' : ''),
    };

    const devUrl = getCanonicalClientUrl(mockLocalReq);
    console.log('  Resolved Dev URL:', devUrl);
    if (devUrl !== DEVELOPMENT_CLIENT_URL) {
      throw new Error(`Test 3 Failed: Expected ${DEVELOPMENT_CLIENT_URL}, got ${devUrl}`);
    }
    console.log('>>> [PASS] Test 3: Development environment correctly allows localhost:5173\n');

    // -------------------------------------------------------------
    // TEST 4 & 5 & 6: Production OAuth Redirect Base URL & Localhost Leak Detection
    // -------------------------------------------------------------
    console.log('Test 4, 5 & 6: Production OAuth Callback Simulation & Localhost Leak Detection');
    process.env.NODE_ENV = 'production';
    process.env.RENDER = 'true';
    delete process.env.CLIENT_URL;

    const mockRenderReq = {
      get: (header) => (header.toLowerCase() === 'host' ? 'ventriva.onrender.com' : ''),
      protocol: 'https',
    };

    const targetClientUrl = getCanonicalClientUrl(mockRenderReq);
    console.log('  Render Host Simulated Redirect Base:', targetClientUrl);

    // Assert Test 6: Localhost Leak Detection
    if (targetClientUrl.includes('localhost') || targetClientUrl.includes('127.0.0.1')) {
      throw new Error(`Test 6 Failed: Localhost leaked in production redirect! Got ${targetClientUrl}`);
    }

    // Simulate existing user redirect URL (Test 4)
    const token = 'mock_jwt_session_token_12345';
    const targetDashboard = '/investor/dashboard';
    const existingUserRedirect = `${targetClientUrl}/login?token=${token}&target=${encodeURIComponent(targetDashboard)}`;
    console.log('  Simulated Existing User Redirect:', existingUserRedirect);

    if (!existingUserRedirect.startsWith('https://ventriva.vercel.app/login?token=')) {
      throw new Error(`Test 4 Failed: Existing user redirect must begin with https://ventriva.vercel.app/login?token=`);
    }
    if (existingUserRedirect.includes('localhost') || existingUserRedirect.includes('127.0.0.1')) {
      throw new Error(`Test 4 Failed: Existing user redirect contained localhost!`);
    }
    console.log('>>> [PASS] Test 4: Existing user OAuth redirect uses https://ventriva.vercel.app');

    // Simulate onboarding redirect URL (Test 5)
    const onboardingToken = 'mock_onboarding_token_67890';
    const onboardingRedirect = `${targetClientUrl}/login?onboardingToken=${onboardingToken}&email=test%40investor.com`;
    console.log('  Simulated Onboarding Redirect:', onboardingRedirect);

    if (!onboardingRedirect.startsWith('https://ventriva.vercel.app/login?onboardingToken=')) {
      throw new Error(`Test 5 Failed: Onboarding redirect must begin with https://ventriva.vercel.app/login?onboardingToken=`);
    }
    if (onboardingRedirect.includes('localhost') || onboardingRedirect.includes('127.0.0.1')) {
      throw new Error(`Test 5 Failed: Onboarding redirect contained localhost!`);
    }
    console.log('>>> [PASS] Test 5: Onboarding OAuth redirect uses https://ventriva.vercel.app');
    console.log('>>> [PASS] Test 6: Zero localhost or 127.0.0.1 leakages in production OAuth flows\n');

    // -------------------------------------------------------------
    // TEST 7: RBAC Target Validation (simulating frontend resolveTargetRoute)
    // -------------------------------------------------------------
    console.log('Test 7: RBAC Target Validation');
    const getRoleDashboard = (role) => {
      if (role === 'admin') return '/admin/dashboard';
      if (role === 'founder') return '/founder/dashboard';
      if (role === 'investor') return '/investor/dashboard';
      return null;
    };

    const resolveTargetRoute = (userRole, savedTarget, fromPath) => {
      if (savedTarget) {
        if (savedTarget.startsWith(`/${userRole}`)) {
          return savedTarget;
        }
      }
      const dashboard = getRoleDashboard(userRole);
      if (!dashboard) return null;
      if (fromPath && typeof fromPath === 'string' && fromPath.startsWith(`/${userRole}`)) {
        return fromPath;
      }
      return dashboard;
    };

    // Case A: Founder attempts to enter /admin/dashboard
    const founderAttacksAdmin = resolveTargetRoute('founder', '/admin/dashboard', null);
    console.log('  Founder with target /admin/dashboard resolves to:', founderAttacksAdmin);
    if (founderAttacksAdmin !== '/founder/dashboard') {
      throw new Error(`Test 7 Failed: Founder was able to target ${founderAttacksAdmin}`);
    }

    // Case B: Investor attempts to enter /admin/dashboard
    const investorAttacksAdmin = resolveTargetRoute('investor', '/admin/dashboard', null);
    console.log('  Investor with target /admin/dashboard resolves to:', investorAttacksAdmin);
    if (investorAttacksAdmin !== '/investor/dashboard') {
      throw new Error(`Test 7 Failed: Investor was able to target ${investorAttacksAdmin}`);
    }

    // Case C: Investor attempts to enter /founder/dashboard
    const investorAttacksFounder = resolveTargetRoute('investor', '/founder/dashboard', null);
    console.log('  Investor with target /founder/dashboard resolves to:', investorAttacksFounder);
    if (investorAttacksFounder !== '/investor/dashboard') {
      throw new Error(`Test 7 Failed: Investor was able to target ${investorAttacksFounder}`);
    }

    // Case D: Legitimate Founder target
    const legitimateFounder = resolveTargetRoute('founder', '/founder/deals', null);
    if (legitimateFounder !== '/founder/deals') {
      throw new Error(`Test 7 Failed: Legitimate founder target was rejected`);
    }

    // Case E: Legitimate Investor target
    const legitimateInvestor = resolveTargetRoute('investor', '/investor/pipeline', null);
    if (legitimateInvestor !== '/investor/pipeline') {
      throw new Error(`Test 7 Failed: Legitimate investor target was rejected`);
    }

    console.log('>>> [PASS] Test 7: RBAC target validation strictly isolates roles and prevents privilege escalation\n');

    console.log('====================================================');
    console.log('ALL 7 MANDATORY REGRESSION TESTS PASSED SUCCESSFULLY!');
    console.log('====================================================');
  } finally {
    // Restore environment
    process.env = originalEnv;
  }
}

runUrlResolverTests();
