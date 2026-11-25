'use client';

import { useParams } from 'next/navigation';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function FillSpecificTemplatePage() {
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    if (params?.templateId) {
      router.replace(`/fill?template_id=${params.templateId}`);
    } else {
      router.replace('/fill');
    }
  }, [params, router]);

  return <LoadingSpinner message="Đang tải biểu mẫu..." />;
}
