
export interface Email {
  id: string;
  senderName: string;
  senderEmail: string;
  subject: string;
  body: string;
  timestamp: string;
  isRead: boolean;
  category: 'primary' | 'social' | 'promotions' | 'spam';
}

export type Domain = 
  | 'cloud-mail-verify.com' 
  | 'user-auth-service.net' 
  | 'secure-inbox.org' 
  | 'fast-temp.io' 
  | 'ghost-mail.com'
  | 'temp-zone.com'
  | 'mail-shield.io'
  | 'fast-inbox.net'
  | 'anon-drop.tech';

export interface MailboxState {
  address: string;
  domain: Domain;
  emails: Email[];
}
