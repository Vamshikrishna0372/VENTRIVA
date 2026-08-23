import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import MainLayout from '../layouts/MainLayout';
import FounderLayout from '../layouts/FounderLayout';
import InvestorLayout from '../layouts/InvestorLayout';
import AdminLayout from '../layouts/AdminLayout';

// Security Route Guards & Error Boundary
import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';
import ErrorBoundary from '../components/common/ErrorBoundary';
import PageLoader from '../components/common/PageLoader';

// Public Pages
import LandingPage from '../pages/shared/LandingPage';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import UnauthorizedPage from '../pages/shared/UnauthorizedPage';

// Lazy Loaded Founder Pages
const FounderDashboard = lazy(() => import('../pages/founder/FounderDashboard'));
const FounderAnalytics = lazy(() => import('../pages/founder/FounderAnalytics'));
const FounderPerformance = lazy(() => import('../pages/founder/FounderPerformance'));
const FounderProfile = lazy(() => import('../pages/founder/FounderProfile'));
const FounderStartup = lazy(() => import('../pages/founder/FounderStartup'));
const FounderStartupPreview = lazy(() => import('../pages/founder/FounderStartupPreview'));
const FounderDeals = lazy(() => import('../pages/founder/FounderDeals'));
const FounderDealDetail = lazy(() => import('../pages/founder/FounderDealDetail'));
const FounderPortfolio = lazy(() => import('../pages/founder/FounderPortfolio'));
const FounderDocuments = lazy(() => import('../pages/founder/FounderDocuments'));
const FounderDocumentRequests = lazy(() => import('../pages/founder/FounderDocumentRequests'));
const FounderInterests = lazy(() => import('../pages/founder/FounderInterests'));
const FounderMessages = lazy(() => import('../pages/founder/FounderMessages'));
const FounderMeetings = lazy(() => import('../pages/founder/FounderMeetings'));
const FounderAvailability = lazy(() => import('../pages/founder/FounderAvailability'));
const FounderFundraising = lazy(() => import('../pages/founder/FounderFundraising'));
const FounderFundraisingDetail = lazy(() => import('../pages/founder/FounderFundraisingDetail'));
const FounderClosings = lazy(() => import('../pages/founder/FounderClosings'));
const FounderClosingDetail = lazy(() => import('../pages/founder/FounderClosingDetail'));
const FounderCapTable = lazy(() => import('../pages/founder/FounderCapTable'));
const FounderGovernance = lazy(() => import('../pages/founder/FounderGovernance'));

// Lazy Loaded Investor Pages
const InvestorDashboard = lazy(() => import('../pages/investor/InvestorDashboard'));
const InvestorDiscover = lazy(() => import('../pages/investor/InvestorDiscover'));
const InvestorStartupDetail = lazy(() => import('../pages/investor/InvestorStartupDetail'));
const InvestorShortlist = lazy(() => import('../pages/investor/InvestorShortlist'));
const InvestorEvaluationsDashboard = lazy(() => import('../pages/investor/InvestorEvaluationsDashboard'));
const InvestorEvaluate = lazy(() => import('../pages/investor/InvestorEvaluate'));
const InvestorCompare = lazy(() => import('../pages/investor/InvestorCompare'));
const InvestorPipeline = lazy(() => import('../pages/investor/InvestorPipeline'));
const InvestorPipelineDetail = lazy(() => import('../pages/investor/InvestorPipelineDetail'));
const InvestorDeals = lazy(() => import('../pages/investor/InvestorDeals'));
const InvestorDealDetail = lazy(() => import('../pages/investor/InvestorDealDetail'));
const InvestorPortfolio = lazy(() => import('../pages/investor/InvestorPortfolio'));
const InvestorPortfolioDetail = lazy(() => import('../pages/investor/InvestorPortfolioDetail'));
const InvestorPortfolioIntelligence = lazy(() => import('../pages/investor/InvestorPortfolioIntelligence'));
const InvestorStrategy = lazy(() => import('../pages/investor/InvestorStrategy'));
const OpportunityRanking = lazy(() => import('../pages/investor/OpportunityRanking'));
const CapitalAllocation = lazy(() => import('../pages/investor/CapitalAllocation'));
const InvestmentDecisions = lazy(() => import('../pages/investor/InvestmentDecisions'));
const PortfolioScenarios = lazy(() => import('../pages/investor/PortfolioScenarios'));
const InvestorFollowOnInvestments = lazy(() => import('../pages/investor/InvestorFollowOnInvestments'));
const InvestorExits = lazy(() => import('../pages/investor/InvestorExits'));
const InvestorDocuments = lazy(() => import('../pages/investor/InvestorDocuments'));
const InvestorDueDiligence = lazy(() => import('../pages/investor/InvestorDueDiligence'));
const InvestorDocumentRequests = lazy(() => import('../pages/investor/InvestorDocumentRequests'));
const InvestorInterests = lazy(() => import('../pages/investor/InvestorInterests'));
const InvestorMessages = lazy(() => import('../pages/investor/InvestorMessages'));
const InvestorMeetings = lazy(() => import('../pages/investor/InvestorMeetings'));
const InvestorAnalytics = lazy(() => import('../pages/investor/InvestorAnalytics'));
const InvestorInsights = lazy(() => import('../pages/investor/InvestorInsights'));
const InvestorRecommendations = lazy(() => import('../pages/investor/InvestorRecommendations'));
const InvestorSettings = lazy(() => import('../pages/investor/InvestorSettings'));
const InvestorFundraising = lazy(() => import('../pages/investor/InvestorFundraising'));
const InvestorFundraisingDetail = lazy(() => import('../pages/investor/InvestorFundraisingDetail'));
const InvestorClosings = lazy(() => import('../pages/investor/InvestorClosings'));
const InvestorClosingDetail = lazy(() => import('../pages/investor/InvestorClosingDetail'));
const InvestorCapTable = lazy(() => import('../pages/investor/InvestorCapTable'));
const InvestorGovernance = lazy(() => import('../pages/investor/InvestorGovernance'));

// Lazy Loaded Admin Pages
const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard'));
const AdminSystemHealth = lazy(() => import('../pages/admin/AdminSystemHealth'));
const AdminDeals = lazy(() => import('../pages/admin/AdminDeals'));
const AdminPortfolio = lazy(() => import('../pages/admin/AdminPortfolio'));
const AdminPortfolioIntelligence = lazy(() => import('../pages/admin/AdminPortfolioIntelligence'));
const AdminStrategyGovernance = lazy(() => import('../pages/admin/AdminStrategyGovernance'));
const AdminFundraising = lazy(() => import('../pages/admin/AdminFundraising'));
const AdminClosings = lazy(() => import('../pages/admin/AdminClosings'));
const AdminGovernance = lazy(() => import('../pages/admin/AdminGovernance'));
const AdminUsers = lazy(() => import('../pages/admin/AdminUsers'));
const AdminUserDetail = lazy(() => import('../pages/admin/AdminUserDetail'));
const AdminStartups = lazy(() => import('../pages/admin/AdminStartups'));
const AdminStartupDetail = lazy(() => import('../pages/admin/AdminStartupDetail'));
const AdminVerification = lazy(() => import('../pages/admin/AdminVerification'));
const AdminModeration = lazy(() => import('../pages/admin/AdminModeration'));
const AdminAuditLogs = lazy(() => import('../pages/admin/AdminAuditLogs'));
const AdminDocumentAudit = lazy(() => import('../pages/admin/AdminDocumentAudit'));
const AdminCommunication = lazy(() => import('../pages/admin/AdminCommunication'));
const AdminAnalytics = lazy(() => import('../pages/admin/AdminAnalytics'));
const AdminSettings = lazy(() => import('../pages/admin/AdminSettings'));

export const AppRoutes = () => {
  return (
    <ErrorBoundary fallbackTitle="Ventriva Application Error" fallbackMessage="An error occurred while loading the application interface.">
      <Suspense fallback={<PageLoader message="Loading Ventriva Module..." />}>
        <Routes>
          {/* Public Routes */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
          </Route>

          {/* Protected Founder Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<RoleRoute allowedRoles={['founder']} />}>
              <Route path="/founder" element={<FounderLayout />}>
                <Route index element={<Navigate to="/founder/dashboard" replace />} />
                <Route path="dashboard" element={<FounderDashboard />} />
                <Route path="analytics" element={<FounderAnalytics />} />
                <Route path="performance" element={<FounderPerformance />} />
                <Route path="profile" element={<FounderProfile />} />
                <Route path="startup" element={<FounderStartup />} />
                <Route path="startup/preview" element={<FounderStartupPreview />} />
                <Route path="deals" element={<FounderDeals />} />
                <Route path="deals/:id" element={<FounderDealDetail />} />
                <Route path="portfolio" element={<FounderPortfolio />} />
                <Route path="fundraising" element={<FounderFundraising />} />
                <Route path="fundraising/:id" element={<FounderFundraisingDetail />} />
                <Route path="closings" element={<FounderClosings />} />
                <Route path="closings/:id" element={<FounderClosingDetail />} />
                <Route path="governance" element={<FounderGovernance />} />
                <Route path="cap-table" element={<FounderCapTable />} />
                <Route path="documents" element={<FounderDocuments />} />
                <Route path="document-requests" element={<FounderDocumentRequests />} />
                <Route path="interests" element={<FounderInterests />} />
                <Route path="messages" element={<FounderMessages />} />
                <Route path="meetings" element={<FounderMeetings />} />
                <Route path="availability" element={<FounderAvailability />} />
              </Route>
            </Route>
          </Route>

          {/* Protected Investor Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<RoleRoute allowedRoles={['investor']} />}>
              <Route path="/investor" element={<InvestorLayout />}>
                <Route index element={<Navigate to="/investor/dashboard" replace />} />
                <Route path="dashboard" element={<InvestorDashboard />} />
                <Route path="discover" element={<InvestorDiscover />} />
                <Route path="startups/:id" element={<InvestorStartupDetail />} />
                <Route path="startups/:id/evaluate" element={<InvestorEvaluate />} />
                <Route path="evaluations" element={<InvestorEvaluationsDashboard />} />
                <Route path="compare" element={<InvestorCompare />} />
                <Route path="shortlist" element={<InvestorShortlist />} />
                <Route path="pipeline" element={<InvestorPipeline />} />
                <Route path="pipeline/:startupId" element={<InvestorPipelineDetail />} />
                <Route path="deals" element={<InvestorDeals />} />
                <Route path="deals/:id" element={<InvestorDealDetail />} />
                <Route path="portfolio" element={<InvestorPortfolio />} />
                <Route path="portfolio/intelligence" element={<InvestorPortfolioIntelligence />} />
                <Route path="portfolio/scenarios" element={<PortfolioScenarios />} />
                <Route path="portfolio/:id" element={<InvestorPortfolioDetail />} />
                <Route path="strategy" element={<InvestorStrategy />} />
                <Route path="opportunities/ranking" element={<OpportunityRanking />} />
                <Route path="capital-allocation" element={<CapitalAllocation />} />
                <Route path="investment-decisions" element={<InvestmentDecisions />} />
                <Route path="fundraising" element={<InvestorFundraising />} />
                <Route path="fundraising/:id" element={<InvestorFundraisingDetail />} />
                <Route path="closings" element={<InvestorClosings />} />
                <Route path="closings/:id" element={<InvestorClosingDetail />} />
                <Route path="governance" element={<InvestorGovernance />} />
                <Route path="cap-table" element={<InvestorCapTable />} />
                <Route path="follow-on-investments" element={<InvestorFollowOnInvestments />} />
                <Route path="exits" element={<InvestorExits />} />
                <Route path="documents" element={<InvestorDocuments />} />
                <Route path="due-diligence/:startupId" element={<InvestorDueDiligence />} />
                <Route path="document-requests" element={<InvestorDocumentRequests />} />
                <Route path="interests" element={<InvestorInterests />} />
                <Route path="messages" element={<InvestorMessages />} />
                <Route path="meetings" element={<InvestorMeetings />} />
                <Route path="analytics" element={<InvestorAnalytics />} />
                <Route path="insights" element={<InvestorInsights />} />
                <Route path="recommendations" element={<InvestorRecommendations />} />
                <Route path="settings" element={<InvestorSettings />} />
              </Route>
            </Route>
          </Route>

          {/* Protected Admin Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<RoleRoute allowedRoles={['admin']} />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="system" element={<AdminSystemHealth />} />
                <Route path="deals" element={<AdminDeals />} />
                <Route path="portfolio" element={<AdminPortfolio />} />
                <Route path="portfolio/intelligence" element={<AdminPortfolioIntelligence />} />
                <Route path="strategy-governance" element={<AdminStrategyGovernance />} />
                <Route path="fundraising" element={<AdminFundraising />} />
                <Route path="closings" element={<AdminClosings />} />
                <Route path="governance" element={<AdminGovernance />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="users/:id" element={<AdminUserDetail />} />
                <Route path="startups" element={<AdminStartups />} />
                <Route path="startups/:id" element={<AdminStartupDetail />} />
                <Route path="verification" element={<AdminVerification />} />
                <Route path="moderation" element={<AdminModeration />} />
                <Route path="audit-logs" element={<AdminAuditLogs />} />
                <Route path="documents" element={<AdminDocumentAudit />} />
                <Route path="communication" element={<AdminCommunication />} />
                <Route path="analytics" element={<AdminAnalytics />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>
            </Route>
          </Route>

          {/* Fallback Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
};

export default AppRoutes;
