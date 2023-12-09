const getRepliesForEveryComment = (comments, replies) => {
  comments.forEach((comment) => {
    const filteredReplies = replies.filter((filterReply) => filterReply.commentId === comment.id)
      .map((reply) => {
        delete reply.commentId;
        return reply;
      });
    comment.replies = filteredReplies;
  });
  return comments;
};

module.exports = getRepliesForEveryComment;
