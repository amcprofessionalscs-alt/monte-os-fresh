'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function IgnitionRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace('/ignite'); }, [router]);
  return null;
}
