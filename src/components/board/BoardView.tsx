'use client';

import { useState, useMemo } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Plus, X } from 'lucide-react';
import { usePosts } from '@/hooks/usePosts';
import { useProfile } from '@/hooks/useProfile';
import { BOARD_COLUMNS, PostStatus, Post } from '@/types';
import PostCard from '@/components/ui/PostCard';
import PostModal from '@/components/ui/PostModal';
import BoardImportModal from './BoardImportModal';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const FULL_MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export default function BoardView() {
  const { posts, loading, updatePostStatus, createPost, bulkCreatePosts, updatePost, deletePost, fetchPosts } = usePosts();
  const { activeProfile } = useProfile();
  const [showModal, setShowModal] = useState(false);
  const [modalStatus, setModalStatus] = useState<PostStatus>('ideation');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [showImport, setShowImport] = useState(false);

  // Filter state — default to current month/year
  const now = new Date();
  const [filterYear, setFilterYear]   = useState<number | null>(now.getFullYear());
  const [filterMonth, setFilterMonth] = useState<number | null>(now.getMonth()); // 0-indexed

  // Derive available years from posts
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    posts.forEach(p => { if (p.posting_date) years.add(new Date(p.posting_date).getFullYear()); });
    const currentYear = now.getFullYear();
    years.add(currentYear);
    years.add(currentYear + 1);
    return Array.from(years).sort((a, b) => a - b);
  }, [posts]);

  // Filtered posts
  const filteredPosts = useMemo(() => {
    return posts.filter(p => {
      if (!p.posting_date) {
        // Posts with no date only show when no filter is active
        return filterYear === null && filterMonth === null;
      }
      const d = new Date(p.posting_date);
      if (filterYear  !== null && d.getFullYear() !== filterYear)  return false;
      if (filterMonth !== null && d.getMonth()    !== filterMonth) return false;
      return true;
    });
  }, [posts, filterYear, filterMonth]);

  const hasFilter = filterYear !== null || filterMonth !== null;

  function prevMonth() {
    if (filterMonth === null || filterYear === null) return;
    if (filterMonth === 0) { setFilterMonth(11); setFilterYear(y => (y ?? now.getFullYear()) - 1); }
    else setFilterMonth(m => (m ?? 0) - 1);
  }
  function nextMonth() {
    if (filterMonth === null || filterYear === null) return;
    if (filterMonth === 11) { setFilterMonth(0); setFilterYear(y => (y ?? now.getFullYear()) + 1); }
    else setFilterMonth(m => (m ?? 0) + 1);
  }

  function handleDragEnd(result: DropResult) {
    if (!result.destination) return;
    const newStatus = result.destination.droppableId as PostStatus;
    if (newStatus !== result.source.droppableId) {
      updatePostStatus(result.draggableId, newStatus);
    }
  }

  function openCreate(status: PostStatus) {
    setSelectedPost(null);
    setModalStatus(status);
    setShowModal(true);
  }

  function openEdit(post: Post) {
    setSelectedPost(post);
    setShowModal(true);
  }

  async function handleSave(data: Partial<Post>): Promise<Post | null | undefined> {
    let result;
    if (selectedPost) {
      result = await updatePost(selectedPost.id, data);
    } else {
      result = await createPost(data);
    }
    setShowModal(false);
    setSelectedPost(null);
    return result;
  }

  async function handleDelete(id: string) {
    await deletePost(id);
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <>
      {/* Toolbar */}
      <div className="mb-4 flex items-center gap-2 flex-wrap">

        {/* Month dropdown */}
        <select
          value={filterMonth ?? ''}
          onChange={e => setFilterMonth(e.target.value === '' ? null : Number(e.target.value))}
          className="rounded-xl border-2 border-gray-200 bg-white px-3 py-2.5 text-sm font-medium text-gray-700 focus:border-blue-400 focus:outline-none hover:border-blue-200 transition-colors"
        >
          <option value="">All Months</option>
          {FULL_MONTHS.map((m, i) => (
            <option key={m} value={i}>{m}</option>
          ))}
        </select>

        {/* Year dropdown */}
        <select
          value={filterYear ?? ''}
          onChange={e => setFilterYear(e.target.value === '' ? null : Number(e.target.value))}
          className="rounded-xl border-2 border-gray-200 bg-white px-3 py-2.5 text-sm font-medium text-gray-700 focus:border-blue-400 focus:outline-none hover:border-blue-200 transition-colors"
        >
          <option value="">All Years</option>
          {availableYears.map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>

        {/* Post count + clear */}
        {hasFilter && (
          <>
            <span className="text-sm text-gray-400">{filteredPosts.length} posts</span>
            <button
              onClick={() => { setFilterYear(null); setFilterMonth(null); }}
              className="flex items-center gap-1 rounded-xl border-2 border-gray-200 px-3 py-2 text-xs font-medium text-gray-500 hover:border-red-200 hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <X className="h-3.5 w-3.5" /> Clear
            </button>
          </>
        )}

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => setShowImport(true)}
            className="flex items-center gap-2 rounded-xl border-2 border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" /> Paste List
          </button>
          <button
            onClick={() => openCreate('ideation')}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-200 hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" /> New Post
          </button>
        </div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        {/* px-8 on the scroll container keeps equal padding on both sides even when overflowing */}
        <div className="-mx-8 flex gap-3 overflow-x-auto px-8 pb-6" style={{ minHeight: 'calc(100vh - 7rem)' }}>
          {BOARD_COLUMNS.map(col => {
            const colPosts = filteredPosts.filter(p => p.status === col.status);
            return (
              <div
                key={col.status}
                className={`flex w-72 min-w-[288px] flex-col overflow-hidden rounded-2xl shadow-sm ${col.colBg}`}
              >
                {/* Column header — solid colour */}
                <div className={`flex items-center justify-between px-4 py-3 ${col.headerBg}`}>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-widest">{col.label}</span>
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/25 text-[10px] font-bold">
                      {colPosts.length}
                    </span>
                  </div>
                  <button
                    onClick={() => openCreate(col.status)}
                    className="rounded-md p-1 opacity-50 transition-colors hover:bg-black/10 hover:opacity-100"
                    title={`Add to ${col.label}`}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                {/* Cards */}
                <Droppable droppableId={col.status}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-1 space-y-2.5 px-2.5 pt-3 pb-3 transition-colors ${snapshot.isDraggingOver ? 'bg-white/30' : ''}`}
                      style={{ minHeight: 80 }}
                    >
                      {colPosts.length === 0 && !snapshot.isDraggingOver && (
                        <p className="mt-4 text-center text-[11px] text-gray-400 italic">{col.emptyText}</p>
                      )}
                      {colPosts.map((post, index) => (
                        <Draggable key={post.id} draggableId={post.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              <PostCard
                                post={post}
                                isDragging={snapshot.isDragging}
                                onClick={openEdit}
                              />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>

      {showModal && (
        <PostModal
          post={selectedPost}
          initialStatus={modalStatus}
          onSave={handleSave}
          onDelete={selectedPost ? handleDelete : undefined}
          onClose={() => { setShowModal(false); setSelectedPost(null); }}
        />
      )}

      {showImport && (
        <BoardImportModal
          onImport={async (rows) => {
            const postsToInsert = rows.map(row => ({
              ...row,
              profile_id: activeProfile?.id,
            }));
            const ok = await bulkCreatePosts(postsToInsert);
            if (ok) {
              await fetchPosts();
              setShowImport(false);
            }
          }}
          onClose={() => setShowImport(false)}
        />
      )}
    </>
  );
}
