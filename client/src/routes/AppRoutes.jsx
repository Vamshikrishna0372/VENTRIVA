import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import lazyWithRetry from '../utils/lazyWithRetry';

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
const FounderDashboard = lazyWithRetry(() => import('../pages/founder/FounderDashboard'));
const FounderAnalytics = lazyWithRetry(() => import('../pages/founder/FounderAnalytics'));
const FounderPerformance = lazyWithRetry(() => import('../pages/founder/FounderPerformance'));
const FounderProfile = lazyWithRetry(() => import('../pages/founder/FounderProfile'));
const FounderStartup = lazyWithRetry(() => import('../pages/founder/FounderStartup'));
const FounderStartupPreview = lazyWithRetry(() => import('../pages/founder/FounderStartupPreview'));
const FounderDeals = lazyWithRetry(() => import('../pages/founder/FounderDeals'));
const FounderDealDetail = lazyWithRetry(() => import('../pages/founder/FounderDealDetail'));
const FounderPortfolio = lazyWithRetry(() => import('../pages/founder/FounderPortfolio'));
const FounderDocuments = lazyWithRetry(() => import('../pages/founder/FounderDocuments'));
const FounderDocumentRequests = lazyWithRetry(() => import('../pages/founder/FounderDocumentRequests'));
const FounderInterests = lazyWithRetry(() => import('../pages/founder/FounderInterests'));
const FounderMessages = lazyWithRetry(() => import('../pages/founder/FounderMessages'));
const FounderMeetings = lazyWithRetry(() => import('../pages/founder/FounderMeetings'));
const FounderAvailability = lazyWithRetry(() => import('../pages/founder/FounderAvailability'));
const FounderFundraising = lazyWithRetry(() => import('../pages/founder/FounderFundraising'));
const FounderFundraisingDetail = lazyWithRetry(() => import('../pages/founder/FounderFundraisingDetail'));
const FounderClosings = lazyWithRetry(() => import('../pages/founder/FounderClosings'));
const FounderClosingDetail = lazyWithRetry(() => import('../pages/founder/FounderClosingDetail'));
const FounderCapTable = lazyWithRetry(() => import('../pages/founder/FounderCapTable'));
const FounderGovernance = lazyWithRetry(() => import('../pages/founder/FounderGovernance'));

// Lazy Loaded Investor Pages
const InvestorDashboard = lazyWithRetry(() => import('../pages/investor/InvestorDashboard'));
const InvestorDiscover = lazyWithRetry(() => import('../pages/investor/InvestorDiscover'));
const InvestorStartupDetail = lazyWithRetry(() => import('../pages/investor/InvestorStartupDetail'));
const InvestorShortlist = lazyWithRetry(() => import('../pages/investor/InvestorShortlist'));
const InvestorEvaluationsDashboard = lazyWithRetry(() => import('../pages/investor/InvestorEvaluationsDashboard'));
const InvestorEvaluate = lazyWithRetry(() => import('../pages/investor/InvestorEvaluate'));
const InvestorCompare = lazyWithRetry(() => import('../pages/investor/InvestorCompare'));
const InvestorPipeline = lazyWithRetry(() => import('../pages/investor/InvestorPipeline'));
const InvestorPipelineDetail = lazyWithRetry(() => import('../pages/investor/InvestorPipelineDetail'));
const InvestorDeals = lazyWithRetry(() => import('../pages/investor/InvestorDeals'));
const InvestorDealDetail = lazyWithRetry(() => import('../pages/investor/InvestorDealDetail'));
const InvestorPortfolio = lazyWithRetry(() => import('../pages/investor/InvestorPortfolio'));
const InvestorPortfolioDetail = lazyWithRetry(() => import('../pages/investor/InvestorPortfolioDetail'));
const InvestorPortfolioIntelligence = lazyWithRetry(() => import('../pages/investor/InvestorPortfolioIntelligence'));
const InvestorStrategy = lazyWithRetry(() => import('../pages/investor/InvestorStrategy'));
const OpportunityRanking = lazyWithRetry(() => import('../pages/investor/OpportunityRanking'));
const CapitalAllocation = lazyWithRetry(() => import('../pages/investor/CapitalAllocation'));
const InvestmentDecisions = lazyWithRetry(() => import('../pages/investor/InvestmentDecisions'));
const PortfolioScenarios = lazyWithRetry(() => import('../pages/investor/PortfolioScenarios'));
const InvestorFollowOnInvestments = lazyWithRetry(() => import('../pages/investor/InvestorFollowOnInvestments'));
const InvestorExits = lazyWithRetry(() => import('../pages/investor/InvestorExits'));
const InvestorDocuments = lazyWithRetry(() => import('../pages/investor/InvestorDocuments'));
const InvestorDueDiligence = lazyWithRetry(() => import('../pages/investor/InvestorDueDiligence'));
const InvestorDocumentRequests = lazyWithRetry(() => import('../pages/investor/InvestorDocumentRequests'));
const InvestorInterests = lazyWithRetry(() => import('../pages/investor/InvestorInterests'));
const InvestorMessages = lazyWithRetry(() => import('../pages/investor/InvestorMessages'));
const InvestorMeetings = lazyWithRetry(() => import('../pages/investor/InvestorMeetings'));
const InvestorAnalytics = lazyWithRetry(() => import('../pages/investor/InvestorAnalytics'));
const InvestorInsights = lazyWithRetry(() => import('../pages/investor/InvestorInsights'));
const InvestorRecommendations = lazyWithRetry(() => import('../pages/investor/InvestorRecommendations'));
const InvestorSettings = lazyWithRetry(() => import('../pages/investor/InvestorSettings'));
const InvestorFundraising = lazyWithRetry(() => import('../pages/investor/InvestorFundraising'));
const InvestorFundraisingDetail = lazyWithRetry(() => import('../pages/investor/InvestorFundraisingDetail'));
const InvestorClosings = lazyWithRetry(() => import('../pages/investor/InvestorClosings'));
const InvestorClosingDetail = lazyWithRetry(() => import('../pages/investor/InvestorClosingDetail'));
const InvestorCapTable = lazyWithRetry(() => import('../pages/investor/InvestorCapTable'));
const InvestorGovernance = lazyWithRetry(() => import('../pages/investor/InvestorGovernance'));

// Lazy Loaded Admin Pages
const AdminDashboard = lazyWithRetry(() => import('../pages/admin/AdminDashboard'));
const AdminSystemHealth = lazyWithRetry(() => import('../pages/admin/AdminSystemHealth'));
const AdminDeals = lazyWithRetry(() => import('../pages/admin/AdminDeals'));
const AdminPortfolio = lazyWithRetry(() => import('../pages/admin/AdminPortfolio'));
const AdminPortfolioIntelligence = lazyWithRetry(() => import('../pages/admin/AdminPortfolioIntelligence'));
const AdminStrategyGovernance = lazyWithRetry(() => import('../pages/admin/AdminStrategyGovernance'));
const AdminFundraising = lazyWithRetry(() => import('../pages/admin/AdminFundraising'));
const AdminClosings = lazyWithRetry(() => import('../pages/admin/AdminClosings'));
const AdminGovernance = lazyWithRetry(() => import('../pages/admin/AdminGovernance'));
const AdminUsers = lazyWithRetry(() => import('../pages/admin/AdminUsers'));
const AdminUserDetail = lazyWithRetry(() => import('../pages/admin/AdminUserDetail'));
const AdminStartups = lazyWithRetry(() => import('../pages/admin/AdminStartups'));
const AdminStartupDetail = lazyWithRetry(() => import('../pages/admin/AdminStartupDetail'));
const AdminVerification = lazyWithRetry(() => import('../pages/admin/AdminVerification'));
const AdminModeration = lazyWithRetry(() => import('../pages/admin/AdminModeration'));
const AdminAuditLogs = lazyWithRetry(() => import('../pages/admin/AdminAuditLogs'));
const AdminDocumentAudit = lazyWithRetry(() => import('../pages/admin/AdminDocumentAudit'));
const AdminCommunication = lazyWithRetry(() => import('../pages/admin/AdminCommunication'));
const AdminAnalytics = lazyWithRetry(() => import('../pages/admin/AdminAnalytics'));
const AdminSettings = lazyWithRetry(() => import('../pages/admin/AdminSettings'));


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
