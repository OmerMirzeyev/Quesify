import * as signalR from '@microsoft/signalr';
import { API_BASE_URL } from './api';

// Single shared connection to NotificationHub (backend/Hubs/NotificationHub.cs) — reused across
// the app instead of opening one per component, since only one login session is ever active.
let connection = null;

/**
 * Opens (or reuses) the real-time notification connection for the given JWT and starts
 * forwarding "ReceiveNotification" events — { type, message, timestamp } — to onNotification.
 */
export function connectNotificationHub(token, onNotification) {
  if (!token) return null;

  if (connection) {
    connection.off('ReceiveNotification');
    connection.on('ReceiveNotification', onNotification);
    return connection;
  }

  connection = new signalR.HubConnectionBuilder()
    .withUrl(`${API_BASE_URL}/hubs/notifications`, { accessTokenFactory: () => token })
    .withAutomaticReconnect()
    .configureLogging(signalR.LogLevel.Warning)
    .build();

  connection.on('ReceiveNotification', onNotification);
  connection.start().catch(() => {
    /* offline or backend unreachable — withAutomaticReconnect retries once connectivity returns */
  });

  return connection;
}

export function disconnectNotificationHub() {
  if (!connection) return;
  const toStop = connection;
  connection = null;
  toStop.stop().catch(() => { /* already closed */ });
}
