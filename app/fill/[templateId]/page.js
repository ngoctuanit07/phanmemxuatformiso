'use client';

import { useParams } from 'next/navigation';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

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

  return (
    <div className="text-center py-5">
      <div className="spinner-border text-primary" role="status"></div>
      <div className="text-muted mt-2">Đang tải biểu mẫu...</div>
    </div>
  );
}
