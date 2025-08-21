import Stripe from 'stripe';
import { storage } from '../storage';
import type { PlanType } from './features';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-07-30.basil',
});

export interface CheckoutRequest {
  plan: 'PRO' | 'BUSINESS';
}

export interface CheckoutResponse {
  url: string;
}

export interface BillingStatus {
  plan: PlanType;
  subscriptionStatus: string;
  currentPeriodEnd?: Date;
}

export class BillingService {
  async createCheckoutSession(
    organizationId: string,
    plan: 'PRO' | 'BUSINESS',
    successUrl: string,
    cancelUrl: string
  ): Promise<CheckoutResponse> {
    const organization = await storage.getOrganization(organizationId);
    if (!organization) {
      throw new Error('Organization not found');
    }

    // Get or create Stripe customer
    let customerId = organization.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: `admin@${organization.slug}.cz`,
        name: organization.name,
        metadata: {
          organizationId: organization.id
        }
      });
      customerId = customer.id;
      await storage.updateOrganizationStripeCustomer(organizationId, customerId);
    }

    // Create Stripe price IDs based on plan
    const priceId = plan === 'PRO' 
      ? process.env.STRIPE_PRICE_PRO || 'price_pro_placeholder'
      : process.env.STRIPE_PRICE_BUSINESS || 'price_business_placeholder';

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        organizationId,
        plan
      }
    });

    if (!session.url) {
      throw new Error('Failed to create checkout session');
    }

    // Store payment record
    await storage.createPayment({
      organizationId,
      provider: 'stripe',
      externalId: session.id,
      plan,
      amountCents: plan === 'PRO' ? 22900 : 64900, // 229 CZK, 649 CZK
      currency: 'CZK',
      status: 'created'
    });

    return { url: session.url };
  }

  async handleWebhook(payload: string, signature: string): Promise<void> {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error('Missing STRIPE_WEBHOOK_SECRET');
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (err) {
      throw new Error(`Webhook signature verification failed: ${err}`);
    }

    // Store webhook event
    await storage.createWebhookEvent({
      provider: 'stripe',
      eventType: event.type,
      payload: event as any
    });

    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case 'invoice.payment_succeeded':
        await this.handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;
      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  }

  private async handleCheckoutSessionCompleted(session: Stripe.Checkout.Session): Promise<void> {
    const { organizationId, plan } = session.metadata || {};
    
    if (!organizationId || !plan) {
      console.error('Missing metadata in checkout session:', session.id);
      return;
    }

    // Update payment status
    await storage.updatePaymentByExternalId(session.id, {
      status: 'paid',
      paidAt: new Date()
    });

    // Update organization plan and subscription
    if (session.subscription) {
      const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
      
      await storage.updateOrganizationPlan(organizationId, {
        plan: plan as PlanType,
        subscriptionStatus: 'active',
        currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
        stripeSubscriptionId: subscription.id
      });
    }
  }

  private async handleInvoicePaymentSucceeded(invoice: Stripe.Invoice): Promise<void> {
    if (!(invoice as any).subscription) return;

    const subscription = await stripe.subscriptions.retrieve((invoice as any).subscription as string);
    const customerId = subscription.customer as string;
    
    // Find organization by Stripe customer ID
    const organization = await storage.getOrganizationByStripeCustomer(customerId);
    if (!organization) {
      console.error('Organization not found for customer:', customerId);
      return;
    }

    // Update subscription period
    await storage.updateOrganizationPlan(organization.id, {
      subscriptionStatus: 'active',
      currentPeriodEnd: new Date((subscription as any).current_period_end * 1000)
    });
  }

  private async handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
    const customerId = subscription.customer as string;
    
    const organization = await storage.getOrganizationByStripeCustomer(customerId);
    if (!organization) {
      console.error('Organization not found for customer:', customerId);
      return;
    }

    // Downgrade to FREE plan
    await storage.updateOrganizationPlan(organization.id, {
      plan: 'FREE',
      subscriptionStatus: 'inactive',
      currentPeriodEnd: null,
      stripeSubscriptionId: null
    });
  }

  async getBillingStatus(organizationId: string): Promise<BillingStatus> {
    const organization = await storage.getOrganization(organizationId);
    if (!organization) {
      throw new Error('Organization not found');
    }

    return {
      plan: (organization.plan as PlanType) || 'FREE',
      subscriptionStatus: organization.subscriptionStatus || 'inactive',
      currentPeriodEnd: organization.subscriptionCurrentPeriodEnd || undefined
    };
  }

  async createPortalSession(organizationId: string, returnUrl: string): Promise<{ url: string }> {
    const organization = await storage.getOrganization(organizationId);
    if (!organization?.stripeCustomerId) {
      throw new Error('No Stripe customer found');
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: organization.stripeCustomerId,
      return_url: returnUrl,
    });

    return { url: session.url };
  }
}

export const billingService = new BillingService();