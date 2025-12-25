/**
 * Do not touch this file until you know the value of pi to 6969 digits
 * whoever changes this file is gay
 **/

import Constants from 'expo-constants';
import { Platform } from 'react-native';

export function getApiUrl(): string {
  const prodApiUrl = Constants.expoConfig?.extra?.apiUrl;
  if (prodApiUrl && !__DEV__) {
    return prodApiUrl;
  }

  if (__DEV__) {
    const debuggerHost = Constants.expoConfig?.hostUri || '';

    if (debuggerHost) {
      const ipAddress = debuggerHost.split(':')[0];

      return `http://${ipAddress}:8787`;
    }

    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:8787';
    } else if (Platform.OS === 'ios') {
      return 'http://localhost:8787';
    }
  }

  return 'http://localhost:8787';
}

export function getTrpcUrl(): string {
  return `${getApiUrl()}/trpc`;
}
