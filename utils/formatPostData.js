function formatPostData(posts, decoded) {
  let data = posts.map((post) => {
    const isMyPost = decoded
      ? post?.user?._id?.toString() === decoded.id
      : false;

    const hasLiked = post?.likes?.some((like) => like.userId == decoded.id);

    const totalLikes = post?.likes?.length || 0;

    const data = post.toObject();

    delete data.likes;

    return {
      ...data,
      isMyPost,
      likesData: {
        hasLiked,
        likesTotal: totalLikes,
      },
    };
  });

  data = data.map((post) => {
    const updatedComments = post.comments.map((comment) => {
      const isMyComment = decoded ? comment?.user?._id == decoded.id : false;

      return {
        ...comment,
        isMyComment,
      };
    });

    return {
      ...post,
      comments: updatedComments,
    };
  });

  return data;
}

module.exports = { formatPostData };
