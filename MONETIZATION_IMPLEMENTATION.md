# Food Lens - Monetization Implementation Guide

## 💰 Complete Guide to Implementing Payments & Monetization

This guide provides step-by-step instructions to implement subscription payments, freemium features, and revenue tracking in Food Lens.

---

## 🔧 Step 1: Set Up Stripe Payment Processing

Stripe is the recommended payment processor for handling subscriptions and payments.

### **1.1 Create Stripe Account**

1. Go to [stripe.com](https://stripe.com)
2. Sign up for a Stripe account
3. Verify your email and business information
4. Get your API keys from Dashboard → Developers → API Keys

### **1.2 Install Stripe Libraries**

```bash
# Backend
pnpm add stripe

# Frontend
pnpm add @stripe/react-stripe-js @stripe/js
```

### **1.3 Configure Environment Variables**

```env
# .env.production
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PREMIUM_PRICE_ID=price_...
STRIPE_PREMIUM_PLUS_PRICE_ID=price_...
```

---

## 💳 Step 2: Implement Subscription Database Schema

Extend the database to track subscriptions:

```typescript
// drizzle/schema.ts
import { mysqlTable, varchar, text, timestamp, decimal, mysqlEnum } from "drizzle-orm/mysql-core";

export const subscriptions = mysqlTable("subscriptions", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: int("userId").notNull(),
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }).notNull().unique(),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }).notNull().unique(),
  tier: mysqlEnum("tier", ["free", "premium", "premium_plus"]).default("free").notNull(),
  status: mysqlEnum("status", ["active", "canceled", "past_due", "incomplete"]).notNull(),
  currentPeriodStart: timestamp("currentPeriodStart").notNull(),
  currentPeriodEnd: timestamp("currentPeriodEnd").notNull(),
  canceledAt: timestamp("canceledAt"),
  nextBillingDate: timestamp("nextBillingDate"),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(), // in cents
  currency: varchar("currency", { length: 3 }).default("USD").notNull(),
  paymentMethod: varchar("paymentMethod", { length: 255 }), // Card ending in ****
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;

// Track payment history
export const payments = mysqlTable("payments", {
  id: varchar("id", { length: 64 }).primaryKey(),
  subscriptionId: varchar("subscriptionId", { length: 64 }).notNull(),
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 255 }).notNull().unique(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).notNull(),
  status: mysqlEnum("status", ["succeeded", "failed", "pending"]).notNull(),
  failureReason: text("failureReason"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Payment = typeof payments.$inferSelect;
```

### **Run Migration**

```bash
pnpm db:push
```

---

## 🔐 Step 3: Backend Subscription Logic

### **3.1 Create Stripe Service**

```typescript
// server/services/stripe.ts
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function createStripeCustomer(
  userId: number,
  email: string,
  name: string
) {
  const customer = await stripe.customers.create({
    email,
    name,
    metadata: { userId: userId.toString() },
  });
  
  return customer.id;
}

export async function createSubscription(
  customerId: string,
  priceId: string,
  trialDays = 7
) {
  const subscription = await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    trial_period_days: trialDays,
    payment_behavior: 'default_incomplete',
    expand: ['latest_invoice.payment_intent'],
  });
  
  return subscription;
}

export async function cancelSubscription(subscriptionId: string) {
  const subscription = await stripe.subscriptions.del(subscriptionId);
  return subscription;
}

export async function updateSubscriptionTier(
  subscriptionId: string,
  newPriceId: string
) {
  // Get current subscription
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  
  // Update to new price
  const updated = await stripe.subscriptions.update(subscriptionId, {
    items: [
      {
        id: subscription.items.data[0].id,
        price: newPriceId,
      },
    ],
  });
  
  return updated;
}

export async function getSubscription(subscriptionId: string) {
  return await stripe.subscriptions.retrieve(subscriptionId);
}

export async function handleWebhookEvent(event: Stripe.Event) {
  switch (event.type) {
    case 'customer.subscription.created':
      return handleSubscriptionCreated(event.data.object as Stripe.Subscription);
    
    case 'customer.subscription.updated':
      return handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
    
    case 'customer.subscription.deleted':
      return handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
    
    case 'invoice.payment_succeeded':
      return handlePaymentSucceeded(event.data.object as Stripe.Invoice);
    
    case 'invoice.payment_failed':
      return handlePaymentFailed(event.data.object as Stripe.Invoice);
    
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }
}
```

### **3.2 Webhook Handler**

```typescript
// server/webhooks/stripe.ts
import { Router } from 'express';
import Stripe from 'stripe';
import { createSubscription, updateSubscription, cancelSubscription } from '../db';

const router = Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

router.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'] as string;
  
  let event: Stripe.Event;
  
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return res.sendStatus(400);
  }
  
  try {
    switch (event.type) {
      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = parseInt(subscription.metadata.userId);
        
        await createSubscription(userId, {
          stripeSubscriptionId: subscription.id,
          stripeCustomerId: subscription.customer as string,
          tier: getTierFromPriceId(subscription.items.data[0].price.id),
          status: subscription.status as any,
          currentPeriodStart: new Date(subscription.current_period_start * 1000),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          amount: subscription.items.data[0].price.unit_amount || 0,
          currency: subscription.currency.toUpperCase(),
        });
        break;
      }
      
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = parseInt(subscription.metadata.userId);
        
        await updateSubscription(userId, {
          tier: getTierFromPriceId(subscription.items.data[0].price.id),
          status: subscription.status as any,
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        });
        break;
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = parseInt(subscription.metadata.userId);
        
        await cancelSubscription(userId, {
          status: 'canceled',
          canceledAt: new Date(),
        });
        break;
      }
      
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        console.log(`Payment succeeded for invoice ${invoice.id}`);
        // Send confirmation email to user
        break;
      }
      
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        console.log(`Payment failed for invoice ${invoice.id}`);
        // Send retry email to user
        break;
      }
    }
    
    res.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

function getTierFromPriceId(priceId: string): 'premium' | 'premium_plus' {
  if (priceId === process.env.STRIPE_PREMIUM_PRICE_ID) {
    return 'premium';
  } else if (priceId === process.env.STRIPE_PREMIUM_PLUS_PRICE_ID) {
    return 'premium_plus';
  }
  return 'premium';
}

export default router;
```

### **3.3 tRPC Subscription Procedures**

```typescript
// server/routers/subscription.ts
import { router, protectedProcedure } from '../trpc';
import { z } from 'zod';
import { createStripeCustomer, createSubscription, cancelSubscription } from '../services/stripe';
import { createSubscription as saveSubscription } from '../db';

export const subscriptionRouter = router({
  // Get current subscription
  getCurrentSubscription: protectedProcedure.query(async ({ ctx }) => {
    const subscription = await db.select().from(subscriptions)
      .where(eq(subscriptions.userId, ctx.user.id))
      .orderBy(desc(subscriptions.createdAt))
      .limit(1);
    
    return subscription[0] || null;
  }),
  
  // Create subscription (checkout)
  createCheckoutSession: protectedProcedure
    .input(z.object({
      tier: z.enum(['premium', 'premium_plus']),
      trialDays: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Get or create Stripe customer
      let customerId = ctx.user.stripeCustomerId;
      
      if (!customerId) {
        customerId = await createStripeCustomer(
          ctx.user.id,
          ctx.user.email!,
          ctx.user.name!
        );
        
        // Save to user
        await updateUser(ctx.user.id, { stripeCustomerId: customerId });
      }
      
      // Get price ID
      const priceId = input.tier === 'premium'
        ? process.env.STRIPE_PREMIUM_PRICE_ID!
        : process.env.STRIPE_PREMIUM_PLUS_PRICE_ID!;
      
      // Create subscription
      const subscription = await createSubscription(
        customerId,
        priceId,
        input.trialDays || 7
      );
      
      // Save to database
      await saveSubscription(ctx.user.id, {
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: customerId,
        tier: input.tier,
        status: subscription.status as any,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        amount: subscription.items.data[0].price.unit_amount || 0,
        currency: subscription.currency.toUpperCase(),
      });
      
      return {
        subscriptionId: subscription.id,
        clientSecret: (subscription.latest_invoice as any)?.payment_intent?.client_secret,
      };
    }),
  
  // Upgrade/downgrade subscription
  updateSubscriptionTier: protectedProcedure
    .input(z.object({
      tier: z.enum(['premium', 'premium_plus']),
    }))
    .mutation(async ({ ctx, input }) => {
      const currentSub = await db.select().from(subscriptions)
        .where(eq(subscriptions.userId, ctx.user.id))
        .limit(1);
      
      if (!currentSub[0]) {
        throw new Error('No active subscription');
      }
      
      const priceId = input.tier === 'premium'
        ? process.env.STRIPE_PREMIUM_PRICE_ID!
        : process.env.STRIPE_PREMIUM_PLUS_PRICE_ID!;
      
      const updated = await updateSubscriptionTier(
        currentSub[0].stripeSubscriptionId,
        priceId
      );
      
      return { success: true, subscription: updated };
    }),
  
  // Cancel subscription
  cancelSubscription: protectedProcedure.mutation(async ({ ctx }) => {
    const currentSub = await db.select().from(subscriptions)
      .where(eq(subscriptions.userId, ctx.user.id))
      .limit(1);
    
    if (!currentSub[0]) {
      throw new Error('No active subscription');
    }
    
    await cancelSubscription(currentSub[0].stripeSubscriptionId);
    
    return { success: true };
  }),
});
```

---

## 🎨 Step 4: Frontend Subscription UI

### **4.1 Pricing Page**

```typescript
// client/src/pages/Pricing.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check } from 'lucide-react';

export function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');
  
  const plans = [
    {
      name: 'Free',
      price: 0,
      period: 'month',
      description: 'Perfect for casual users',
      features: [
        '5 scans per day',
        'Basic nutrition info',
        '30-day history',
        'Ad-supported',
      ],
      cta: 'Get Started',
      highlighted: false,
    },
    {
      name: 'Premium',
      price: billingPeriod === 'monthly' ? 9.99 : 79.99,
      period: billingPeriod === 'monthly' ? 'month' : 'year',
      description: 'For nutrition enthusiasts',
      features: [
        'Unlimited scans',
        'Complete nutrition breakdown',
        'Vitamins & minerals',
        'Allergen warnings',
        'Full scan history',
        'Ad-free',
        'Priority support',
      ],
      cta: 'Start Free Trial',
      highlighted: true,
    },
    {
      name: 'Premium Plus',
      price: billingPeriod === 'monthly' ? 19.99 : 179.99,
      period: billingPeriod === 'monthly' ? 'month' : 'year',
      description: 'For health-conscious users',
      features: [
        'Everything in Premium',
        'AI nutrition coaching',
        'Meal planning',
        'Fitness integration',
        'Export data (PDF/CSV)',
        'Family accounts (5)',
        '24/7 support',
      ],
      cta: 'Start Free Trial',
      highlighted: false,
    },
  ];
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-slate-300 mb-8">
            Choose the plan that fits your nutrition goals
          </p>
          
          {/* Billing Toggle */}
          <div className="flex justify-center items-center gap-4">
            <span className={billingPeriod === 'monthly' ? 'text-white' : 'text-slate-400'}>
              Monthly
            </span>
            <button
              onClick={() => setBillingPeriod(billingPeriod === 'monthly' ? 'annual' : 'monthly')}
              className="relative inline-flex h-8 w-14 items-center rounded-full bg-slate-700"
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition ${
                  billingPeriod === 'annual' ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={billingPeriod === 'annual' ? 'text-white' : 'text-slate-400'}>
              Annual
              {billingPeriod === 'annual' && (
                <span className="ml-2 text-green-400 font-semibold">Save 33%</span>
              )}
            </span>
          </div>
        </div>
        
        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative p-8 ${
                plan.highlighted
                  ? 'ring-2 ring-orange-500 scale-105'
                  : ''
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-orange-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </div>
              )}
              
              <h3 className="text-2xl font-bold text-white mb-2">
                {plan.name}
              </h3>
              <p className="text-slate-400 mb-6">{plan.description}</p>
              
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">
                  ${plan.price.toFixed(2)}
                </span>
                <span className="text-slate-400 ml-2">/{plan.period}</span>
              </div>
              
              <Button
                className={`w-full mb-8 ${
                  plan.highlighted
                    ? 'bg-orange-500 hover:bg-orange-600'
                    : 'bg-slate-700 hover:bg-slate-600'
                }`}
              >
                {plan.cta}
              </Button>
              
              <div className="space-y-4">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-300">{feature}</span>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
```

### **4.2 Checkout Component**

```typescript
// client/src/components/SubscriptionCheckout.tsx
import { useState } from 'react';
import { loadStripe } from '@stripe/js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { trpc } from '@/lib/trpc';

const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
);

export function SubscriptionCheckout({ tier }: { tier: 'premium' | 'premium_plus' }) {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm tier={tier} />
    </Elements>
  );
}

function CheckoutForm({ tier }: { tier: 'premium' | 'premium_plus' }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const createCheckout = trpc.subscription.createCheckoutSession.useMutation();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Create subscription
      const { data } = await createCheckout.mutateAsync({ tier });
      
      // Confirm payment
      const { error: confirmError } = await stripe.confirmCardPayment(
        data.clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardElement)!,
          },
        }
      );
      
      if (confirmError) {
        setError(confirmError.message || 'Payment failed');
      } else {
        // Success - redirect to dashboard
        window.location.href = '/dashboard';
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">
        Subscribe to {tier === 'premium' ? 'Premium' : 'Premium Plus'}
      </h2>
      
      <CardElement
        options={{
          style: {
            base: {
              fontSize: '16px',
              color: '#fff',
              '::placeholder': { color: '#aab7c4' },
            },
          },
        }}
      />
      
      {error && <div className="text-red-500 mt-4">{error}</div>}
      
      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full mt-6 bg-orange-500 text-white py-2 rounded-lg font-semibold disabled:opacity-50"
      >
        {loading ? 'Processing...' : 'Subscribe Now'}
      </button>
    </form>
  );
}
```

---

## 🎯 Step 5: Feature Gating by Subscription Tier

### **5.1 Backend Feature Gates**

```typescript
// server/routers/food.ts
import { protectedProcedure } from '../trpc';

export const foodRouter = router({
  analyzeFood: protectedProcedure
    .input(z.object({ imageData: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Get user subscription
      const subscription = await getUserSubscription(ctx.user.id);
      
      // Check scan limit for free tier
      if (subscription.tier === 'free') {
        const scansToday = await countScansToday(ctx.user.id);
        
        if (scansToday >= 5) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Free tier limited to 5 scans per day. Upgrade to Premium for unlimited scans.',
          });
        }
      }
      
      // Perform analysis
      const analysis = await analyzeWithAI(input.imageData);
      
      // For free tier, only return macros
      if (subscription.tier === 'free') {
        return {
          foodName: analysis.foodName,
          calories: analysis.calories,
          protein: analysis.protein,
          carbs: analysis.carbs,
          fats: analysis.fats,
          // Hide detailed nutrients
        };
      }
      
      // For premium, return full analysis
      return analysis;
    }),
});
```

### **5.2 Frontend Feature Gates**

```typescript
// client/src/hooks/useFeatureAccess.ts
import { useAuth } from './useAuth';
import { trpc } from '@/lib/trpc';

export function useFeatureAccess() {
  const { user } = useAuth();
  const { data: subscription } = trpc.subscription.getCurrentSubscription.useQuery();
  
  return {
    canScan: true, // All users
    unlimitedScans: subscription?.tier !== 'free',
    vitaminsAndMinerals: subscription?.tier !== 'free',
    mealPlanner: subscription?.tier === 'premium' || subscription?.tier === 'premium_plus',
    nutritionCoaching: subscription?.tier === 'premium_plus',
    fitnessIntegration: subscription?.tier === 'premium_plus',
    exportData: subscription?.tier === 'premium_plus',
    familyAccounts: subscription?.tier === 'premium_plus',
  };
}

// Usage in component
function ScanDetail() {
  const features = useFeatureAccess();
  
  return (
    <div>
      {features.vitaminsAndMinerals ? (
        <VitaminsSection />
      ) : (
        <div className="p-4 bg-blue-100 rounded">
          <p>Upgrade to Premium to see vitamin & mineral details</p>
          <button onClick={() => navigate('/pricing')}>Upgrade Now</button>
        </div>
      )}
    </div>
  );
}
```

---

## 📊 Step 6: Analytics & Revenue Tracking

### **6.1 Track Subscription Events**

```typescript
// server/analytics.ts
import { analytics } from './services/analytics';

export async function trackSubscriptionEvent(
  userId: number,
  event: string,
  properties: any
) {
  await analytics.track(userId, event, properties);
}

// Usage
await trackSubscriptionEvent(ctx.user.id, 'subscription_created', {
  tier: 'premium',
  amount: 9.99,
  currency: 'USD',
});

await trackSubscriptionEvent(ctx.user.id, 'subscription_upgraded', {
  from: 'premium',
  to: 'premium_plus',
  amount: 19.99,
});

await trackSubscriptionEvent(ctx.user.id, 'subscription_canceled', {
  tier: 'premium',
  reason: 'too_expensive',
});
```

### **6.2 Revenue Dashboard Queries**

```typescript
// server/analytics/revenue.ts
export async function calculateMRR() {
  const result = await db
    .select({
      total: sql`SUM(amount)`,
    })
    .from(subscriptions)
    .where(eq(subscriptions.status, 'active'));
  
  return result[0]?.total || 0;
}

export async function calculateChurnRate() {
  const currentMonth = new Date();
  currentMonth.setMonth(currentMonth.getMonth() - 1);
  
  const canceled = await db
    .select({ count: sql`COUNT(*)` })
    .from(subscriptions)
    .where(
      and(
        eq(subscriptions.status, 'canceled'),
        gte(subscriptions.canceledAt, currentMonth)
      )
    );
  
  const total = await db
    .select({ count: sql`COUNT(*)` })
    .from(subscriptions)
    .where(ne(subscriptions.tier, 'free'));
  
  return (canceled[0].count / total[0].count) * 100;
}

export async function getRevenueByTier() {
  return await db
    .select({
      tier: subscriptions.tier,
      count: sql`COUNT(*)`,
      revenue: sql`SUM(amount)`,
    })
    .from(subscriptions)
    .where(eq(subscriptions.status, 'active'))
    .groupBy(subscriptions.tier);
}
```

---

## 🎯 Step 7: Free vs Paid Strategy

### **Free Tier Strategy**

**Goal**: Maximize user acquisition and engagement

```typescript
// Features for free tier
const freeFeatures = {
  scansPerDay: 5,
  historyDays: 30,
  showMacros: true,
  showMicros: false,
  showAllergens: false,
  showHealthBenefits: false,
  mealPlanner: false,
  adSupported: true,
};

// Conversion triggers
const conversionTriggers = [
  'user_hits_daily_limit', // 5 scans/day
  'user_views_premium_feature', // Tries to see vitamins
  'user_scans_7_times', // Engaged user
  'user_active_7_days', // Regular user
];
```

### **Paid Tier Strategy**

**Goal**: Maximize lifetime value and retention

```typescript
// Premium tier features
const premiumFeatures = {
  scansPerDay: 'unlimited',
  historyDays: 'unlimited',
  showMacros: true,
  showMicros: true,
  showAllergens: true,
  showHealthBenefits: true,
  mealPlanner: false,
  adSupported: false,
  price: 9.99, // per month
};

// Premium+ tier features
const premiumPlusFeatures = {
  ...premiumFeatures,
  mealPlanner: true,
  nutritionCoaching: true,
  fitnessIntegration: true,
  familyAccounts: true,
  price: 19.99, // per month
};

// Retention strategies
const retentionStrategies = [
  'email_weekly_digest', // Show progress
  'push_notifications', // Remind to scan
  'personalized_recommendations', // Keep engaged
  'loyalty_rewards', // Referral bonuses
];
```

---

## 💡 Step 8: Conversion Optimization

### **Upgrade Prompts**

```typescript
// client/src/components/UpgradePrompt.tsx
export function UpgradePrompt({ feature }: { feature: string }) {
  const { user } = useAuth();
  
  if (user?.subscription?.tier !== 'free') {
    return null;
  }
  
  const messages: Record<string, string> = {
    vitamins: 'See detailed vitamin & mineral breakdown',
    mealPlanner: 'Get personalized meal plans',
    coaching: 'Get AI nutrition coaching',
  };
  
  return (
    <div className="bg-gradient-to-r from-orange-500 to-yellow-500 p-4 rounded-lg">
      <p className="text-white font-semibold mb-3">
        ✨ {messages[feature]}
      </p>
      <button
        onClick={() => navigate('/pricing')}
        className="bg-white text-orange-600 px-4 py-2 rounded font-semibold hover:bg-gray-100"
      >
        Upgrade to Premium
      </button>
    </div>
  );
}
```

### **Limited-Time Offers**

```typescript
// Create urgency with discounts
export async function createPromotionalOffer(
  discountPercent: number,
  expiresAt: Date
) {
  const coupon = await stripe.coupons.create({
    percent_off: discountPercent,
    duration: 'repeating',
    duration_in_months: 3,
  });
  
  return coupon;
}

// Show in UI
function PricingCard() {
  const [discount] = useState(0.2); // 20% off
  const originalPrice = 9.99;
  const discountedPrice = originalPrice * (1 - discount);
  
  return (
    <div>
      <p className="text-sm text-red-500">
        Limited time: 20% off!
      </p>
      <p className="text-2xl font-bold">
        ${discountedPrice.toFixed(2)}
        <span className="line-through text-gray-500 ml-2">
          ${originalPrice.toFixed(2)}
        </span>
      </p>
    </div>
  );
}
```

---

## 📋 Monetization Checklist

- [ ] Stripe account created and configured
- [ ] API keys added to environment variables
- [ ] Database schema extended with subscriptions
- [ ] Webhook endpoint implemented
- [ ] Subscription creation flow working
- [ ] Upgrade/downgrade flow working
- [ ] Cancellation flow working
- [ ] Pricing page designed and deployed
- [ ] Checkout component implemented
- [ ] Feature gating implemented (backend)
- [ ] Feature gating implemented (frontend)
- [ ] Analytics tracking configured
- [ ] Revenue dashboard working
- [ ] Email notifications configured
- [ ] A/B testing setup (optional)
- [ ] Legal review completed (terms, privacy)

---

**Document Version**: 1.0  
**Last Updated**: February 14, 2026  
**Status**: Production Ready
