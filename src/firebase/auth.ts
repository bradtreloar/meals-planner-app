import auth from '@react-native-firebase/auth';
import {pick} from 'lodash';
import {User} from '@app/auth/types';

export function onAuthStateChanged(
  refreshUserCallback: (user: User | null) => void,
) {
  return auth().onAuthStateChanged(user => {
    refreshUserCallback(
      user
        ? pick(user, [
            'uid',
            'email',
            'displayName',
            'phoneNumber',
            'emailVerified',
          ])
        : null,
    );
  });
}

export async function login(email: string, password: string) {
  await auth().signInWithEmailAndPassword(email, password);
}

export async function logout() {
  await auth().signOut();
}

export async function forgotPassword(email: string) {
  // TODO
  email;
}

export async function setPassword(password: string) {
  // TODO
  password;
}

export async function resetPassword(
  email: string,
  token: string,
  password: string,
) {
  // TODO
  email;
  token;
  password;
}
