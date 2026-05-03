'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Post, PostStatus } from '@/types';
import { useProfile } from './useProfile';

export function usePosts() {
  const { activeProfile, isAllProfiles } = useProfile();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const autoMoveLive = useCallback(async (fetchedPosts: Post[]) => {
    const today = new Date().toISOString().split('T')[0];
    const toUpdate = fetchedPosts.filter(
      p => p.status === 'scheduled' && p.posting_date && p.posting_date <= today
    );
    if (toUpdate.length === 0) return;

    const ids = toUpdate.map(p => p.id);
    await supabase.from('posts').update({ status: 'live' }).in('id', ids);

    setPosts(prev =>
      prev.map(p => (ids.includes(p.id) ? { ...p, status: 'live' as PostStatus } : p))
    );
  }, []);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('posts')
      .select('*, analytics(*), profiles(*)')
      .order('posting_date', { ascending: false });

    if (!isAllProfiles && activeProfile) {
      query = query.eq('profile_id', activeProfile.id);
    }

    const { data } = await query;
    const fetched = data || [];
    setPosts(fetched);
    setLoading(false);
    await autoMoveLive(fetched);
  }, [activeProfile, isAllProfiles, autoMoveLive]);

  useEffect(() => {
    if (activeProfile || isAllProfiles) {
      fetchPosts();
    }
  }, [activeProfile, isAllProfiles, fetchPosts]);

  const updatePostStatus = async (postId: string, status: PostStatus) => {
    await supabase.from('posts').update({ status }).eq('id', postId);
    setPosts(prev => prev.map(p => (p.id === postId ? { ...p, status } : p)));
  };

  const createPost = async (post: Partial<Post>) => {
    const { data, error } = await supabase
      .from('posts')
      .insert(post)
      .select('*, analytics(*), profiles(*)')
      .single();
    if (error) console.error('createPost error:', error);
    if (data) setPosts(prev => [data, ...prev]);
    return data;
  };

  const bulkCreatePosts = async (posts: Partial<Post>[]) => {
    const { data, error } = await supabase
      .from('posts')
      .insert(posts)
      .select('*, analytics(*), profiles(*)');
    if (error) {
      console.error('bulkCreatePosts error:', error);
      return false;
    }
    if (data) setPosts(prev => [...data, ...prev]);
    return true;
  };

  const updatePost = async (id: string, updates: Partial<Post>) => {
    const { data } = await supabase
      .from('posts')
      .update(updates)
      .eq('id', id)
      .select('*, analytics(*), profiles(*)')
      .single();
    if (data) setPosts(prev => prev.map(p => (p.id === id ? data : p)));
    return data;
  };

  const deletePost = async (id: string) => {
    await supabase.from('posts').delete().eq('id', id);
    setPosts(prev => prev.filter(p => p.id !== id));
  };

  const addAnalytics = async (postId: string, entry: Record<string, unknown>) => {
    const { data } = await supabase
      .from('analytics')
      .insert({ post_id: postId, ...entry })
      .select()
      .single();
    if (data) {
      setPosts(prev =>
        prev.map(p =>
          p.id === postId ? { ...p, analytics: [...(p.analytics || []), data] } : p
        )
      );
    }
    return data;
  };

  return { posts, loading, fetchPosts, updatePostStatus, createPost, bulkCreatePosts, updatePost, deletePost, addAnalytics };
}
