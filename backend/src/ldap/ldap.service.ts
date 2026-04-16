import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Client, SearchOptions } from 'ldapts';

// type LdapUserParams = {
//   uid: string;
//   cn: string;
//   displayName: string;
// };

@Injectable()
export class LdapService implements OnModuleInit, OnModuleDestroy {
  private readonly client: Client;
  private readonly bindDN: string;
  private readonly bindPassword: string;
  private readonly baseDN: string;
  private readonly logger = new Logger(LdapService.name);

  constructor() {
    const url = process.env.LDAP_URL;
    const bindDn = process.env.LDAP_BIND_DN;
    const bindPassword = process.env.LDAP_BIND_PASSWORD;
    const baseDn = process.env.LDAP_BASE_DN;

    if (!bindDn || !bindPassword || !baseDn) {
      throw new ServiceUnavailableException(
        'LDAP_BIND_DN, LDAP_BIND_PASSWORD and LDAP_BASE_DN must be set',
      );
    }

    this.bindDN = bindDn;
    this.bindPassword = bindPassword;
    this.baseDN = baseDn;

    this.client = new Client({
      url: url || 'ldap://localhost:389',
    });
  }

  async onModuleInit() {
    await this.client.bind(this.bindDN, this.bindPassword);
  }

  async onModuleDestroy() {
    await this.client.unbind();
  }

  private async getUsersBy<T extends 'uid' | 'cn'>(identifier: T, value: string) {
    const options: SearchOptions = {
      scope: 'sub',
      filter: `(&(${identifier}=${value})(objectClass=inetOrgPerson))`,
      attributes: ['uid', 'cn', 'sn', 'objectClass', 'mail'],
    };

    const { searchEntries } = await this.client.search(this.baseDN, options);
    return searchEntries;
  }

  async getUsersByUid(uid: string) {
    return this.getUsersBy('uid', uid);
  }

  async getUsersByCn(cn: string) {
    return this.getUsersBy('cn', cn);
  }

  private async getAllUsersGroups() {
    const options: SearchOptions = {
      scope: 'sub',
      filter: '(objectClass=groupOfNames)',
      attributes: ['cn', 'member'],
    };
    const { searchEntries } = await this.client.search(this.baseDN, options);
    return searchEntries;
  }

  private async getAllUsersAccounts() {
    const options: SearchOptions = {
      scope: 'sub',
      filter: '(objectClass=inetOrgPerson)',
      attributes: ['uid', 'cn', 'sn', 'objectClass'],
    };

    const { searchEntries } = await this.client.search(this.baseDN, options);
    return searchEntries;
  }
}
