import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { IResponse } from 'src/app/core/models/generic';
import { HttpService } from 'src/app/core/services/http.service';
import { SharedModule } from 'src/app/shared/shared.module';

interface PublicSettingItem {
  key?: string;
  value?: unknown;
  parsed_value?: unknown;
}

interface SupportContactDetails {
  companyName: string;
  tagline: string;
  email: string;
  additionalEmails: string[];
  phone: string;
  phoneNumbers: string[];
  whatsapp: string;
  whatsappNumbers: string[];
  address: string;
  logoUrl: string;
}

const PRIMARY_WHATSAPP_NUMBER = '+234 915 654 9709';

@Component({
  selector: 'app-support',
  imports: [
    CommonModule,
    SharedModule
  ],
  templateUrl: './support.component.html',
  styleUrl: './support.component.css'
})
export class SupportComponent {
  isLoading = false;
  showLogo = true;
  contact: SupportContactDetails = {
    companyName: 'AceRoyal Estates Homes Ltd.',
    tagline: "It's time to find your next home",
    email: 'customercare@aceroyalestates.com',
    additionalEmails: [],
    phone: '+2348000000000',
    phoneNumbers: ['+2348000000000'],
    whatsapp: PRIMARY_WHATSAPP_NUMBER,
    whatsappNumbers: [PRIMARY_WHATSAPP_NUMBER],
    address: 'Providence Plaza, 17 Olokonla Road, Sangotedo, Lekki-Ajah Expressway, Lagos.',
    logoUrl: 'https://cdn.aceroyalestates.com/brand/logo.png'
  };

  constructor(private httpService: HttpService) {}

  ngOnInit(): void {
    this.loadPublicContactDetails();
  }

  get phoneHref(): string {
    return `tel:${this.normalizePhoneForTel(this.contact.phone)}`;
  }

  get emailHref(): string {
    return `mailto:${this.contact.email}`;
  }

  get whatsAppHref(): string {
    const number = this.normalizePhoneForWhatsapp(this.contact.whatsapp || this.contact.phone);
    return number ? `https://wa.me/${number}` : '';
  }

  get hasWhatsApp(): boolean {
    return !!this.normalizePhoneForWhatsapp(this.contact.whatsapp || this.contact.phone);
  }

  get displayEmails(): string[] {
    return Array.from(new Set([this.contact.email, ...this.contact.additionalEmails].filter(Boolean)));
  }

  get displayPhones(): string[] {
    return Array.from(new Set([this.contact.phone, ...this.contact.phoneNumbers].filter(Boolean)));
  }

  private loadPublicContactDetails(): void {
    this.isLoading = true;

    this.httpService.get<IResponse<any>>('settings/public').subscribe({
      next: (response) => {
        this.contact = this.mapPublicSettingsToContact(response?.data);
        this.showLogo = !!this.contact.logoUrl;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading public support settings:', error);
        this.isLoading = false;
      }
    });
  }

  private mapPublicSettingsToContact(data: unknown): SupportContactDetails {
    const fallback = this.contact;

    if (data && typeof data === 'object' && !Array.isArray(data)) {
      const record = data as Record<string, unknown>;

      const primaryEmail =
        this.readString(record, ['app.contact.primary_email', 'email.support_email']) ||
        fallback.email;
      const additionalEmails = this.readStringArray(record, ['app.contact.additional_emails']);
      const phoneNumbers = this.readStringArray(record, ['app.contact.phone_numbers']);
      const whatsappNumbers = this.readStringArray(record, ['contact.whatsapp_numbers']);
      const preferredWhatsapp =
        whatsappNumbers.find(
          (number) => this.normalizePhoneForWhatsapp(number) === this.normalizePhoneForWhatsapp(PRIMARY_WHATSAPP_NUMBER)
        ) ||
        whatsappNumbers[0];

      return {
        companyName:
          this.readString(record, ['app.company.name', 'company.name', 'app.company.short_name']) ||
          fallback.companyName,
        tagline:
          this.readString(record, ['app.company.tagline', 'app.company.description']) ||
          fallback.tagline,
        email: primaryEmail,
        additionalEmails,
        phone: phoneNumbers[0] || this.readString(record, ['company.phone']) || fallback.phone,
        phoneNumbers: phoneNumbers.length ? phoneNumbers : fallback.phoneNumbers,
        whatsapp:
          preferredWhatsapp ||
          phoneNumbers[0] ||
          this.readString(record, ['company.phone']) ||
          fallback.whatsapp,
        whatsappNumbers: whatsappNumbers.length ? whatsappNumbers : fallback.whatsappNumbers,
        address: this.readString(record, ['company.address']) || fallback.address,
        logoUrl: this.readString(record, ['company.logo_url']) || fallback.logoUrl
      };
    }

    const getSettingValue = (keys: string[]): string | undefined => {
      if (Array.isArray(data)) {
        const items = data as PublicSettingItem[];
        for (const key of keys) {
          const item = items.find((entry) => entry?.key === key);
          const value = this.extractSettingValue(item);
          if (value) {
            return value;
          }
        }
      }

      if (data && typeof data === 'object') {
        const record = data as Record<string, unknown>;

        for (const key of keys) {
          const directValue = record[key];
          if (typeof directValue === 'string' && directValue.trim()) {
            return directValue.trim();
          }

          const nestedValue = this.extractSettingValue(directValue);
          if (nestedValue) {
            return nestedValue;
          }
        }
      }

      return undefined;
    };

    return {
      companyName:
        getSettingValue(['company.name', 'brand.name', 'site.name', 'app.name', 'company_name']) ||
        fallback.companyName,
      tagline:
        getSettingValue(['company.tagline', 'brand.tagline', 'site.tagline', 'support.tagline']) ||
        fallback.tagline,
      email:
        getSettingValue(['support.email', 'contact.email', 'customer_care.email', 'email']) ||
        fallback.email,
      additionalEmails: fallback.additionalEmails,
      phone:
        getSettingValue(['support.phone', 'contact.phone', 'customer_care.phone', 'phone']) ||
        fallback.phone,
      phoneNumbers: fallback.phoneNumbers,
      whatsapp:
        getSettingValue(['support.whatsapp', 'contact.whatsapp', 'whatsapp']) ||
        getSettingValue(['support.phone', 'contact.phone', 'customer_care.phone', 'phone']) ||
        fallback.whatsapp,
      whatsappNumbers: fallback.whatsappNumbers,
      address:
        getSettingValue(['company.address', 'contact.address', 'support.address', 'address']) ||
        fallback.address,
      logoUrl: fallback.logoUrl
    };
  }

  private readString(record: Record<string, unknown>, keys: string[]): string | undefined {
    for (const key of keys) {
      const value = record[key];
      if (typeof value === 'string' && value.trim()) {
        return value.trim();
      }

      const extractedValue = this.extractSettingValue(value);
      if (extractedValue) {
        return extractedValue;
      }
    }

    return undefined;
  }

  private readStringArray(record: Record<string, unknown>, keys: string[]): string[] {
    for (const key of keys) {
      const value = record[key];
      const extractedArray = this.extractSettingArray(value);
      if (extractedArray.length) {
        return extractedArray;
      }
    }

    return [];
  }

  private extractSettingValue(value: unknown): string | undefined {
    if (!value) {
      return undefined;
    }

    if (typeof value === 'string') {
      const trimmed = value.trim();
      return trimmed || undefined;
    }

    if (typeof value === 'object') {
      const record = value as Record<string, unknown>;
      const parsedValue = record['parsed_value'];
      if (typeof parsedValue === 'string' && parsedValue.trim()) {
        return parsedValue.trim();
      }

      const rawValue = record['value'];
      if (typeof rawValue === 'string' && rawValue.trim()) {
        return rawValue.trim();
      }
    }

    return undefined;
  }

  private extractSettingArray(value: unknown): string[] {
    if (Array.isArray(value)) {
      return value
        .filter((entry): entry is string => typeof entry === 'string')
        .map((entry) => entry.trim())
        .filter(Boolean);
    }

    if (value && typeof value === 'object') {
      const record = value as Record<string, unknown>;
      const parsedValue = record['parsed_value'];
      if (Array.isArray(parsedValue)) {
        return parsedValue
          .filter((entry): entry is string => typeof entry === 'string')
          .map((entry) => entry.trim())
          .filter(Boolean);
      }

      const rawValue = record['value'];
      if (Array.isArray(rawValue)) {
        return rawValue
          .filter((entry): entry is string => typeof entry === 'string')
          .map((entry) => entry.trim())
          .filter(Boolean);
      }
    }

    return [];
  }

  normalizePhoneForTel(phone: string): string {
    return phone.replace(/\s+/g, '');
  }

  normalizePhoneForWhatsapp(phone: string): string {
    return phone.replace(/[^\d]/g, '');
  }

  onLogoError(): void {
    this.showLogo = false;
  }

}
