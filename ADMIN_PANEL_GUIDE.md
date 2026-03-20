# Food Lens - Admin Panel Implementation Guide

## 🏢 Admin Panel Overview

The admin panel is a comprehensive management interface for platform owners to monitor users, revenue, analytics, and system health. It's a protected route accessible only to admin users (founder/owner).

---

## 🔐 Access & Authentication

### **Admin Route Protection**
- **URL**: `https://yourdomain.com/admin`
- **Access Level**: Admin users only
- **Authentication**: OAuth 2.0 + Role-based access control
- **Database Field**: `users.role = 'admin'`

### **How to Grant Admin Access**

1. **Direct Database Update** (Recommended for founder):
```sql
UPDATE users SET role = 'admin' WHERE openId = 'your-open-id';
```

2. **Via Admin Panel** (Once admin panel exists):
   - Go to User Management
   - Search for user
   - Click "Promote to Admin"

---

## 📊 Admin Panel Structure

### **Main Dashboard**
The landing page shows key metrics at a glance:

**Top KPIs (Key Performance Indicators)**
- Total Users: 50,234
- Active Users (30-day): 12,456
- Monthly Recurring Revenue (MRR): $125,432
- Conversion Rate: 18.5%
- Monthly Churn Rate: 4.2%

**Charts & Visualizations**
- User growth chart (last 12 months)
- Revenue trend (MRR over time)
- Subscription distribution (pie chart: free vs premium vs premium+)
- Scan volume over time
- Top 10 most scanned foods

---

## 🎯 Admin Panel Sections

### **1. User Management Dashboard**

**Features**:
- View all users in a sortable, filterable table
- User segments: Free, Premium, Premium+, Admin
- Search by email, name, or user ID
- Filter by signup date, last login, subscription status
- Bulk actions (send email, change role, export data)

**User Details View**:
- Profile information (name, email, signup date)
- Subscription status and renewal date
- Total scans and scan frequency
- Dietary preferences and restrictions
- Account activity log
- Option to promote/demote role
- Option to ban/suspend account

**Actions**:
- Send notification to user
- Reset password (via email)
- Extend subscription (free trial)
- Refund subscription
- Export user data (GDPR compliance)
- Delete account (with confirmation)

---

### **2. Subscription Management**

**Overview**:
- Total active subscriptions by tier
- Monthly/annual subscription split
- Revenue by subscription type
- Churn analysis and retention curves

**Subscription List**:
- All active subscriptions with renewal dates
- Failed payment tracking
- Dunning (retry) status
- Option to manually process refunds
- Upgrade/downgrade user subscription

**Revenue Metrics**:
- Monthly Recurring Revenue (MRR)
- Annual Recurring Revenue (ARR)
- Average Revenue Per User (ARPU)
- Lifetime Value (LTV) by cohort
- Customer Acquisition Cost (CAC) analysis

---

### **3. Analytics & Insights**

**User Analytics**:
- Daily Active Users (DAU)
- Monthly Active Users (MAU)
- User acquisition by source (organic, ads, referral)
- Cohort analysis (retention by signup date)
- Geographic distribution (if available)
- Device type distribution (mobile vs desktop)

**Engagement Metrics**:
- Average scans per user per day
- Feature usage breakdown (% using each feature)
- Session duration
- Bounce rate
- Time to first scan

**Food Scan Analytics**:
- Total scans per day/week/month
- Top 20 most scanned foods
- Allergen trends
- Dietary preference distribution
- Confidence score distribution
- Scan accuracy metrics

**Conversion Funnel**:
- Free users → Premium conversion rate
- Premium → Premium+ upgrade rate
- Trial completion rate
- Refund rate

---

### **4. Financial Dashboard**

**Revenue Overview**:
- Total revenue (all-time)
- Monthly revenue breakdown
- Revenue by source:
  - Subscription revenue (Premium + Premium+)
  - Advertising revenue
  - API revenue
  - White-label licensing
  - Data reports

**Expense Tracking**:
- LLM API costs (Manus Forge)
- Database hosting costs
- S3 storage costs
- Payment processing fees (Stripe)
- Marketing spend
- Employee salaries (if applicable)

**Profitability**:
- Gross profit margin
- Operating expenses
- Net profit
- Burn rate (if pre-revenue)
- Runway (months until profitability)

---

### **5. System Monitoring**

**API Health**:
- LLM API uptime (target: 99.9%)
- Average response time
- Error rate
- Rate limiting status
- Token usage and costs

**Database Health**:
- Database uptime
- Query performance
- Storage usage
- Backup status
- Connection pool status

**Application Health**:
- Server uptime
- CPU usage
- Memory usage
- Disk usage
- Error logs (last 100 errors)

**Real-time Alerts**:
- High error rate (> 1%)
- API timeout
- Database connection failure
- Storage quota exceeded
- Payment processing failure

---

### **6. Content & Feature Management**

**Featured Foods**:
- Manage featured/trending foods
- Create nutrition tips
- Add food categories

**In-App Messaging**:
- Create announcements
- Schedule notifications
- A/B test messages
- Track message engagement

**Promotional Campaigns**:
- Create discount codes
- Set campaign duration
- Track redemption rate
- Manage referral bonuses

---

### **7. Support & Feedback**

**Support Tickets**:
- View all customer support tickets
- Filter by status (open, in-progress, resolved)
- Assign to team members
- Add notes and responses
- Track response time

**Bug Reports**:
- View all reported bugs
- Prioritize issues
- Assign to developers
- Track resolution status

**Feature Requests**:
- View feature requests from users
- Vote/prioritize features
- Track implementation status
- Notify users when implemented

**User Reviews & Ratings**:
- View app store reviews
- Monitor sentiment
- Respond to reviews
- Track NPS (Net Promoter Score)

---

### **8. Settings & Configuration**

**Platform Settings**:
- App name and logo
- Subscription pricing (edit tiers)
- Payment methods
- Email templates
- Notification preferences
- API keys and webhooks

**User Preferences**:
- Default language
- Timezone settings
- Privacy policy
- Terms of service

**Security Settings**:
- Two-factor authentication (2FA) for admin
- IP whitelist for admin access
- Session timeout
- Audit logs

---

## 🛠️ Implementation Roadmap

### **Phase 1: Core Admin Features (Week 1-2)**
- [ ] Admin route protection
- [ ] User management dashboard
- [ ] Basic analytics (DAU, MAU, conversion)
- [ ] Subscription overview
- [ ] Simple financial dashboard

### **Phase 2: Advanced Analytics (Week 3-4)**
- [ ] Detailed user cohort analysis
- [ ] Food scan analytics
- [ ] Engagement metrics
- [ ] Churn analysis

### **Phase 3: System Monitoring (Week 5-6)**
- [ ] API health monitoring
- [ ] Database health checks
- [ ] Error logging and alerts
- [ ] Performance metrics

### **Phase 4: Support & Feedback (Week 7-8)**
- [ ] Support ticket system
- [ ] Bug report tracking
- [ ] Feature request voting
- [ ] User feedback collection

### **Phase 5: Advanced Features (Week 9-10)**
- [ ] Promotional campaign management
- [ ] A/B testing framework
- [ ] Advanced financial reporting
- [ ] Automated alerts and notifications

---

## 📱 Admin Panel UI Components

### **Layout**
```
┌─────────────────────────────────────────────┐
│  Food Lens Admin | User: Admin | Logout    │
├──────────────┬──────────────────────────────┤
│              │                              │
│  Sidebar     │     Main Content Area        │
│  - Dashboard │                              │
│  - Users     │     (Dashboard/Analytics)    │
│  - Subs      │                              │
│  - Analytics │                              │
│  - Finance   │                              │
│  - Monitoring│                              │
│  - Support   │                              │
│  - Settings  │                              │
│              │                              │
└──────────────┴──────────────────────────────┘
```

### **Key UI Elements**
- **Sidebar Navigation**: Collapsible menu for easy access
- **Top Bar**: User info, notifications, quick actions
- **KPI Cards**: Large, easy-to-read metric displays
- **Charts**: Line charts (trends), pie charts (distribution), bar charts (comparison)
- **Tables**: Sortable, filterable data tables with pagination
- **Modals**: For detailed views, confirmations, and forms
- **Notifications**: Real-time alerts for important events

---

## 🔧 Technical Implementation

### **Backend (tRPC Procedures)**

```typescript
// Admin-only procedures
export const adminRouter = router({
  // User Management
  getAllUsers: adminProcedure.query(async ({ ctx }) => {
    return await db.select().from(users);
  }),
  
  getUserStats: adminProcedure.query(async ({ ctx }) => {
    return {
      totalUsers: await countUsers(),
      activeUsers: await countActiveUsers(),
      premiumUsers: await countPremiumUsers(),
      churnRate: await calculateChurnRate(),
    };
  }),
  
  // Analytics
  getAnalytics: adminProcedure.query(async ({ ctx }) => {
    return {
      dau: await getDailyActiveUsers(),
      mau: await getMonthlyActiveUsers(),
      conversionRate: await getConversionRate(),
      scanStats: await getScanStats(),
    };
  }),
  
  // Financial
  getFinancialData: adminProcedure.query(async ({ ctx }) => {
    return {
      mrr: await calculateMRR(),
      arr: await calculateARR(),
      expenses: await getExpenses(),
      profit: await calculateProfit(),
    };
  }),
  
  // System Monitoring
  getSystemHealth: adminProcedure.query(async ({ ctx }) => {
    return {
      apiUptime: await checkAPIUptime(),
      dbHealth: await checkDatabaseHealth(),
      errorRate: await getErrorRate(),
      performance: await getPerformanceMetrics(),
    };
  }),
});
```

### **Frontend (React Components)**

```typescript
// Admin Layout
export function AdminLayout() {
  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <AdminTopBar />
        <main className="flex-1 overflow-auto p-6">
          <Outlet /> {/* Route content */}
        </main>
      </div>
    </div>
  );
}

// Dashboard Page
export function AdminDashboard() {
  const { data: stats } = trpc.admin.getUserStats.useQuery();
  const { data: analytics } = trpc.admin.getAnalytics.useQuery();
  const { data: financial } = trpc.admin.getFinancialData.useQuery();
  
  return (
    <div className="space-y-6">
      <KPICards stats={stats} />
      <Charts analytics={analytics} />
      <FinancialDashboard financial={financial} />
    </div>
  );
}
```

---

## 📊 Key Metrics Definitions

**Daily Active Users (DAU)**: Users who performed at least one action in the last 24 hours

**Monthly Active Users (MAU)**: Users who performed at least one action in the last 30 days

**Conversion Rate**: (Premium users / Total users) × 100

**Churn Rate**: (Cancelled subscriptions / Starting subscriptions) × 100

**Monthly Recurring Revenue (MRR)**: Total subscription revenue expected each month

**Annual Recurring Revenue (ARR)**: MRR × 12

**Average Revenue Per User (ARPU)**: Total revenue / Total users

**Customer Lifetime Value (LTV)**: Average revenue per user × Average customer lifespan

**Customer Acquisition Cost (CAC)**: Marketing spend / New customers acquired

---

## 🎯 Success Metrics for Admin Panel

- **Response Time**: < 500ms for all queries
- **Uptime**: 99.9% availability
- **Data Accuracy**: Real-time or < 5 minute delay
- **User Adoption**: Admin uses panel for 80%+ of decisions
- **Alert Accuracy**: < 5% false positive rate

---

## 🔒 Security Best Practices

1. **Role-Based Access Control (RBAC)**: Only admins can access admin panel
2. **Audit Logging**: Log all admin actions for compliance
3. **Session Management**: Auto-logout after 30 minutes of inactivity
4. **IP Whitelisting**: Optional restriction to specific IP addresses
5. **Two-Factor Authentication (2FA)**: Required for admin accounts
6. **Data Encryption**: Encrypt sensitive data in transit and at rest
7. **Regular Backups**: Daily backups of all data
8. **Penetration Testing**: Regular security audits

---

**Document Version**: 1.0  
**Last Updated**: February 14, 2026  
**Status**: Ready for Implementation
