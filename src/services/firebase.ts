import auth from '@react-native-firebase/auth';
import firebase from '@react-native-firebase/app';
import {pick} from 'lodash';
import {User} from '@app/types';

firebase.initializeApp({appId: '', projectId: ''});

export function currentUser() {
  const user = auth().currentUser;
  return user
    ? (pick(user, [
        'uid, email, displayName, phoneNumber, emailVerified',
      ]) as User)
    : null;
}

export async function login(email: string, password: string) {
  const {user} = await auth().signInWithEmailAndPassword(email, password);
  return pick(user, [
    'uid, email, displayName, phoneNumber, emailVerified',
  ]) as User;
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
