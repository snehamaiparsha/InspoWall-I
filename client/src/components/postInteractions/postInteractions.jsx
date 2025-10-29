import Image from "../image/image";
import "./postInteractions.css";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiRequest from "../../utils/apiRequest";

const interact = async (id, type) => {
  const res = await apiRequest.post(`/pins/interact/${id}`, { type });
  return res.data;
};

const PostInteractions = ({ postId }) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ id, type }) => interact(id, type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["interactionCheck", postId] });
    },
  });

  const { isPending, error, data } = useQuery({
    queryKey: ["interactionCheck", postId],
    queryFn: () =>
      apiRequest
        .get(`/pins/interaction-check/${postId}`)
        .then((res) => res.data),
  });

  if (isPending || error) return null;

  return (
    <div className="postInteractions">
      {/* LEFT SIDE - LIKE / SHARE / MORE */}
      <div className="interactionGroup">
        <div
          className={`likeButton ${data.isLiked ? "liked" : ""}`}
          onClick={() => mutation.mutate({ id: postId, type: "like" })}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 6.00019C10.2006 3.90317 7.19377 3.2551 4.93923 5.17534C2.68468 7.09558 2.36727 10.3061 4.13778 12.5772C5.60984 14.4654 10.0648 18.4479 11.5249 19.7369C11.6882 19.8811 11.7699 19.9532 11.8652 19.9815C11.9483 20.0062 12.0393 20.0062 12.1225 19.9815C12.2178 19.9532 12.2994 19.8811 12.4628 19.7369C13.9229 18.4479 18.3778 14.4654 19.8499 12.5772C21.6204 10.3061 21.3417 7.07538 19.0484 5.17534C16.7551 3.2753 13.7994 3.90317 12 6.00019Z"
              stroke={data.isLiked ? "#ff6b81" : "#555"}
              strokeWidth="2"
              fill={data.isLiked ? "#ff6b81" : "none"}
            />
          </svg>
          <span className="likeCount">{data.likeCount}</span>
        </div>

        <div className="iconWrap">
          <Image path="/general/share.svg" alt="Share" />
        </div>
        <div className="iconWrap">
          <Image path="/general/more.svg" alt="More" />
        </div>
      </div>
      <button
        disabled={mutation.isPending}
        onClick={() => mutation.mutate({ id: postId, type: "save" })}
        className={`saveButton ${data.isSaved ? "saved" : ""}`}
      >
        {data.isSaved ? "Saved" : "Save"}
      </button>

      {/* RIGHT SIDE - SAVE BUTTON */}
    </div>
  );
};

export default PostInteractions;
