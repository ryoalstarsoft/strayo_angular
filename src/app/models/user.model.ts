import * as ol from 'openlayers';

export interface IUser {
  authentication_token?: string;
  email: string;
  first_name: string;
  id?: number;
  industry: string;
  last_name: string;
  measurement_unit?: string;
  password?: string;
  password_confirmation?: string;
  type?: string;
}

export class User extends ol.Object {
  public address(): string;
  public address(address: string): this;
  public address(address?: string): string | this {
    if (address !== undefined) {
      this.set('address', address);
      return this;
    }
    return this.get('address');
  }
  public authenticationToken(): string;
  public authenticationToken(authenticationToken: string): this;
  public authenticationToken(authenticationToken?: string): string | this {
    if (authenticationToken !== undefined) {
      this.set('authentication_token', authenticationToken);
      return this;
    }
    return this.get('authentication_token');
  }
  public companyAddress(): string;
  public companyAddress(companyAddress: string): this;
  public companyAddress(companyAddress?: string): string | this {
    if (companyAddress !== undefined) {
      this.set('company_address', companyAddress);
      return this;
    }
    return this.get('company_address');
  }
  public email(): string;
  public email(email: string): this;
  public email(email?: string): string | this {
    if (email !== undefined) {
      this.set('email', email);
      return this;
    }
    return this.get('email');
  }

  public firstName(): string;
  public firstName(firstName: string): this;
  public firstName(firstName?: string): string | this {
    if (firstName !== undefined) {
      this.set('first_name', firstName);
      return this;
    }
    return this.get('first_name');
  }
  public id(): number;
  public id(id: number): this;
  public id(id?: number): number | this {
    if (id !== undefined) {
      this.set('id', id);
      return this;
    }
    return this.get('id');
  }
  public industry(): string;
  public industry(industry: string): this;
  public industry(industry?: string): string | this {
    if (industry !== undefined) {
      this.set('industry', industry);
      return this;
    }
    return this.get('industry');
  }

  public lastName(): string;
  public lastName(lastName: string): this;
  public lastName(lastName?: string): string | this {
    if (lastName !== undefined) {
      this.set('last_name', lastName);
      return this;
    }
    return this.get('last_name');
  }
  public measurementUnit(): string;
  public measurementUnit(measurementUnit: string): this;
  public measurementUnit(measurementUnit?: string): string | this {
    if (measurementUnit !== undefined) {
      this.set('measurement_unit', measurementUnit);
      return this;
    }
    return this.get('measurement_unit');
  }

  public name(): string;
  public name(name: string): this;
  public name(name?: string): string | this {
    if (name !== undefined) {
      this.set('name', name);
      return this;
    }
    return this.get('name');
  }

  public phone(): string;
  public phone(phone: string): this;
  public phone(phone?: string): string | this {
    if (phone !== undefined) {
      this.set('phone', phone);
      return this;
    }
    return this.get('phone');
  }

  public type(): string;
  public type(type: string): this;
  public type(type?: string): string | this {
    if (type !== undefined) {
      this.set('type', type);
      return this;
    }
    return this.get('type');
  }

  public website(): string;
  public website(website: string): this;
  public website(website?: string): string | this {
    if (website !== undefined) {
      this.set('website', website);
      return this;
    }
    return this.get('website');
  }
}