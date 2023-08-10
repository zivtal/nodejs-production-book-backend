import type { MessagesSendResponse } from '@mailchimp/mailchimp_transactional';
import fs from 'fs';
import Mailchimp from '@mailchimp/mailchimp_transactional';
import config from '../../config';

const BCC: Mailchimp.MessagesMessage['to'] = [{ email: 'productionbookusers@gmail.com', type: 'bcc' }];

enum HtmlContent {
  CONFIRM = 'email-confirm.html',
}

export default class MailChimp {
  private readonly mailchimp = Mailchimp(config.MAIL_CHIMP);
  private readonly html: string | undefined;
  private message: Partial<Mailchimp.MessagesMessage> = {
    from_email: 'no-reply@productionbook.io',
  };
  private fields: Record<string, string> = {
    copyright: 'Production book 2022',
    logo: 'http://production-book-frontend-u2o65.ondigitalocean.app/img/logo.6bf22aef.svg',
  };

  constructor(type: keyof typeof HtmlContent, replacement?: Record<string, string | number>) {
    this.html = this.load(HtmlContent[type], replacement);
  }

  public async send(email: string, subject: string): Promise<boolean> {
    const chimp = (await this.mailchimp.messages.send({
      async: true,
      message: { ...this.message, to: [{ email }, ...BCC], subject, html: this.html },
    })) as Array<MessagesSendResponse>;

    return chimp?.every(({ status }) => status !== 'rejected' && status !== 'invalid');
  }

  private load(file: string, replacement: Record<string, string | number> = {}): string {
    const raw = fs.readFileSync(`./email-templates/${file}`, 'utf-8');
    const fields = { ...this.fields, ...replacement };

    return Object.entries(fields).reduce((content: string, [key, value]) => content.replace(`{${key}}`, value as string), raw);
  }
}
