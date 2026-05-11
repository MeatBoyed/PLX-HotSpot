import { redirect } from 'next/navigation';

// Registration is now per-site — redirect to the root selector.
export default function RegisterPage() {
  redirect('/');
}
