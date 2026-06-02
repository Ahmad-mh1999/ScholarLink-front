import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useGetAdminUsersQuery,
  useGetAdminArticlesQuery,
  useUpdateArticleMutation,
  useDeleteArticleMutation,
  useGetJournalsQuery,
  useCreateJournalMutation,
  useUpdateJournalMutation,
  useDeleteJournalMutation,
  useSendNotificationMutation,
  useNominateJournalMutation,
} from '../api/baseApi';


const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('users');
  const [selectedUser, setSelectedUser] = useState(null);

  // Users
  const {
    data: usersData,
    isLoading: usersLoading,
    isError: usersError,
    refetch: refetchUsers,
  } = useGetAdminUsersQuery();

  const usersArray = useMemo(
    () =>
      (Array.isArray(usersData) ? usersData : usersData?.results || usersData?.data || []),
    [usersData]
  );

  // Articles
  const {
    data: articlesData,
    isLoading: articlesLoading,
    isError: articlesError,
    refetch: refetchArticles,
  } = useGetAdminArticlesQuery();

  const articlesArray = useMemo(
    () =>
      (Array.isArray(articlesData)
        ? articlesData
        : articlesData?.results || articlesData?.data || []),
    [articlesData]
  );

  const [updateArticle] = useUpdateArticleMutation();
  const [deleteArticle] = useDeleteArticleMutation();
  const [nominateJournal] = useNominateJournalMutation();
  const [nominateModal, setNominateModal] = useState({ open: false, article: null });

  // Journals
  const {
    data: journalsData,
    isLoading: journalsLoading,
    isError: journalsError,
    error: journalsErrorDetails,
    refetch: refetchJournals,
  } = useGetJournalsQuery();

  const journalsArray = useMemo(
    () =>
      (Array.isArray(journalsData)
        ? journalsData
        : journalsData?.results || journalsData?.data || []),
    [journalsData]
  );

  const [journalsFetchErrorMessage, setJournalsFetchErrorMessage] = useState(null);

  useEffect(() => {
    if (journalsError && journalsErrorDetails) {
      console.error('🚨 [JOURNAL FETCH ERROR STATUS]:', journalsErrorDetails?.status);
      console.error(
        '🚨 [JOURNAL FETCH ERROR DATA]:',
        JSON.stringify(journalsErrorDetails?.data, null, 2)
      );
      setJournalsFetchErrorMessage(
        journalsErrorDetails?.data?.detail ||
          journalsErrorDetails?.data?.message ||
          `Failed to load journals (HTTP ${journalsErrorDetails?.status || 'Unknown'}).`
      );
    }
  }, [journalsError, journalsErrorDetails]);

  // Journals
  const [showJournalForm, setShowJournalForm] = useState(false);
  const [newJournal, setNewJournal] = useState({
    name: '',
    field_of_study: '',
    impact_factor: '',
    publication_type: 'open_access',
    publication_fee: '',
    font_guidelines: '',
    margin_guidelines: '',
    figure_guidelines: '',
  });

  const [createJournal, createJournalState] = useCreateJournalMutation();

  // Nominate journal (still not implemented)
  const [updateJournal, updateJournalState] = useUpdateJournalMutation();
  const [deleteJournal, deleteJournalState] = useDeleteJournalMutation();

  const [nominationForm, setNominationForm] = useState({

    articleSlug: '',
    journalId: '',
  });

  // Notifications
  const [targetType, setTargetType] = useState('all'); // 'all' | 'specific'
  const [selectedUserId, setSelectedUserId] = useState('');
  const [notificationTitle, setNotificationTitle] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');

  const [sendNotification, sendNotificationState] = useSendNotificationMutation();

  const [approveSubsidyError, setApproveSubsidyError] = useState(null);
  const [approvingSlug, setApprovingSlug] = useState(null);

  const handleApproveSubsidy = async (slug) => {
    setApproveSubsidyError(null);
    setApprovingSlug(slug);
    try {
      await updateArticle({
        slug,
        formData: { subsidy_status: 'approved' },
      }).unwrap();
      refetchArticles();
    } catch (error) {
      console.error(error);
      const message =
        error?.data?.detail ||
        error?.data?.message ||
        error?.error ||
        `Failed to approve subsidy for ${slug}.`;
      setApproveSubsidyError(message);
    } finally {
      setApprovingSlug(null);
    }
  };

  const handleDeleteArticle = async (slug) => {
    if (!window.confirm('Delete this manuscript?')) return;

    try {
      await deleteArticle(slug).unwrap();
      refetchArticles();
      window.alert('Manuscript deleted successfully.');
    } catch (error) {
      console.error(error);
      window.alert('Failed to delete manuscript. Please try again.');
    }
  };

  const handleAddJournal = async (e) => {
    e.preventDefault();

    try {
      await createJournal({
        name: newJournal.name.trim(),
        field_of_study: newJournal.field_of_study.trim(),
        impact_factor: newJournal.impact_factor,
        publication_type: newJournal.publication_type,
        publication_fee: newJournal.publication_fee || 0,
        font_guidelines: newJournal.font_guidelines || '',
        margin_guidelines: newJournal.margin_guidelines || '',
        figure_guidelines: newJournal.figure_guidelines || '',
      }).unwrap();

      window.alert('Journal created successfully.');
      setShowJournalForm(false);
      setNewJournal({
        name: '',
        field_of_study: '',
        impact_factor: '',
        publication_type: 'open_access',
        publication_fee: '',
        font_guidelines: '',
        margin_guidelines: '',
        figure_guidelines: '',
      });

      refetchJournals();
    } catch (error) {
      console.error(error);
      window.alert(
        error?.data?.message ||
          error?.data?.detail ||
          error?.error ||
          'Failed to create journal. Please try again.'
      );
    }
  };


  const handleDeleteJournal = async (id) => {
    if (!window.confirm('Delete this journal?')) return;

    try {
      await deleteJournal(id).unwrap();
      window.alert('Journal deleted successfully.');
      refetchJournals();
    } catch (error) {
      console.error(error);
      window.alert(
        error?.data?.message ||
          error?.data?.detail ||
          error?.error ||
          'Failed to delete journal. Please try again.'
      );
    }
  };

  const handleSendNotification = async (e) => {
    e.preventDefault();

    const payload = {
      title: notificationTitle,
      message: notificationMessage,
      send_to_all: targetType === 'all',
      user_id: targetType === 'specific' ? selectedUserId : null,
    };

    try {
      await sendNotification(payload).unwrap();
      window.alert('Notification sent successfully.');
      setNotificationTitle('');
      setNotificationMessage('');
      setSelectedUserId('');
    } catch (error) {
      console.error(error);
      window.alert('Failed to send notification. Please try again.');
    }
  };

  const handleNominateJournal = async (article, journalId) => {
    try {
      await nominateJournal({ slug: article.slug, journal_id: journalId }).unwrap();
      window.alert('Journal nominated successfully.');
      setNominateModal({ open: false, article: null });
      refetchArticles();
    } catch (error) {
      console.error(error);
      window.alert('Failed to nominate journal. Please try again.');
    }
  };

  const handleUpdateUserRole = async (userId, newRole) => {
    try {
      // Use the UserUpdateView endpoint
      await fetch(`/api/v1/admin/users/${userId}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      });
      window.alert('User role updated successfully.');
      refetchUsers();
    } catch (error) {
      console.error(error);
      window.alert('Failed to update user role. Please try again.');
    }
  };

  const subtitleText = useMemo(() => {
    switch (activeTab) {
      case 'users':
        return 'Users Management';
      case 'articles':
        return 'Manuscripts & Data';
      case 'journals':
        return 'Academic Journals';
      case 'recommendations':
        return 'Nominate Journal';
      case 'notifications':
        return 'Notifications System';
      default:
        return 'Dashboard';
    }
  }, [activeTab]);

  const resetUserSelection = () => setSelectedUser(null);

  return (
    <div className="flex h-screen bg-zinc-100 text-slate-800 font-sans antialiased">
      {/* Sidebar */}
      <aside className="w-72 bg-slate-900 text-slate-100 flex flex-col shadow-xl">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <span className="text-lg font-bold tracking-wide text-indigo-300">Super Admin</span>
          <span className="w-9 h-9 rounded-xl bg-slate-800 text-indigo-200 flex items-center justify-center text-sm font-bold">SA</span>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <button
            onClick={() => {
              setActiveTab('users');
              resetUserSelection();
            }}
            className={`w-full flex items-center px-4 py-3 text-sm font-semibold rounded-xl transition ${
              activeTab === 'users'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-300 hover:bg-slate-800 hover:text-slate-100'
            }`}
          >
            Users Management
          </button>

          <button
            onClick={() => {
              setActiveTab('articles');
              resetUserSelection();
            }}
            className={`w-full flex items-center px-4 py-3 text-sm font-semibold rounded-xl transition ${
              activeTab === 'articles'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-300 hover:bg-slate-800 hover:text-slate-100'
            }`}
          >
            Manuscripts &amp; Data
          </button>

          <button
            onClick={() => {
              setActiveTab('journals');
              resetUserSelection();
            }}
            className={`w-full flex items-center px-4 py-3 text-sm font-semibold rounded-xl transition ${
              activeTab === 'journals'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-300 hover:bg-slate-800 hover:text-slate-100'
            }`}
          >
            Academic Journals
          </button>

          <button
            onClick={() => {
              setActiveTab('recommendations');
              resetUserSelection();
            }}
            className={`w-full flex items-center px-4 py-3 text-sm font-semibold rounded-xl transition ${
              activeTab === 'recommendations'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-300 hover:bg-slate-800 hover:text-slate-100'
            }`}
          >
            Nominate Journal
          </button>

          <button
            onClick={() => {
              setActiveTab('notifications');
              resetUserSelection();
            }}
            className={`w-full flex items-center px-4 py-3 text-sm font-semibold rounded-xl transition ${
              activeTab === 'notifications'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-300 hover:bg-slate-800 hover:text-slate-100'
            }`}
          >
            Notifications System
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button
            onClick={() => navigate('/')}
            className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 py-2 px-4 rounded-lg text-xs transition font-semibold text-center"
          >
            Exit Dashboard
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-zinc-200 h-16 flex items-center justify-between px-8">
          <div>
            <div className="text-xs font-semibold text-indigo-700 uppercase tracking-wider">Super Administration</div>
            <h1 className="text-xl font-bold text-slate-900">{subtitleText}</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-3 rounded-xl bg-zinc-100 px-4 py-2">
              <span className="text-sm font-semibold text-slate-600">Realtime Sync</span>
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {/* TAB 1: Users */}
          {activeTab === 'users' && (
            <section className="space-y-6">
              {!selectedUser ? (
                <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
                  <div className="p-6 border-b border-zinc-200 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-slate-900">Registered Users</h2>
                    <button
                      className="text-sm font-semibold text-indigo-700 hover:text-indigo-800"
                      onClick={() => refetchUsers()}
                      disabled={usersLoading}
                    >
                      {usersLoading ? 'Refreshing…' : 'Refresh'}
                    </button>
                  </div>

                  {usersError ? (
                    <div className="p-6">
                      <p className="text-sm text-rose-700 font-semibold">
                        Failed to load users.
                      </p>
                    </div>
                  ) : (
                    <div className="p-2">
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-zinc-50 border-b text-zinc-600 text-xs font-semibold uppercase">
                          <tr>
                            <th className="p-4">Username</th>
                            <th className="p-4">Email</th>
                            <th className="p-4">Institution</th>
                            <th className="p-4">Role</th>
                            <th className="p-4">Points</th>
                            <th className="p-4 text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="text-sm text-slate-700 divide-y">
                          {(usersArray || []).map((u) => (
                            <tr key={u?.id ?? u?.username} className="hover:bg-zinc-50">
                              <td className="p-4 font-semibold text-slate-900">{u?.username || '—'}</td>
                              <td className="p-4">{u?.email || '—'}</td>
                              <td className="p-4">{u?.institution || '—'}</td>
                              <td className="p-4">
                                <span
                                  className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                    u?.role === 'admin'
                                      ? 'bg-indigo-100 text-indigo-800'
                                      : u?.role === 'reviewer'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-zinc-100 text-zinc-600'
                                  }`}
                                >
                                  {u?.role || 'user'}
                                </span>
                              </td>
                              <td className="p-4 font-semibold text-indigo-700">{u?.points?.total || 0}</td>
                              <td className="p-4 text-center">
                                <button
                                  onClick={() => setSelectedUser(u)}
                                  className="text-indigo-700 hover:text-indigo-900 font-semibold"
                                >
                                  View Full Profile
                                </button>
                              </td>
                            </tr>
                          ))}

                          {!usersLoading && (usersArray || []).length === 0 && (
                            <tr>
                              <td colSpan={6} className="p-6 text-center text-sm text-zinc-500">
                                No users found.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-6 max-w-3xl">
                  <div className="flex justify-between items-start border-b border-zinc-200 pb-4 mb-6">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">
                        {selectedUser?.first_name || '—'} {selectedUser?.last_name || ''}
                      </h2>
                      <p className="text-sm text-zinc-500">@{selectedUser?.username || '—'}</p>
                    </div>
                    <button
                      onClick={() => setSelectedUser(null)}
                      className="text-sm font-semibold text-indigo-700 hover:text-indigo-800"
                    >
                      Back to List
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-4 mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm flex-1">
                      <div>
                        <div className="text-xs text-zinc-500 font-semibold uppercase">Institution</div>
                        <div className="font-semibold text-slate-800">{selectedUser?.institution || '—'}</div>
                      </div>
                      <div>
                        <div className="text-xs text-zinc-500 font-semibold uppercase">Email</div>
                        <div className="font-semibold text-slate-800">{selectedUser?.email || '—'}</div>
                      </div>
                      <div>
                        <div className="text-xs text-zinc-500 font-semibold uppercase">Field of Study</div>
                        <div className="font-semibold text-slate-800">
                          {selectedUser?.field_of_study || selectedUser?.academic_field || '—'}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-zinc-500 font-semibold uppercase">Academic Status</div>
                        <div className="font-semibold text-slate-800">
                          {selectedUser?.academic_status || '—'}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-zinc-500 font-semibold uppercase">Account State</div>
                        <div className="font-semibold">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                              selectedUser?.is_active
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {selectedUser?.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-zinc-500 font-semibold uppercase">System Role</div>
                        <div className="flex items-center gap-2">
                          <select
                            value={selectedUser?.role || 'user'}
                            onChange={(e) => handleUpdateUserRole(selectedUser?.id, e.target.value)}
                            className="px-3 py-1.5 border border-zinc-200 rounded-lg text-sm font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200"
                          >
                            <option value="user">User</option>
                            <option value="reviewer">Reviewer</option>
                            <option value="admin">Admin</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0">
                      <div className="text-xs text-zinc-500 font-semibold uppercase mb-1 text-right">Total Academic Points</div>
                      <div className="inline-flex items-center px-4 py-2 rounded-xl bg-indigo-50 border border-indigo-100">
                        <span className="text-xl font-bold text-indigo-800">{selectedUser?.points?.total ?? 0}</span>
                        <span className="ml-2 text-sm font-semibold text-indigo-700">Points</span>
                      </div>
                    </div>
                  </div>

                  {(() => {
                    const userArticles = (articlesArray || []).filter((article) => {
                      const authorId =
                        typeof article?.author === 'object' ? article?.author?.id : null;
                      const authorUsername =
                        typeof article?.author === 'object' ? article?.author?.username : null;
                      return authorId === selectedUser.id || authorUsername === selectedUser.username;
                    });

                    return (
                      <div className="mt-6">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-sm font-bold text-slate-900">Authored Manuscripts</h3>
                        </div>

                        {userArticles.length === 0 ? (
                          <p className="text-sm text-zinc-500">No manuscripts submitted by this researcher yet.</p>
                        ) : (
                          <table className="w-full text-left border-collapse">
                            <thead className="bg-zinc-50 border-b text-zinc-600 text-xs font-semibold uppercase">
                              <tr>
                                <th className="p-4">Title</th>
                                <th className="p-4">Nominated Journal</th>
                                <th className="p-4">Status</th>
                              </tr>
                            </thead>
                            <tbody className="text-sm text-slate-700 divide-y">
                              {userArticles.map((article) => {
                                const nominatedJournalName =
                                  typeof article?.nominated_journal === 'object'
                                    ? article?.nominated_journal?.name || 'None'
                                    : article?.nominated_journal || 'Not Specified';

                                const subsidy = article?.subsidy_status;
                                const statusText =
                                  subsidy === 'pending_review'
                                    ? 'Pending Review'
                                    : subsidy === 'approved'
                                      ? 'Fully Covered'
                                      : '—';

                                return (
                                  <tr key={article?.slug || article?.id} className="hover:bg-zinc-50">
                                    <td className="p-4 font-semibold text-slate-900 max-w-xs truncate">{article?.title || '—'}</td>
                                    <td className="p-4">{nominatedJournalName}</td>
                                    <td className="p-4">{statusText}</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}
            </section>
          )}

          {/* TAB 2: Articles */}
          {activeTab === 'articles' && (
            <section className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
              <div className="p-6 border-b border-zinc-200 flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900">Manuscript Comprehensive Logs</h2>
                <button
                  className="text-sm font-semibold text-indigo-700 hover:text-indigo-800"
                  onClick={() => refetchArticles()}
                  disabled={articlesLoading}
                >
                  {articlesLoading ? 'Refreshing…' : 'Refresh'}
                </button>
              </div>

              {articlesError ? (
                <div className="p-6">
                  <p className="text-sm text-rose-700 font-semibold">Failed to load manuscripts.</p>
                </div>
              ) : (
                <div className="p-2">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-zinc-50 border-b text-zinc-600 text-xs font-semibold uppercase">
                      <tr>
                        <th className="p-4">Title</th>
                        <th className="p-4">Author</th>
                        <th className="p-4">Nominated Journal</th>
                        <th className="p-4">Subsidy Status</th>
                        <th className="p-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm text-slate-700 divide-y">
                      {(articlesArray || []).map((article) => {
                        const authorName =
                          typeof article?.author === 'object'
                            ? article?.author?.username || article?.author?.name || 'Unknown'
                            : article?.author || 'Unknown';

                        const nominatedJournalName =
                          typeof article?.nominated_journal === 'object'
                            ? article?.nominated_journal?.name || 'None'
                            : article?.nominated_journal || 'Not Specified';

                        const subsidy = article?.subsidy_status;

                        return (
                          <tr key={article?.slug || article?.id} className="hover:bg-zinc-50">
                                            <td className="p-4 font-semibold text-slate-900 max-w-xs truncate">{article?.title || '—'}</td>
                            <td className="p-4">
                              <div className="flex flex-col gap-1">
                                <span className="font-semibold text-slate-900">{authorName || 'Unknown'}</span>
                                <span className="text-xs text-zinc-400">Role: {article?.author?.role || 'user'}</span>
                              </div>
                            </td>
                            <td className="p-4 text-indigo-700 font-semibold">{nominatedJournalName}</td>
                            <td className="p-4">
                              {subsidy === 'pending_review' ? (
                                <span className="bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full text-xs font-semibold">
                                  Pending Review
                                </span>
                              ) : subsidy === 'approved' ? (
                                <span className="bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full text-xs font-semibold">
                                  Fully Covered
                                </span>
                              ) : (
                                <span className="text-zinc-400">—</span>
                              )}
                            </td>
                            <td className="p-4 text-center">
                              <div className="inline-flex items-center gap-2">
                                {subsidy === 'pending_review' && (
                                  <button
                                    onClick={() => handleApproveSubsidy(article?.slug)}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition"
                                  >
                                    Approve
                                  </button>
                                )}
                                <button
                                  onClick={() => setNominateModal({ open: true, article })}
                                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition"
                                >
                                  Nominate Journal
                                </button>
                                <button
                                  onClick={() => handleDeleteArticle(article?.slug)}
                                  className="bg-rose-600 hover:bg-rose-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}

                      {!articlesLoading && (articlesArray || []).length === 0 && (
                        <tr>
                          <td colSpan={5} className="p-6 text-center text-sm text-zinc-500">
                            No manuscripts found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}

          {/* TAB 3: Journals */}
          {activeTab === 'journals' && (
            <section className="space-y-6">
              <div className="flex justify-between items-center gap-4">
                <h2 className="text-xl font-bold text-slate-900">Academic Journals</h2>
                <button
                  onClick={() => setShowJournalForm((v) => !v)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow transition"
                >
                  {showJournalForm ? 'Cancel' : 'Add New Journal'}
                </button>
              </div>

              {showJournalForm && (
                <form
                  onSubmit={handleAddJournal}
                  className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4 items-end"
                >
                  <div>
                    <label className="block text-xs font-semibold text-zinc-600 mb-1">Journal Name</label>
                    <input
                      type="text"
                      required
                      value={newJournal.name}
                      onChange={(e) => setNewJournal((s) => ({ ...s, name: e.target.value }))}
                      className="w-full p-2.5 border border-zinc-200 rounded-xl text-sm bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-600 mb-1">Field of Study</label>
                    <input
                      type="text"
                      required
                      value={newJournal.field_of_study}
                      onChange={(e) => setNewJournal((s) => ({ ...s, field_of_study: e.target.value }))}
                      className="w-full p-2.5 border border-zinc-200 rounded-xl text-sm bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-600 mb-1">Impact Factor</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={newJournal.impact_factor}
                      onChange={(e) => setNewJournal((s) => ({ ...s, impact_factor: e.target.value }))}
                      className="w-full p-2.5 border border-zinc-200 rounded-xl text-sm bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-600 mb-1">Access Type</label>
                    <select
                      value={newJournal.publication_type}
                      onChange={(e) => setNewJournal((s) => ({ ...s, publication_type: e.target.value }))}
                      className="w-full p-2.5 border border-zinc-200 rounded-xl text-sm bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    >
                      <option value="open_access">Open Access</option>
                      <option value="subscription">Subscription</option>
                    </select>
                  </div>

                  <div className="md:col-span-4">
                    <button
                      type="submit"
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl text-sm font-semibold shadow transition"
                    >
                      Save Journal
                    </button>
                  </div>
                </form>
              )}

              <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
                <div className="p-4 border-b border-zinc-200 flex items-center justify-between">
                  <div className="text-sm font-semibold text-slate-900">Available Accredited Journals</div>
                  <button
                    className="text-sm font-semibold text-indigo-700 hover:text-indigo-800"
                    onClick={() => refetchJournals()}
                    disabled={journalsLoading}
                  >
                    {journalsLoading ? 'Refreshing…' : 'Refresh'}
                  </button>
                </div>

                {journalsError ? (
                  <div className="p-6">
                    <p className="text-sm text-rose-700 font-semibold">
                      {journalsFetchErrorMessage || 'Failed to load journals.'}
                    </p>
                  </div>
                ) : (
                  <div className="p-2">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-zinc-50 border-b text-zinc-600 text-xs font-semibold uppercase">
                        <tr>
                          <th className="p-4">Journal Name</th>
                          <th className="p-4">Field of Study</th>
                          <th className="p-4">Impact Factor</th>
                          <th className="p-4">Access Type</th>
                          <th className="p-4 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm text-slate-700 divide-y">
                        {(journalsArray || []).map((j) => {
                          const publicationType = j?.publication_type || j?.access_type;
                          return (
                            <tr key={j?.id || j?.slug || j?.name} className="hover:bg-zinc-50">
                              <td className="p-4 font-semibold text-slate-900">{j?.name || '—'}</td>
                              <td className="p-4">{j?.field_of_study || '—'}</td>
                              <td className="p-4 font-bold text-amber-700">{j?.impact_factor ?? '—'}</td>
                              <td className="p-4">
                                <span
                                  className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                    publicationType === 'open_access'
                                      ? 'bg-teal-100 text-teal-800'
                                      : 'bg-purple-100 text-purple-800'
                                  }`}
                                >
                                  {publicationType === 'open_access' ? 'Open Access' : 'Subscription'}
                                </span>
                              </td>
                              <td className="p-4 text-center">
                                <button
                                  onClick={() => handleDeleteJournal(j?.id)}
                                  className="bg-rose-600 hover:bg-rose-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition"
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          );
                        })}


                        {!journalsLoading && (journalsArray || []).length === 0 && (
                          <tr>
                            <td colSpan={5} className="p-6 text-center text-sm text-zinc-500">
                              No journals found.
                            </td>
                          </tr>

                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* TAB 4: Nominate Journal */}
          {activeTab === 'recommendations' && (
            <section className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-6 max-w-3xl">
              <h2 className="text-lg font-bold text-slate-900 mb-2">Nominate Journal for a Manuscript</h2>
              <p className="text-sm text-zinc-600 mb-6">
                Map an incoming manuscript to an accredited journal from the system database.
              </p>

              <form onSubmit={handleNominateJournal} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-600 mb-1">Select Manuscript</label>
                  <select
                    required
                    value={nominationForm.articleSlug}
                    onChange={(e) => setNominationForm((s) => ({ ...s, articleSlug: e.target.value }))}
                    className="w-full p-3 border border-zinc-200 rounded-xl text-sm bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  >
                    <option value="">-- Choose Manuscript --</option>
                    {(articlesArray || []).map((a) => (
                      <option key={a?.slug || a?.id} value={a?.slug || ''}>
                        {a?.title || 'Untitled'}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-600 mb-1">Select Accredited Journal</label>
                  <select
                    required
                    value={nominationForm.journalId}
                    onChange={(e) => setNominationForm((s) => ({ ...s, journalId: e.target.value }))}
                    className="w-full p-3 border border-zinc-200 rounded-xl text-sm bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  >
                    <option value="">-- Choose Academic Journal --</option>
                    {(journalsArray || []).map((j) => (
                      <option key={j?.id || j?.slug || j?.name} value={j?.id || ''}>
                        {j?.name || '—'}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl text-sm font-semibold shadow-md transition"
                >
                  Submit Nomination Mapping
                </button>

                <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-700">
                  <span className="font-semibold text-rose-700">Developer Note:</span> Nomination mapping requires adding{' '}
                  <span className="font-semibold">useNominateJournalMutation</span> to <span className="font-semibold">baseApi.js</span>.
                </div>
              </form>
            </section>
          )}

          {/* Nominate Journal Modal */}
          {nominateModal.open && nominateModal.article && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
              <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Nominate Journal</h3>
                <p className="text-sm text-zinc-600 mb-4">
                  Select a journal to nominate for: <span className="font-semibold">{nominateModal.article.title}</span>
                </p>
                <div className="space-y-3 mb-6">
                  <label className="block text-xs font-semibold text-zinc-600">Select Journal</label>
                  <select
                    value={nominateModal.journalId || ''}
                    onChange={(e) => setNominateModal({ ...nominateModal, journalId: e.target.value })}
                    className="w-full p-3 border border-zinc-200 rounded-xl text-sm bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  >
                    <option value="">-- Choose Journal --</option>
                    {(journalsArray || []).map((j) => (
                      <option key={j?.id || j?.slug || j?.name} value={j?.id || ''}>
                        {j?.name || '—'} (IF: {j?.impact_factor || 'N/A'})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setNominateModal({ open: false, article: null, journalId: null })}
                    className="flex-1 px-4 py-2 border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-700 hover:bg-zinc-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleNominateJournal(nominateModal.article, nominateModal.journalId)}
                    disabled={!nominateModal.journalId}
                    className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition disabled:opacity-50"
                  >
                    Nominate
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: Notifications */}
          {activeTab === 'notifications' && (
            <section className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-6 max-w-3xl">
              <h2 className="text-lg font-bold text-slate-900 mb-2">Send Notifications</h2>
              <p className="text-sm text-zinc-600 mb-6">Compose and deliver a broadcast or a targeted message to researchers.</p>

              <form onSubmit={handleSendNotification} className="space-y-5">
                <div>
                  <div className="text-xs font-semibold text-zinc-600 uppercase tracking-wider mb-2">Target Audience</div>

                  <div className="flex items-center gap-4 flex-wrap">
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="targetType"
                        value="all"
                        checked={targetType === 'all'}
                        onChange={() => {
                          setTargetType('all');
                          setSelectedUserId('');
                        }}
                      />
                      <span className="text-sm font-semibold text-slate-900">Broadcast to Everyone</span>
                    </label>

                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="targetType"
                        value="specific"
                        checked={targetType === 'specific'}
                        onChange={() => setTargetType('specific')}
                      />
                      <span className="text-sm font-semibold text-slate-900">Specific Researcher Only</span>
                    </label>
                  </div>
                </div>

                {targetType === 'specific' && (
                  <div>
                    <label className="block text-xs font-semibold text-zinc-600 mb-1">Select Researcher</label>
                    <select
                      required
                      value={selectedUserId}
                      onChange={(e) => setSelectedUserId(e.target.value)}
                      className="w-full p-3 border border-zinc-200 rounded-xl text-sm bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    >
                      <option value="">-- Choose User --</option>
                      {(usersArray || []).map((u) => (
                        <option key={u?.id ?? u?.username} value={u?.id ?? ''}>
                          {u?.username || '—'} ({u?.institution || '—'})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-zinc-600 mb-1">Notification Title</label>
                  <input
                    required
                    type="text"
                    value={notificationTitle}
                    onChange={(e) => setNotificationTitle(e.target.value)}
                    className="w-full p-3 border border-zinc-200 rounded-xl text-sm bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-600 mb-1">Message Content</label>
                  <textarea
                    required
                    rows={5}
                    value={notificationMessage}
                    onChange={(e) => setNotificationMessage(e.target.value)}
                    className="w-full p-3 border border-zinc-200 rounded-xl text-sm bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl text-sm font-semibold shadow-md transition disabled:opacity-60"
                  disabled={sendNotificationState?.isLoading}
                >
                  {sendNotificationState?.isLoading ? 'Sending…' : 'Send Notification'}
                </button>

                <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-700">
                  <span className="font-semibold text-indigo-700">Payload:</span> Title and message are sent to{' '}
                  {targetType === 'all' ? 'everyone.' : 'the selected user.'}
                </div>
              </form>
            </section>
          )}
        </div>
      </main>
    </div>
  );
};

export default SuperAdminDashboard;

