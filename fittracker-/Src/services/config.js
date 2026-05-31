/**
 * API configuration — single source of truth.
 *
 * Change YOUR_LOCAL_IP below to your machine's LAN IP for physical device testing.
 *
 * Or set in fittracker-/.env:
 *   EXPO_PUBLIC_API_URL=http://YOUR_LOCAL_IP:5000/api
 *   EXPO_PUBLIC_PROJECT_ID=your-eas-project-id
 */

const DEV_API_HOST = "http://192.168.100.54:4000"; // Change to your machine LAN IP for device testing
const PROD_API_HOST = 'https://your-production-api.com';

const buildUrl = (host) => `${host.replace(/\/$/, '')}/api`;

export const API_URL =
  
  buildUrl(typeof __DEV__ !== 'undefined' && __DEV__ ? DEV_API_HOST : PROD_API_HOST);

export const UPLOADS_BASE = API_URL.replace(/\/api$/, '');
