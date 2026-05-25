import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client, SearchOptions } from 'ldapts';

interface LdapUserParams {
  objectClass: 'inetOrgPerson';
  uid: string;
  cn: string;
  sn: string;
  displayName: string;
  givenName: string;
  mail: string;
  userPassword: string;
}

interface LdapGroupParams {
  objectClass: 'groupOfNames';
  cn: string;
  member: string | string[];
}

interface LdapServiceParams {
  url: string;
  bindDN: string;
  bindPassword: string;
  userBaseDN: string;
  groupBaseDN: string;
}

@Injectable()
export class LdapService implements OnModuleInit, OnModuleDestroy {
  private readonly client: Client;
  private readonly ldapServiceParams: LdapServiceParams;
  private readonly logger = new Logger(LdapService.name);

  constructor(private readonly configService: ConfigService) {
    const url = configService.get<string>('LDAP_URL') || 'ldap://localhost:389';
    const bindDN = configService.get<string>('LDAP_BIND_DN') || 'ou=users';
    const bindPassword = configService.get<string>('LDAP_BIND_PASSWORD') || 'mse-ldap-password';
    const userBaseDN =
      configService.get<string>('LDAP_USER_BASE_DN') ||
      'ou=user-accounts,ou=test-zone,dc=moevm,dc=info';
    const groupBaseDN =
      configService.get<string>('LDAP_GROUP_BASE_DN') ||
      'ou=user-groups,ou=test-zone,dc=moevm,dc=info';

    this.ldapServiceParams = {
      url: url,
      bindDN: bindDN,
      bindPassword: bindPassword,
      userBaseDN: userBaseDN,
      groupBaseDN: groupBaseDN,
    };

    this.client = new Client({
      url: this.ldapServiceParams.url,
      timeout: 10000,
      connectTimeout: 5000,
      strictDN: true,
    });
  }

  /**
   * Находит пользователя в LDAP по заданному полю и его значению.
   * @param field Поле, по которому нужно искать пользователя (нап
   * @throws ServiceUnavailableException Если пользователь не найден или произошла ошибка при поиске в LDAP.
   * @param value Значение, которое нужно искать в указанном поле.
   * @returns Список пользователей, соответствующих заданному полю и его значению.
   */
  async findUserBy<T extends keyof Omit<LdapUserParams, 'userPassword' | 'objectClass'>>(
    field: T,
    value: string,
  ): Promise<LdapUserParams[]> {
    const searchOptions: SearchOptions = {
      scope: 'sub',
      filter: `(&(objectClass=inetOrgPerson)(${field}=${value}))`,
      attributes: ['uid', 'cn', 'sn', 'displayName', 'givenName', 'mail', 'userPassword'],
    };

    try {
      const { searchEntries } = await this.client.search(
        this.ldapServiceParams.userBaseDN,
        searchOptions,
      );
      if (searchEntries.length === 0) {
        throw new ServiceUnavailableException('User not found');
      }
      // Тип Entry не может в полной мере быть покрыт типом LdapUserParams.
      const user = searchEntries as unknown as LdapUserParams[];
      return user;
    } catch (error) {
      this.logger.error(`Error searching for user by ${field} in LDAP`, error);
      throw new ServiceUnavailableException(`Error searching for user by ${field} in LDAP`);
    }
  }

  /**
   * Проверяет, соответствует ли пароль пользователя, найденного по email, переданному паролю.
   * @param email Email пользователя, для которого нужно проверить пароль.
   * @param password Пароль, который нужно проверить.
   */
  async checkUserPassword(email: string, password: string): Promise<boolean> {
    try {
      // Предполагается, что email уникален, поэтому берем первого пользователя из массива.
      const [user] = await this.findUserBy('mail', email);
      return password == user.userPassword;
    } catch (error) {
      this.logger.error('Error checking user password in LDAP', error);
      throw new ServiceUnavailableException('Error checking user password in LDAP');
    }
  }

  /**
   * Находит группу в LDAP по заданному полю и его значению.
   * @param field Поле, по которому нужно искать группу (например, 'cn').
   * @param value Значение, которое нужно искать в указанном поле.
   * @returns Список групп, соответствующих заданному полю и его значению.
   */
  async findGroupBy<T extends keyof Omit<LdapGroupParams, 'objectClass'>>(
    field: T,
    value: string,
  ): Promise<LdapGroupParams[]> {
    const searchOptions: SearchOptions = {
      scope: 'sub',
      filter: `(&(objectClass=groupOfNames)(${field}=${value}))`,
      attributes: ['cn', 'member'],
    };
    try {
      const { searchEntries } = await this.client.search(
        this.ldapServiceParams.groupBaseDN,
        searchOptions,
      );
      // Тип Entry не может в полной мере быть покрыт типом LdapGroupParams.
      const groups = searchEntries as unknown as LdapGroupParams[];
      return groups;
    } catch (error) {
      this.logger.error(`Error searching for group by ${field} in LDAP`, error);
      throw new ServiceUnavailableException(`Error searching for group by ${field} in LDAP`);
    }
  }

  /**
   * Получает профиль пользователя вместе с названиями групп, в которых он состоит, по его email.
   * @param email Email пользователя, для которого нужно получить профиль и группы.
   * @returns Профиль пользователя с добавленным полем groups, содержащим массив названий групп, в которых состоит пользователь.
   */
  async getUserProfileWithGroups(email: string) {
    try {
      const [user] = await this.findUserBy('mail', email);

      const groups = await this.findGroupsByUserUID(user.uid);

      const groupNames = groups.map((group) => group.cn);

      return {
        ...user,
        groups: groupNames,
      };
    } catch (error) {
      this.logger.error(`Error fetching profile for ${email}`, error);
      throw new ServiceUnavailableException('Failed to fetch user profile with groups');
    }
  }

  /**
   * Находит группы (института), в которых состоит пользователь, по его UID.
   * @param uid UID пользователя, для которого нужно найти группы.
   * @returns Список групп, в которых состоит пользователь.
   */
  async findGroupsByUserUID(uid: string): Promise<LdapGroupParams[]> {
    const groups = await this.findGroupBy(
      'member',
      `uid=${uid},${this.ldapServiceParams.userBaseDN}`,
    );
    return groups;
  }

  /**
   * Проверяет, состоит ли пользователь в указанной группе.
   * @param uid UID пользователя
   * @param targetGroupCn Название группы для проверки
   */
  async isUserInGroup(uid: string, targetGroupCn: string): Promise<boolean> {
    try {
      const groups = await this.findGroupsByUserUID(uid);
      return groups.some((group) => group.cn === targetGroupCn);
    } catch (error) {
      this.logger.error(`Error checking if user ${uid} is in group ${targetGroupCn}`, error);
      return false; // В случае ошибки безопаснее вернуть false
    }
  }

  /**
   * Возвращает список всех пользователей (с их данными), состоящих в определенной группе.
   * @param groupCn Название группы (например, 'group-3341')
   */
  async getUsersByGroup(groupCn: string): Promise<LdapUserParams[]> {
    try {
      const [group] = await this.findGroupBy('cn', groupCn);
      if (!group || !group.member) {
        return [];
      }

      // Проверяем, является ли member массивом или строкой, и приводим к массиву.
      const members = Array.isArray(group.member) ? group.member : [group.member];

      const users: LdapUserParams[] = [];

      for (const memberDn of members) {
        // Вытаскиваем uid из строки вида 'uid=student1,ou=user-accounts,...'
        const uidMatch = memberDn.match(/uid=([^,]+)/);

        if (uidMatch && uidMatch[1]) {
          try {
            const [user] = await this.findUserBy('uid', uidMatch[1]);
            if (user) {
              users.push(user);
            }
          } catch {
            this.logger.warn(
              `Member ${memberDn} found in group ${groupCn}, but user account is missing.`,
            );
          }
        }
      }

      return users;
    } catch (error) {
      this.logger.error(`Error fetching users for group ${groupCn}`, error);
      throw new ServiceUnavailableException(`Error fetching users for group ${groupCn}`);
    }
  }

  async onModuleInit() {
    try {
      await this.client.bind(this.ldapServiceParams.bindDN, this.ldapServiceParams.bindPassword);
      this.logger.log('Successfully connected to LDAP server');
    } catch (error) {
      this.logger.error('Failed to connect to LDAP server', error);
      throw new ServiceUnavailableException('Failed to connect to LDAP server');
    }
  }

  async onModuleDestroy() {
    try {
      await this.client.unbind();
      this.logger.log('Successfully disconnected from LDAP server');
    } catch (error) {
      this.logger.error('Failed to disconnect from LDAP server', error);
    }
  }
}
