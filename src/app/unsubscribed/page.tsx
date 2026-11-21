import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';

export default function UnsubscribedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="surface w-full max-w-md px-7 py-9 text-center">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#e6f2eb] text-success">
          <CheckCircle2 size={20} />
        </div>
        <h1 className="mt-5 text-[22px]">You have been unsubscribed</h1>
        <p className="muted mt-2">Your address has been added to the permanent opt-out list. You will not receive further campaign emails from us.</p>
        <Link href="/" className="mt-6 inline-block text-[13px] font-medium text-success underline underline-offset-2">Close this page</Link>
      </div>
    </main>
  );
}
