import EmojiPicker from "emoji-picker-react";
import { useState } from "react";
import { Send } from "lucide-react"; // nice icon
import apiRequest from "../../utils/apiRequest";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import "./commentForm.css";

const addComment = async (comment) => {
  const res = await apiRequest.post("/comments", comment);
  return res.data;
};

const CommentForm = ({ id }) => {
  const [open, setOpen] = useState(false);
  const [desc, setDesc] = useState("");

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: addComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", id] });
      setDesc("");
      setOpen(false);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!desc.trim()) return;
    mutation.mutate({
      description: desc,
      pin: id,
    });
  };

  const handleEmojiClick = (emoji) => {
    setDesc((prev) => prev + emoji.emoji);
  };

  return (
    <form className="commentForm" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Write a comment..."
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
      />

      <div className="commentActions">
        <button
          type="button"
          className="emojiBtn"
          onClick={() => setOpen((prev) => !prev)}
        >
          😊
        </button>
        {open && (
          <div className="emojiPicker">
            <EmojiPicker onEmojiClick={handleEmojiClick} theme="light" />
          </div>
        )}
        <button
          type="submit"
          className="sendBtn"
          disabled={!desc.trim() || mutation.isPending}
        >
          <Send size={18} />
        </button>
      </div>
    </form>
  );
};

export default CommentForm;
