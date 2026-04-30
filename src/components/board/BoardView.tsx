'use client';

import { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Plus } from 'lucide-react';
import { usePosts } from '@/hooks/usePosts';
import { BOARD_COLUMNS, PostStatus, Post } from '@/types';
import PostCard from '@/components/ui/PostCard';
import PostModal from '@/components/ui/PostModal';

export default function BoardView() {
  const { posts, loading, updatePostStatus, createPost, updatePost, deletePost } = usePosts();
  const [showModal, setShowModal] = useState(false);
  const [modalStatus, setModalStatus] = useState<PostStatus>('ideation');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

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
      <DragDropContext onDragEnd={handleDragEnd}>
        {/* px-8 on the scroll container keeps equal padding on both sides even when overflowing */}
        <div className="-mx-8 flex gap-3 overflow-x-auto px-8 pb-6" style={{ minHeight: 'calc(100vh - 7rem)' }}>
          {BOARD_COLUMNS.map(col => {
            const colPosts = posts.filter(p => p.status === col.status);
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
                    className="rounded-md p-1 text-white/70 transition-colors hover:bg-white/20 hover:text-white"
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
    </>
  );
}
