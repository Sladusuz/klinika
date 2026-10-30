// Dinamik adminlar: .env dagi ADMIN_CHAT_ID + botda /addadmin orqali qo'shilganlar (D1: 'admins')
import tg from './tg.js';
const { setExtraAdmins, envAdmins, admins } = tg;

export async function loadAdmins(st) {
  if (!st) return admins();
  try { setExtraAdmins((await st.get('admins')) || []); } catch (e) { /* env adminlari qoladi */ }
  return admins();
}
export async function addAdmin(st, id) {
  const list = ((await st.get('admins')) || []).map(String);
  if (envAdmins().includes(String(id)) || list.includes(String(id))) return false;
  list.push(String(id)); await st.set('admins', list); setExtraAdmins(list); return true;
}
export async function removeAdmin(st, id) {
  if (envAdmins().includes(String(id))) return 'env'; // asosiy adminni o'chirib bo'lmaydi
  const list = ((await st.get('admins')) || []).map(String);
  if (!list.includes(String(id))) return false;
  const next = list.filter(x => x !== String(id)); await st.set('admins', next); setExtraAdmins(next); return true;
}
export const isEnvAdmin = id => envAdmins().includes(String(id));
