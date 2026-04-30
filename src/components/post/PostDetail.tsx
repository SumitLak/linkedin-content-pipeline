'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Post, autoExcerpt } from '@/types';
import PostModal from '@/components/ui/PostModal';
import { ArrowLeft } from 'lucide-react';

export default function PostDetail({ postId }: { postId: string }) {
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPost = useCallback(async () => {
    const { data } = await supabase
      .from('posts')
      .select('*, analytics(*), profiles(*)')
      .eq('id', postId)
      .single();
    setPost(data);
    setLoading(false);
  }, [postId]);

  useEffect(() => { fetchPost(); }, [fetchPost]);

  async function handleSave(data: Partial<Post>): Promise<Post | null | undefined> {
    const { data: updated } = await supabase
      .from('posts').update(data).eq('id', postId)
      .select('*, analytics(*), profiles(*)').single();
    if (updated) setPost(updated);
    return updated;
  }

  async function handleDelete(id: string) {
    await supabase.from('posts').delete().eq('id', id);
    router.push('/library');
  }

  if (loading) return (
    <div className="flex h-96 items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
    </div>
  );

  if (!post) return <div className="py-20 text-center text-gray-400">Post not found.</div>;

  return (
    <div>
      <button onClick={() => router.back()} className="mb-4 flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>
      <PostModal
        post={post}
        onSave={handleSave}
        onDelete={handleDelete}
        onClose={() => router.back()}
      />
    </div>
  );
}
