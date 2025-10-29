import GalleryItem from "../galleryItem/galleryItem";
import "./gallery.css";
import { useInfiniteQuery } from "@tanstack/react-query";
import InfiniteScroll from "react-infinite-scroll-component";
import axios from "axios";
import Skeleton from "../skeleton/skeleton";

// Reusable fetch function
const fetchPins = async ({ pageParam, search, userId, boardId, saved }) => {
  const baseUrl = import.meta.env.VITE_API_ENDPOINT;
  const endpoint = saved
    ? `${baseUrl}/pins/saved/${userId}?cursor=${pageParam || ""}`
    : `${baseUrl}/pins?cursor=${pageParam || ""}&search=${
        search || ""
      }&userId=${userId || ""}&boardId=${boardId || ""}`;

  const res = await axios.get(endpoint);
  return res.data;
};

const Gallery = ({ search, userId, boardId, saved = false }) => {
  const { data, fetchNextPage, hasNextPage, status } = useInfiniteQuery({
    queryKey: [saved ? "savedPins" : "pins", search, userId, boardId],
    queryFn: ({ pageParam = 0 }) =>
      fetchPins({ pageParam, search, userId, boardId, saved }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  if (status === "pending") return <Skeleton />;
  if (status === "error") return "Something went wrong...";

  const allPins = data?.pages.flatMap((page) => page.pins) || [];

  return (
    <InfiniteScroll
      dataLength={allPins.length}
      next={fetchNextPage}
      hasMore={!!hasNextPage}
      loader={<h4>Loading more pins...</h4>}
      endMessage={<h3>All Posts Loaded!</h3>}
    >
      <div className="gallery">
        {allPins?.map((item) => (
          <GalleryItem key={item._id} item={item} />
        ))}
      </div>
    </InfiniteScroll>
  );
};

export default Gallery;
