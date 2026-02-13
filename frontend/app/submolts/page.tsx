import { notFound } from 'next/navigation';

export default function SubmoltsPage() {
  // Match production behavior on https://moltbook-replica.vercel.app (currently 404)
  notFound();
}
