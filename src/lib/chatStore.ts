import { db } from './firebase';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  type CollectionReference,
  type DocumentReference,
  type DocumentData,
} from 'firebase/firestore';

export const conversationsCol = (uid: string): CollectionReference<DocumentData> =>
  collection(db, 'users', uid, 'conversations');
export const conversationDoc = (uid: string, conversationId: string): DocumentReference<DocumentData> =>
  doc(db, 'users', uid, 'conversations', conversationId);
export const messagesCol = (uid: string, conversationId: string): CollectionReference<DocumentData> =>
  collection(db, 'users', uid, 'conversations', conversationId, 'messages');

export async function createConversation(uid: string, title = 'New chat') {
  const convRef = await addDoc(conversationsCol(uid), {
    title,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    lastMessage: '',
    lastMessageAt: serverTimestamp(),
  });
  return convRef.id;
}

export async function renameConversation(uid: string, conversationId: string, title: string) {
  await updateDoc(conversationDoc(uid, conversationId), {
    title,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteConversation(uid: string, conversationId: string) {
  await deleteDoc(conversationDoc(uid, conversationId));
}

export async function sendMessage(
  uid: string,
  conversationId: string,
  role: 'user' | 'assistant',
  content: string,
  attachments?: any[] // base64 blobs preferred
) {
  const msgRef = await addDoc(messagesCol(uid, conversationId), {
    role,
    content,
    attachments: attachments ?? null,
    createdAt: serverTimestamp(),
  });
  await updateDoc(conversationDoc(uid, conversationId), {
    updatedAt: serverTimestamp(),
    lastMessage: content,
    lastMessageAt: serverTimestamp(),
  });
  return msgRef.id;
}

export function listenToConversations(uid: string, cb: (convs: any[]) => void) {
  const q = query(conversationsCol(uid), orderBy('updatedAt', 'desc'));
  return onSnapshot(q, (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
}

export function listenToMessages(uid: string, conversationId: string, cb: (msgs: any[]) => void) {
  const q = query(messagesCol(uid, conversationId), orderBy('createdAt', 'asc'));
  return onSnapshot(q, (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
}
