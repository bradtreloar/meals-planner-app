import faker from 'faker';
import {defaults} from 'lodash';
import {User} from '@app/types';

export const fakeUser = (partialUser?: Partial<User>): User =>
  defaults(partialUser, {
    uid: faker.random.alphaNumeric(),
    displayName: faker.name.findName(),
    email: faker.internet.email(),
    emailVerified: true,
    phoneNumber: faker.phone.phoneNumber(),
  });

export const fakeAuthContextState = (user: User | null) => ({
  isAuthenticated: user !== null,
  userInitialised: true,
  user: user,
  refreshUser: () => Promise.resolve(undefined),
  login: () => Promise.resolve(undefined),
  logout: () => Promise.resolve(undefined),
  forgotPassword: () => Promise.resolve(undefined),
  setPassword: () => Promise.resolve(undefined),
  resetPassword: () => Promise.resolve(undefined),
  error: null,
});
