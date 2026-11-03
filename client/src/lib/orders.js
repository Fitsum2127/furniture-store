// Keeps the secret access key of orders placed on this device, so the order page still works after a refresh.
const KEY = 'orderTokens';

export function saveOrderToken(number, token) {
  try {
    const map = JSON.parse(localStorage.getItem(KEY) || '{}');
    map[number] = token;
    localStorage.setItem(KEY, JSON.stringify(map));
  } catch (e) {
    /* ignore */
  }
}

export function getOrderToken(number) {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}')[number] || null;
  } catch (e) {
    return null;
  }
}