import {ReactTestInstance} from 'react-test-renderer';

// Fix missing interface properties for @testing-library/jest-native.
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeDisabled(): R;
      toContainElement(element: ReactTestInstance | null): R;
      toBeEmpty(): R;
      toHaveProp(attr: string, value?: any): R;
      toHaveTextContent(
        text: string | RegExp,
        options?: {normalizeWhitespace: boolean},
      ): R;
      toBeEnabled(): R;
      toHaveStyle(style: object[] | object): R;
    }
  }
}
