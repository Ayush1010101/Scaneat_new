# Food Lens - User Data Collection & Privacy Compliance Guide

## 📊 User Data Collection Strategy

Understanding what data to collect, how to collect it ethically, and how to comply with privacy regulations is critical for platform success and user trust.

---

## 🎯 Types of User Data

### **1. Essential Data (Required for App Function)**

This data is necessary for the core functionality of Food Lens.

#### **User Account Data**
```typescript
interface UserProfile {
  id: number;
  openId: string;           // OAuth identifier
  name: string;             // User's name
  email: string;            // Email address
  loginMethod: string;      // OAuth provider (Google, Apple, etc.)
  role: 'user' | 'admin';  // User role
  createdAt: Date;         // Account creation date
  updatedAt: Date;         // Last profile update
  lastSignedIn: Date;      // Last login time
}
```

**Why Collect?**
- Authentication and authorization
- Communication (password resets, notifications)
- Account management
- Legal compliance (GDPR, CCPA)

#### **Food Scan Data**
```typescript
interface FoodScan {
  id: string;
  userId: number;           // Link to user
  foodName: string;         // Food identified
  imageUrl: string;         // Food photo (S3)
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  sugar: number;
  sodium: number;
  cholesterol: number;
  vitamins: JSON;          // Vitamin breakdown
  minerals: JSON;          // Mineral breakdown
  allergens: string[];     // Allergen warnings
  ingredients: string[];   // Ingredient list
  healthScore: number;     // 0-10 health rating
  confidenceScore: number; // AI accuracy (0-100%)
  createdAt: Date;         // Scan timestamp
  updatedAt: Date;
}
```

**Why Collect?**
- Provide nutritional analysis
- Build scan history
- Enable meal planning features
- Improve AI model accuracy

---

### **2. Optional Data (For Enhanced Features)**

This data improves user experience but isn't required.

#### **Dietary Preferences**
```typescript
interface DietaryPreferences {
  userId: number;
  dietaryRestrictions: string[];  // vegan, keto, gluten-free, etc.
  allergies: string[];            // Personal allergies
  healthGoals: string[];          // weight loss, muscle gain, etc.
  calorieTarget: number;          // Daily calorie goal
  macroTargets: {
    protein: number;
    carbs: number;
    fats: number;
  };
  preferredCuisines: string[];    // Favorite food types
  dislikedFoods: string[];        // Foods to avoid
  updatedAt: Date;
}
```

**Why Collect?**
- Personalize recommendations
- Provide tailored meal plans
- Better health insights
- Improve user engagement

#### **Health & Fitness Data**
```typescript
interface HealthData {
  userId: number;
  age: number;
  gender: 'male' | 'female' | 'other';
  weight: number;           // in kg
  height: number;           // in cm
  activityLevel: string;    // sedentary, light, moderate, active
  fitnessGoals: string[];   // weight loss, muscle gain, etc.
  medicalConditions: string[]; // diabetes, hypertension, etc.
  medications: string[];    // For drug-nutrient interactions
  updatedAt: Date;
}
```

**Why Collect?**
- Personalize nutrition recommendations
- Calculate BMI and caloric needs
- Provide health warnings
- Enable integration with fitness apps

#### **Location Data**
```typescript
interface LocationData {
  userId: number;
  country: string;
  state: string;
  city: string;
  timezone: string;
  latitude?: number;        // Optional, for restaurant recommendations
  longitude?: number;
  updatedAt: Date;
}
```

**Why Collect?**
- Localize recommendations (regional cuisines)
- Find nearby restaurants
- Show local food trends
- Comply with data localization laws

---

### **3. Behavioral Data (For Analytics & Improvement)**

This data helps improve the product but requires explicit consent.

#### **Usage Analytics**
```typescript
interface UserActivity {
  userId: number;
  sessionId: string;
  timestamp: Date;
  action: string;           // 'scan', 'view_history', 'upgrade', etc.
  duration: number;         // Session duration in seconds
  page: string;            // Current page/screen
  referrer: string;        // How user arrived
  deviceType: string;      // mobile, tablet, desktop
  osType: string;          // iOS, Android, Windows, Mac
  browserType: string;     // Chrome, Safari, Firefox, etc.
  appVersion: string;      // App version number
}
```

**Why Collect?**
- Understand user behavior
- Identify popular features
- Fix bugs and improve UX
- Measure engagement
- Track conversion funnels

#### **Feature Usage**
```typescript
interface FeatureUsage {
  userId: number;
  feature: string;         // 'meal_planner', 'history_filter', etc.
  usageCount: number;      // Times used
  lastUsed: Date;
  timeSpent: number;       // Total time in seconds
  conversionStatus: string; // 'free_user', 'premium_user'
}
```

**Why Collect?**
- Understand which features drive engagement
- Identify underutilized features
- Prioritize feature development
- Measure ROI on features

---

### **4. Transactional Data (For Payments & Billing)**

Required for subscription management and revenue tracking.

#### **Subscription Data**
```typescript
interface Subscription {
  userId: number;
  stripeCustomerId: string;
  subscriptionId: string;
  tier: 'free' | 'premium' | 'premium_plus';
  status: 'active' | 'canceled' | 'past_due';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  canceledAt?: Date;
  nextBillingDate: Date;
  amount: number;           // Monthly amount in cents
  currency: string;         // USD, EUR, etc.
  paymentMethod: string;    // Card ending in ****
  createdAt: Date;
  updatedAt: Date;
}
```

**Why Collect?**
- Process payments
- Manage subscriptions
- Track revenue
- Prevent fraud
- Enable refunds

---

## 🔐 Privacy Compliance

### **GDPR Compliance (EU Users)**

The General Data Protection Regulation (GDPR) requires specific handling of EU user data.

#### **Key Requirements**

1. **Lawful Basis for Processing**
   - Consent: User explicitly agrees to data collection
   - Contract: Data needed to provide service
   - Legal obligation: Required by law
   - Vital interests: Protect user health/safety
   - Public task: Government function
   - Legitimate interests: Business need (with user benefit)

2. **Consent Management**
```typescript
interface ConsentRecord {
  userId: number;
  consentType: string;      // 'marketing', 'analytics', 'profiling'
  status: 'granted' | 'denied' | 'withdrawn';
  timestamp: Date;
  ipAddress: string;        // For verification
  userAgent: string;        // Browser info
  version: string;          // Privacy policy version
}
```

3. **Data Subject Rights**
   - **Right to Access**: User can request all their data
   - **Right to Rectification**: User can correct inaccurate data
   - **Right to Erasure**: User can request data deletion ("Right to be Forgotten")
   - **Right to Restrict**: User can limit how data is used
   - **Right to Portability**: User can export data in standard format
   - **Right to Object**: User can opt-out of processing
   - **Right to Withdraw Consent**: User can revoke consent anytime

4. **Data Protection Officer (DPO)**
   - Required if processing large amounts of personal data
   - Responsible for GDPR compliance
   - Acts as contact point for authorities

#### **GDPR Implementation in Code**

```typescript
// Privacy API endpoints
export const privacyRouter = router({
  // Get all user data (GDPR Right to Access)
  exportUserData: protectedProcedure.query(async ({ ctx }) => {
    const user = await db.select().from(users)
      .where(eq(users.id, ctx.user.id));
    const scans = await db.select().from(scans)
      .where(eq(scans.userId, ctx.user.id));
    const preferences = await db.select().from(dietaryPreferences)
      .where(eq(dietaryPreferences.userId, ctx.user.id));
    
    return {
      user: user[0],
      scans,
      preferences,
      exportDate: new Date(),
      exportFormat: 'JSON'
    };
  }),

  // Delete all user data (GDPR Right to Erasure)
  deleteAllUserData: protectedProcedure.mutation(async ({ ctx }) => {
    // Delete in order (foreign keys)
    await db.delete(scans).where(eq(scans.userId, ctx.user.id));
    await db.delete(dietaryPreferences)
      .where(eq(dietaryPreferences.userId, ctx.user.id));
    await db.delete(users).where(eq(users.id, ctx.user.id));
    
    return { success: true, message: 'All data deleted' };
  }),

  // Update consent preferences
  updateConsent: protectedProcedure
    .input(z.object({
      marketing: z.boolean(),
      analytics: z.boolean(),
      profiling: z.boolean(),
    }))
    .mutation(async ({ ctx, input }) => {
      await db.insert(consentRecords).values({
        userId: ctx.user.id,
        consentType: 'all',
        status: input.marketing ? 'granted' : 'denied',
        timestamp: new Date(),
      });
      
      return { success: true };
    }),

  // Get consent status
  getConsent: protectedProcedure.query(async ({ ctx }) => {
    const consent = await db.select().from(consentRecords)
      .where(eq(consentRecords.userId, ctx.user.id))
      .orderBy(desc(consentRecords.timestamp))
      .limit(1);
    
    return consent[0] || { status: 'not_set' };
  }),
});
```

---

### **CCPA Compliance (California Users)**

The California Consumer Privacy Act (CCPA) grants California residents specific rights.

#### **Key Requirements**

1. **Disclosure**: Inform users what data you collect
2. **Right to Know**: Users can request what data you have
3. **Right to Delete**: Users can request data deletion
4. **Right to Opt-Out**: Users can opt-out of data sales
5. **Right to Non-Discrimination**: Can't penalize users for exercising rights
6. **Shine the Light Law**: Annual disclosure of data sharing

#### **CCPA Implementation**

```typescript
// CCPA Privacy Policy sections
const ccpaDisclosure = {
  dataCollected: [
    'Name, email, phone',
    'Food scan images and nutritional data',
    'Dietary preferences and health information',
    'Device information and usage analytics',
    'Payment information (processed by Stripe)'
  ],
  
  dataUses: [
    'Provide food analysis service',
    'Personalize recommendations',
    'Improve AI model accuracy',
    'Send notifications and updates',
    'Detect fraud and prevent abuse',
    'Comply with legal obligations'
  ],
  
  dataSharing: [
    'Service providers (Stripe, AWS, Manus)',
    'Legal authorities (if required by law)',
    'NOT sold to third parties'
  ],
  
  userRights: [
    'Right to know what data we collect',
    'Right to delete your data',
    'Right to opt-out of data sales',
    'Right to non-discrimination'
  ]
};
```

---

### **Other Privacy Regulations**

| Regulation | Region | Key Requirement |
|-----------|--------|-----------------|
| GDPR | EU | Explicit consent, right to erasure |
| CCPA | California | Right to know, delete, opt-out |
| PIPEDA | Canada | Consent, transparency, security |
| LGPD | Brazil | Consent, data minimization |
| PDPA | Singapore | Consent, purpose limitation |
| APPI | Japan | Consent, transparency |

---

## 🔒 Data Security Best Practices

### **1. Data Encryption**

```typescript
// Encrypt sensitive data before storage
import crypto from 'crypto';

function encryptData(data: string, key: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
  
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return iv.toString('hex') + ':' + encrypted;
}

function decryptData(encryptedData: string, key: string): string {
  const parts = encryptedData.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
  
  let decrypted = decipher.update(parts[1], 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

// Example: Encrypt health data
const healthData = JSON.stringify({ age: 30, weight: 70 });
const encrypted = encryptData(healthData, process.env.ENCRYPTION_KEY!);
```

### **2. Data Minimization**

Only collect data you actually need:

```typescript
// ❌ BAD: Collect everything
const userProfile = {
  name, email, phone, address, ssn, birthDate,
  medicalHistory, financialInfo, // ... 20+ fields
};

// ✅ GOOD: Collect only what's needed
const userProfile = {
  name,
  email,
  dietaryReferences,
  healthGoals,
};
```

### **3. Data Retention Policy**

```typescript
interface DataRetentionPolicy {
  userAccount: '5 years after deletion',
  foodScans: '2 years after creation',
  activityLogs: '90 days',
  errorLogs: '30 days',
  backups: '30 days',
  consentRecords: '3 years (for legal compliance)',
}

// Implement automated deletion
async function deleteOldData() {
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  
  await db.delete(activityLogs)
    .where(lt(activityLogs.timestamp, ninetyDaysAgo));
}

// Schedule daily
schedule.scheduleJob('0 2 * * *', deleteOldData);
```

### **4. Access Control**

```typescript
// Role-based access control
enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
}

// Middleware to check permissions
function requireRole(requiredRole: UserRole) {
  return async (ctx: any, next: any) => {
    if (ctx.user.role !== requiredRole) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Insufficient permissions'
      });
    }
    return next();
  };
}

// Usage
export const adminRouter = router({
  viewAllUsers: adminProcedure.query(async ({ ctx }) => {
    // Only admins can see this
    return await db.select().from(users);
  }),
});
```

### **5. Audit Logging**

```typescript
interface AuditLog {
  id: string;
  userId: number;
  action: string;           // 'delete_data', 'export_data', etc.
  resource: string;         // 'user_profile', 'scan_history'
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  changes: JSON;           // What changed
}

// Log all sensitive operations
async function logAudit(
  userId: number,
  action: string,
  resource: string,
  changes: any,
  req: Request
) {
  await db.insert(auditLogs).values({
    id: nanoid(),
    userId,
    action,
    resource,
    timestamp: new Date(),
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
    changes,
  });
}

// Example: Log when user deletes data
await logAudit(
  ctx.user.id,
  'delete_data',
  'food_scans',
  { deletedCount: 150 },
  req
);
```

---

## 📋 Privacy Policy Template

```markdown
# Privacy Policy - Food Lens

## 1. Information We Collect

### Personal Information
- Name, email address, phone number
- Account credentials and authentication data
- Dietary preferences and health information
- Payment information (processed by Stripe)

### Food Scan Data
- Food images you upload
- Nutritional analysis results
- Meal history and preferences

### Usage Information
- Device type, operating system, browser
- Pages visited, features used, time spent
- IP address, location (if permitted)
- Analytics data for improving service

## 2. How We Use Your Information

- Provide and improve the Food Lens service
- Personalize recommendations
- Process payments and manage subscriptions
- Send notifications and updates
- Detect fraud and prevent abuse
- Comply with legal obligations

## 3. Data Sharing

We do NOT sell your data. We share data only with:
- Service providers (Stripe, AWS, Manus)
- Legal authorities (if required by law)
- Your explicit consent for specific purposes

## 4. Your Privacy Rights

### GDPR (EU Users)
- Right to access your data
- Right to correct inaccurate data
- Right to delete your data
- Right to restrict processing
- Right to data portability
- Right to withdraw consent

### CCPA (California Users)
- Right to know what data we collect
- Right to delete your data
- Right to opt-out of data sales
- Right to non-discrimination

## 5. Data Security

We implement industry-standard security measures:
- SSL/TLS encryption for data in transit
- AES-256 encryption for sensitive data at rest
- Regular security audits
- Secure password hashing (bcrypt)
- Rate limiting and DDoS protection

## 6. Contact Us

For privacy concerns, contact: privacy@foodlens.com

Last Updated: February 14, 2026
```

---

## 🎯 Data Collection Best Practices

### **1. Transparency First**
- Clearly explain what data you collect
- Explain why you collect it
- Explain how you use it
- Make privacy policy easy to find

### **2. Consent Management**
```typescript
// Show consent banner on first visit
function ConsentBanner() {
  const [showBanner, setShowBanner] = useState(true);
  
  const handleAccept = () => {
    localStorage.setItem('consent', 'accepted');
    setShowBanner(false);
    // Track analytics
    trackEvent('consent_accepted');
  };
  
  const handleReject = () => {
    localStorage.setItem('consent', 'rejected');
    setShowBanner(false);
    // Don't track analytics
  };
  
  if (!showBanner) return null;
  
  return (
    <div className="consent-banner">
      <p>We use cookies and analytics to improve your experience.</p>
      <button onClick={handleAccept}>Accept</button>
      <button onClick={handleReject}>Reject</button>
      <a href="/privacy">Privacy Policy</a>
    </div>
  );
}
```

### **3. Minimal Data Collection**
- Only ask for data you need
- Don't collect "just in case"
- Delete data you no longer need
- Give users control over their data

### **4. User Control**
```typescript
// Privacy settings page
function PrivacySettings() {
  const [preferences, setPreferences] = useState({
    analytics: true,
    marketing: false,
    personalization: true,
  });
  
  const handleToggle = (key: string) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
    // Save to database
    trpc.privacy.updateConsent.mutate(preferences);
  };
  
  return (
    <div>
      <label>
        <input
          type="checkbox"
          checked={preferences.analytics}
          onChange={() => handleToggle('analytics')}
        />
        Allow analytics to improve the app
      </label>
      {/* More toggles */}
    </div>
  );
}
```

---

## 📊 Data Collection Checklist

- [ ] Privacy policy written and published
- [ ] Terms of service written and published
- [ ] Consent banner implemented
- [ ] GDPR compliance verified
- [ ] CCPA compliance verified
- [ ] Data encryption implemented
- [ ] Audit logging implemented
- [ ] Data retention policy defined
- [ ] User data export feature working
- [ ] User data deletion feature working
- [ ] Security audit completed
- [ ] DPA (Data Processing Agreement) with vendors
- [ ] Privacy impact assessment completed
- [ ] Contact info for privacy inquiries listed

---

**Document Version**: 1.0  
**Last Updated**: February 14, 2026  
**Status**: Production Ready
