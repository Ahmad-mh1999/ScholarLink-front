import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('access_token');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Articles', 'User', 'Notifications', 'Stats', 'Categories', 'Points', 'Reviews'],
  endpoints: (builder) => ({
    getStats: builder.query({
      query: () => 'stats/platform/',
      providesTags: ['Stats'],
    }),
    getArticleBySlug: builder.query({
      query: (slug) => `articles/${slug}/`,
      providesTags: (result, error, slug) => [{ type: 'Articles', id: slug }],
    }),
    likeArticle: builder.mutation({
      query: (slug) => ({
        url: `articles/${slug}/like/`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, slug) => [{ type: 'Articles', id: slug }],
    }),
    bookmarkArticle: builder.mutation({
      query: (slug) => ({
        url: `articles/${slug}/bookmark/`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, slug) => [{ type: 'Articles', id: slug }],
    }),
    rateArticle: builder.mutation({
      query: ({ slug, rating }) => ({
        url: `articles/${slug}/rate/`,
        method: 'POST',
        body: { rating },
      }),
      invalidatesTags: (result, error, { slug }) => [{ type: 'Articles', id: slug }],
    }),
    getComments: builder.query({
      query: (slug) => `articles/${slug}/comments/`,
      providesTags: (result, error, slug) => [{ type: 'Articles', id: `${slug}-comments` }],
    }),
    postComment: builder.mutation({
      query: ({ slug, content, parentId }) => ({
        url: `articles/${slug}/comments/`,
        method: 'POST',
        body: { content, parent: parentId },
      }),
      invalidatesTags: (result, error, { slug }) => [{ type: 'Articles', id: `${slug}-comments` }],
    }),
    createArticle: builder.mutation({
      query: (formData) => ({
        url: 'articles/',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Articles', 'Stats'],
    }),
    getNotifications: builder.query({
      query: (params) => ({
        url: 'notifications/',
        params: params,
      }),
      providesTags: ['Notifications'],
    }),
    getUnreadNotificationsCount: builder.query({
      query: () => 'notifications/unread/',
      providesTags: ['Notifications'],
    }),
    markAllNotificationsRead: builder.mutation({
      query: () => ({
        url: 'notifications/mark-all-read/',
        method: 'POST',
      }),
      invalidatesTags: ['Notifications'],
    }),
    markNotificationRead: builder.mutation({
      query: (id) => ({
        url: `notifications/${id}/read/`,
        method: 'POST',
      }),
      invalidatesTags: ['Notifications'],
    }),
    getMyArticles: builder.query({
      query: (params) => ({
        url: 'articles/my/',
        params: params,
      }),
      providesTags: ['Articles'],
    }),
    deleteArticle: builder.mutation({
      query: (slug) => ({
        url: `articles/${slug}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Articles', 'Stats'],
    }),
    getReviewDashboard: builder.query({
      query: () => 'reviews/dashboard/',
      providesTags: ['Articles'],
    }),
    respondToReviewRequest: builder.mutation({
      query: ({ id, action }) => ({
        url: `reviews/${id}/respond/`,
        method: 'POST',
        body: { action }, // 'accept' or 'decline'
      }),
      invalidatesTags: ['Articles', 'Stats'],
    }),
    assignReviewer: builder.mutation({
      query: (slug) => ({
        url: `articles/${slug}/assign-reviewer/`,
        method: 'POST',
      }),
      invalidatesTags: ['Articles'],
    }),
    getCitation: builder.query({
      query: (slug) => `articles/${slug}/citation/`,
    }),
    getCategories: builder.query({
      query: () => 'categories/',
      providesTags: ['Categories'],
    }),
    getArticles: builder.query({
      query: (params) => ({
        url: 'articles/',
        params: params,
      }),
      providesTags: ['Articles'],
    }),
    getTrendingArticles: builder.query({
      query: () => 'articles/?ordering=-views_count',
      providesTags: ['Articles'],
    }),
    getRecommendedArticles: builder.query({
      query: () => 'stats/most-read/',
      providesTags: ['Articles'],
    }),
    getDrafts: builder.query({
      query: () => 'articles/my/',
      providesTags: ['Articles'],
    }),
    getPendingReviews: builder.query({
      query: (params) => ({
        url: 'reviews/pending/',
        params: params,
      }),
      providesTags: ['Articles'],
    }),
    getReviewerStats: builder.query({
      query: () => 'stats/reviewer/',
      providesTags: ['Stats'],
    }),
    getAdminStats: builder.query({
      query: () => 'admin/stats/',
      providesTags: ['Stats'],
    }),
    getAdminUsers: builder.query({
      query: () => 'admin/users/',
      providesTags: ['User'],
    }),
    updateAdminUser: builder.mutation({
      query: ({ id, ...updates }) => ({
        url: `admin/users/${id}/`,
        method: 'PATCH',
        body: updates,
      }),
      invalidatesTags: ['User'],
    }),
    getAdminArticles: builder.query({
      query: (params) => ({
        url: 'admin/articles/',
        params: params,
      }),
      providesTags: ['Articles'],
    }),
    moderateArticle: builder.mutation({
      query: ({ slug, status, feedback }) => ({
        url: `articles/${slug}/moderate/`,
        method: 'POST',
        body: { status, feedback },
      }),
      invalidatesTags: (result, error, { slug }) => [{ type: 'Articles', id: slug }, 'Articles', 'Stats'],
    }),
    deleteUser: builder.mutation({
      query: (id) => ({
        url: `admin/users/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['User', 'Stats'],
    }),
    getAdminCategories: builder.query({
      query: () => 'admin/categories/',
      providesTags: ['Categories'],
    }),
    getUserProfile: builder.query({
      query: (username) => username ? `users/${username}/` : 'users/me/',
      providesTags: ['User'],
    }),
    getBookmarks: builder.query({
      query: () => 'articles/bookmarks/',
      providesTags: ['Articles'],
    }),
    followUser: builder.mutation({
      query: (username) => ({
        url: `users/${username}/follow/`,
        method: 'POST',
      }),
      invalidatesTags: ['User'],
    }),
    updateProfile: builder.mutation({
      query: (formData) => ({
        url: 'users/me/',
        method: 'PATCH',
        body: formData,
      }),
      invalidatesTags: ['User'],
    }),
    updateArticle: builder.mutation({
      query: ({ slug, formData }) => ({
        url: `articles/${slug}/`,
        method: 'PATCH',
        body: formData,
      }),
      invalidatesTags: (result, error, { slug }) => [{ type: 'Articles', id: slug }, 'Articles', 'Stats'],
    }),
    getMyPoints: builder.query({
      query: () => 'points/my/',
      providesTags: ['Points'],
    }),
    getPointsTransactions: builder.query({
      query: (params) => ({ url: 'points/transactions/', params }),
      providesTags: ['Points'],
    }),
    getLeaderboard: builder.query({
      query: () => 'points/leaderboard/',
      providesTags: ['Points'],
    }),
    getArticlesByCategory: builder.query({
      query: () => 'stats/articles-by-category/',
      providesTags: ['Stats'],
    }),
    getMonthlyArticles: builder.query({
      query: () => 'stats/monthly-articles/',
      providesTags: ['Stats'],
    }),
    getTopAuthors: builder.query({
      query: () => 'stats/top-authors/',
      providesTags: ['Stats'],
    }),
    getMostRead: builder.query({
      query: (params) => ({ url: 'stats/most-read/', params }),
      providesTags: ['Stats'],
    }),
    submitReview: builder.mutation({
      query: ({ id, feedback, rating, decision, is_anonymous }) => ({
        url: `reviews/${id}/submit/`,
        method: 'POST',
        body: { feedback, rating, decision, is_anonymous },
      }),
      invalidatesTags: ['Articles', 'Reviews', 'Stats'],
    }),
    likeComment: builder.mutation({
      query: (pk) => ({
        url: `comments/${pk}/like/`,
        method: 'POST',
      }),
      invalidatesTags: ['Articles'],
    }),
    // Admin mutations
    activateUser: builder.mutation({
      query: (id) => ({
        url: `admin/users/${id}/activate/`,
        method: 'POST',
      }),
      invalidatesTags: ['User'],
    }),
    deactivateUser: builder.mutation({
      query: (id) => ({
        url: `admin/users/${id}/deactivate/`,
        method: 'POST',
      }),
      invalidatesTags: ['User'],
    }),
    verifyUser: builder.mutation({
      query: (id) => ({
        url: `admin/users/${id}/verify/`,
        method: 'POST',
      }),
      invalidatesTags: ['User'],
    }),
    suspendUser: builder.mutation({
      query: (id) => ({
        url: `admin/users/${id}/suspend/`,
        method: 'POST',
      }),
      invalidatesTags: ['User'],
    }),
    restoreUser: builder.mutation({
      query: (id) => ({
        url: `admin/users/${id}/restore/`,
        method: 'POST',
      }),
      invalidatesTags: ['User'],
    }),
    createCategory: builder.mutation({
      query: (data) => ({
        url: 'admin/categories/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Categories'],
    }),
    updateCategory: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `admin/categories/${id}/`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Categories'],
    }),
    deleteCategory: builder.mutation({
      query: (id) => ({
        url: `admin/categories/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Categories'],
    }),
    getCategoryDetail: builder.query({
      query: (slug) => `categories/${slug}/`,
      providesTags: ['Categories'],
    }),
    getReviewDetail: builder.query({
      query: (pk) => `reviews/${pk}/`,
      providesTags: ['Reviews'],
    }),
    sendNotification: builder.mutation({
      query: (data) => ({
        url: 'notifications/send/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Notifications'],
    }),
  }),
});

export const {
  useGetStatsQuery,
  useGetArticlesQuery,
  useGetArticleBySlugQuery,
  useLikeArticleMutation,
  useBookmarkArticleMutation,
  useRateArticleMutation,
  useGetCommentsQuery,
  usePostCommentMutation,
  useCreateArticleMutation,
  useGetMyArticlesQuery,
  useDeleteArticleMutation,
  useUpdateArticleMutation,
  useGetReviewDashboardQuery,
  useRespondToReviewRequestMutation,
  useAssignReviewerMutation,
  useGetNotificationsQuery,
  useGetUnreadNotificationsCountQuery,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
  useGetCitationQuery,
  useGetCategoriesQuery,
  useGetTrendingArticlesQuery,
  useGetRecommendedArticlesQuery,
  useGetDraftsQuery,
  useGetPendingReviewsQuery,
  useGetReviewerStatsQuery,
  useGetAdminStatsQuery,
  useGetAdminUsersQuery,
  useUpdateAdminUserMutation,
  useDeleteUserMutation,
  useGetAdminArticlesQuery,
  useModerateArticleMutation,
  useGetAdminCategoriesQuery,
  useGetUserProfileQuery,
  useGetBookmarksQuery,
  useFollowUserMutation,
  useUpdateProfileMutation,
  useGetMyPointsQuery,
  useGetPointsTransactionsQuery,
  useGetLeaderboardQuery,
  useGetArticlesByCategoryQuery,
  useGetMonthlyArticlesQuery,
  useGetTopAuthorsQuery,
  useGetMostReadQuery,
  useSubmitReviewMutation,
  useLikeCommentMutation,
  useGetCategoryDetailQuery,
  useGetReviewDetailQuery,
  useActivateUserMutation,
  useDeactivateUserMutation,
  useVerifyUserMutation,
  useSuspendUserMutation,
  useRestoreUserMutation,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useSendNotificationMutation,
} = baseApi;
