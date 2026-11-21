import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';

const labels: Record<string, string> = {
  interested: 'Interested',
  not_interested: 'Not interested',
  request_call: 'Request a call'
};

export default async function RespondedPage({ searchParams }: { searchParams: Promise<{ r?: string }> }) {
  const { r } = await searchParams;
  const label = r ? labels[r] ?? 'Your response' : 'Your response';
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="surface w-full max-w-md px-7 py-9 text-center">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#e6f2eb] text-success">
          <CheckCircle2 size={20} />
        </div>
        <h1 className="mt-5 text-[22px]">Response recorded</h1>
        <p className="muted mt-2">Thank you. We noted your response ({label}) and the sales team will follow up where needed.</p>
        {r === 'request_call' && <p className="muted mt-3">Your request has been added to the pending follow-up list.</p>}
        <Link href="/" className="mt-6 inline-block text-[13px] font-medium text-success underline underline-offset-2">Close this page</Link>
      </div>
    </main>
  );
}
