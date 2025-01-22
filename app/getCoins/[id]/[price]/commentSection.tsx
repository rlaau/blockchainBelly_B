'use client';

import { useState, useEffect } from 'react';

type Comment = {
    text: string;
    createdAt: string;
};

export default function CommentSection({ coinId }: { coinId: string }) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(false);

    // 댓글 로드
    useEffect(() => {
        const fetchComments = async () => {
            try {
                const response = await fetch(`/api/comments/${coinId}`);
                const data: Comment[] = await response.json();
                setComments(data);
            } catch (error) {
                console.error('Error fetching comments:', error);
            }
        };

        fetchComments();
    }, [coinId]);

    // 댓글 추가
    const handleAddComment = async () => {
        if (!newComment.trim()) return;

        setLoading(true);
        try {
            const response = await fetch(`/api/comments/${coinId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text: newComment }),
            });

            if (!response.ok) {
                throw new Error('Failed to add comment');
            }

            const savedComment: Comment = await response.json();
            setComments([...comments, savedComment]);
            setNewComment('');
        } catch (error) {
            console.error('Error adding comment:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mt-8">
            <h2 className="text-xl font-bold">Comments</h2>
            <div className="my-4 flex flex-col">
                <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    className="rounded-lg p-2 w-full bg-transparent border-2 border border-gray-300"
                />
                <button
                    onClick={handleAddComment}
                    disabled={loading}
                    className="bg-gray-800 hover:bg-pink-600 w-20 text-white rounded px-2 py-1 mt-2 ml-auto"
                >
                    {loading ? 'Adding...' : 'Add'}
                </button>
            </div>
            <div>
                {comments.map((comment, index) => (
                    <div key={index} className="border-b p-2">
                        <p>{comment.text}</p>
                        <small>{new Date(comment.createdAt).toLocaleString()}</small>
                    </div>
                ))}
            </div>
        </div>
    );
}
