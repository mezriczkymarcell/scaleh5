import { isAdmin } from '@/lib/auth';
import Admin from './Admin';
import './admin.css';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Admin — Moodboard' };

export default async function AdminPage() {
  return <Admin initialAuthed={await isAdmin()} />;
}
