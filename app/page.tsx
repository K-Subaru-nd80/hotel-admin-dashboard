import { redirect } from 'next/navigation';

export default function Page() {
  // Server-side redirect to the dashboard to handle workspace where both
  // `app/` and `src/app/` exist and root page may be missing in `app/`.
  redirect('/dashboard');
}
