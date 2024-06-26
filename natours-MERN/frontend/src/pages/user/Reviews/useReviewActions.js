import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createReview as createReviewAPI,
  updateReview as updateReviewAPI,
  deleteReview as deleteReviewAPI,
} from "../../../api/reviewApi";
import toast from "react-hot-toast";

export function useReviewActions() {
  const queryClient = useQueryClient();

  const createReviewMutation = useMutation({
    mutationFn: ({ rating, review, tourId }) =>
      createReviewAPI({ rating, review, tourId }),
    onSuccess: (review) => {
      if (review) {
        queryClient.setQueryData(["reviews"], (old) => [...old, review]);
        toast.success("You have created a review");
      }
    },
    onError: (err) => {
      console.log("ERROR", err);
      toast.error("Something went wrong");
    },
  });

  const updateReviewMutation = useMutation({
    mutationFn: ({ rating, review, reviewId }) =>
      updateReviewAPI({ rating, review, reviewId }),
    onSuccess: (updatedReview) => {
      if (updatedReview) {
        queryClient.setQueryData(["reviews"], (old) =>
          old.map((review) =>
            review.id === updatedReview.id ? updatedReview : review
          )
        );
        toast.success("Review updated successfully");
      }
    },
    onError: (err) => {
      console.log("ERROR", err);
      toast.error("Failed to update review");
    },
  });

  const deleteReviewMutation = useMutation({
    mutationFn: (reviewId) => deleteReviewAPI(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries(["reviews"]);
      toast.success("Review deleted successfully");
    },
    onError: (err) => {
      console.log("ERROR", err);
      toast.error("Failed to delete the review");
    },
  });

  return {
    createReview: createReviewMutation.mutate,
    isCreating: createReviewMutation.isLoading,
    updateReview: updateReviewMutation.mutate,
    isUpdating: updateReviewMutation.isLoading,
    deleteReview: deleteReviewMutation.mutate,
    isDeleting: deleteReviewMutation.isLoading,
  };
}
