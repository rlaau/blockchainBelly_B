"use client";

import { useState, useEffect } from "react";

type Comment = {
  text: string;
  createdAt: string;
  walletAddress: string; // 댓글 작성자 지갑 주소
};

export default function CommentSection({ coinId }: { coinId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  useEffect(() => {
    // 로컬스토리지에서 지갑 주소 확인
    const storedAddress = localStorage.getItem("walletAddress");
    if (storedAddress) {
      setWalletAddress(storedAddress);
    } else {
      setWalletAddress(null); // 지갑 주소가 없으면 null로 설정
    }

    // 댓글 로드
    const fetchComments = async () => {
      try {
        const response = await fetch(`/api/comments/${coinId}`);
        const data: Comment[] = await response.json();
        setComments(data);
      } catch (error) {
        console.error("Error fetching comments:", error);
      }
    };

    fetchComments();
  }, [coinId]);

  const handleAddComment = async () => {
    if (!walletAddress) {
      alert("Please connect your wallet to leave a comment.");
      return;
    }

    if (!newComment.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/comments/${coinId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: newComment, walletAddress }),
      });

      if (!response.ok) {
        throw new Error("Failed to add comment");
      }

      const savedComment: Comment = await response.json();
      setComments([...comments, savedComment]);
      setNewComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
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
          className="rounded-lg p-2 w-full bg-transparent border-2 border-gray-300"
          disabled={!walletAddress} // 지갑 없으면 입력 비활성화
        />
        <button
          onClick={() => {
            if (!walletAddress) {
              alert("Please connect your wallet to leave a comment.");
              return;
            }
            handleAddComment();
          }}
          className={`w-20 text-white rounded px-2 py-1 mt-2 ml-auto ${
            walletAddress
              ? "bg-gray-800 hover:bg-pink-600"
              : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          {loading ? "Adding..." : "Add"}
        </button>
      </div>
      <div>
        {comments.map((comment, index) => (
          <div key={index} className="border-b p-2">
            <p>{comment.text}</p>
            <small>
              {new Date(comment.createdAt).toLocaleString("en-US")} -{" "}
              <span className="text-blue-500">{comment.walletAddress}</span>
            </small>
          </div>
        ))}
      </div>
    </div>
  );
}
