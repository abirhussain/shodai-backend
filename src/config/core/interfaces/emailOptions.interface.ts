export interface EmailOptions {
    from: {
      name: string;
      address: string;
    };
    to: string;
    subject: string;
    html: string;
  }