
import { Domain } from './types';

export const AVAILABLE_DOMAINS: Domain[] = [
  'cloud-mail-verify.com',
  'user-auth-service.net',
  'secure-inbox.org',
  'ghost-mail.com',
  'fast-temp.io',
  'temp-zone.com',
  'mail-shield.io',
  'fast-inbox.net',
  'anon-drop.tech'
];

export const INITIAL_EMAILS = [
  {
    id: 'welcome-001',
    senderName: 'GhostMail Support',
    senderEmail: 'hello@ghost-mail.com',
    subject: 'Welcome to your premium temporary inbox!',
    body: 'Thank you for using GhostMail. We have provided you with a high-reputation domain optimized for large services like Netflix, Spotify, and social media platforms. Your messages will appear here instantly.',
    timestamp: new Date().toISOString(),
    isRead: false,
    category: 'primary'
  }
];
