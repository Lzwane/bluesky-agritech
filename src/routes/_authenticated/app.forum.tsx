import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import {
  Heart,
  MessageSquare,
  Plus,
  Search,
  Filter,
  MapPin,
  Clock,
  Sparkles,
  Send,
  X,
  Share2,
  MessageCircle,
} from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/app/forum")({
  component: ForumPage,
});

const CATEGORIES = [
  "All",
  "Maize",
  "Citrus",
  "Vegetables",
  "Soybeans",
  "Avocado",
  "Pest Control",
  "Soil & Nutrition",
  "Irrigation",
  "General",
];

interface ForumPostItem {
  id: string;
  user_id?: string | null;
  author_id?: string | null;
  author_name: string;
  location: string;
  title: string;
  body?: string;
  content?: string;
  category: string;
  created_at: string;
}

interface ForumCommentItem {
  id: string;
  post_id: string;
  user_id?: string | null;
  author_id?: string | null;
  author_name: string;
  body?: string;
  content?: string;
  created_at: string;
}

interface ForumVoteItem {
  id?: string;
  post_id: string;
  user_id: string;
}

export function ForumPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [composerOpen, setComposerOpen] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [postCategory, setPostCategory] = useState("Maize");
  const [location, setLocation] = useState("Pretoria, Gauteng");

  // Interaction states
  const [openPostId, setOpenPostId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<Record<string, string>>({});

  const rawMeta = (user as any)?.user_metadata;
  const displayName = useMemo(() => {
    return (
      rawMeta?.full_name ||
      rawMeta?.display_name ||
      rawMeta?.name ||
      user?.email?.split("@")[0] ||
      "Farmer"
    );
  }, [rawMeta, user]);

  // 1. Fetch Posts: ordered descending by creation date
  const postsQuery = useQuery({
    queryKey: ["forum-posts"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("forum_posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading posts:", error);
        return [] as ForumPostItem[];
      }
      return (data || []) as ForumPostItem[];
    },
    refetchOnWindowFocus: true,
  });

  // 2. Fetch Votes
  const likesQuery = useQuery({
    queryKey: ["forum-votes"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("forum_votes")
        .select("post_id, user_id");

      if (error) {
        console.error("Error loading votes:", error);
        return [] as ForumVoteItem[];
      }
      return (data || []) as ForumVoteItem[];
    },
    refetchOnWindowFocus: true,
  });

  // 3. Fetch Comments: safely map author name from profiles if author_name column is missing
  const commentsQuery = useQuery({
    queryKey: ["forum-comments"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("forum_comments")
        .select(`
          *,
          profiles:user_id (
            full_name
          )
        `)
        .order("created_at", { ascending: true });

      if (error) {
        // Fallback simple query if relation doesn't exist
        const simple = await (supabase as any)
          .from("forum_comments")
          .select("*")
          .order("created_at", { ascending: true });
        
        return ((simple.data || []) as any[]).map((c) => ({
          ...c,
          author_name: c.author_name || "Farmer",
        })) as ForumCommentItem[];
      }

      return ((data || []) as any[]).map((c) => ({
        ...c,
        author_name: c.author_name || c.profiles?.full_name || "Farmer",
      })) as ForumCommentItem[];
    },
    refetchOnWindowFocus: true,
  });

  // Realtime Subscriptions
  useEffect(() => {
    const channel = supabase
      .channel("forum_realtime_stream")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "forum_posts" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["forum-posts"] });
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "forum_comments" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["forum-comments"] });
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "forum_votes" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["forum-votes"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const allPosts = useMemo(() => {
    const dbPosts = postsQuery.data ?? [];
    return [...dbPosts].sort((a, b) => {
      const timeA = new Date(a.created_at).getTime() || 0;
      const timeB = new Date(b.created_at).getTime() || 0;
      return timeB - timeA;
    });
  }, [postsQuery.data]);

  const filteredPosts = useMemo(() => {
    return allPosts.filter((post) => {
      const matchesCategory =
        selectedCategory === "All" ||
        post.category?.toLowerCase() === selectedCategory.toLowerCase();

      const q = searchQuery.toLowerCase().trim();
      const textContent = (post.body || post.content || "").toLowerCase();
      const matchesSearch =
        !q ||
        post.title?.toLowerCase().includes(q) ||
        textContent.includes(q) ||
        post.author_name?.toLowerCase().includes(q) ||
        post.location?.toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [allPosts, selectedCategory, searchQuery]);

  // Create Post Mutation
  const createPostMutation = useMutation({
    mutationFn: async () => {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      const activeUser = authData?.user;

      if (authError || !activeUser) {
        throw new Error("Your session has expired. Please sign out and sign back in.");
      }

      if (!title.trim() || title.trim().length < 5) {
        throw new Error("Please enter a title of at least 5 characters.");
      }
      if (!body.trim() || body.trim().length < 10) {
        throw new Error("Please provide more details in your post.");
      }

      const postTimestamp = new Date().toISOString();
      const cleanBody = body.trim().slice(0, 3000);

      await (supabase as any).from("profiles").upsert(
        {
          id: activeUser.id,
          full_name: displayName,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );

      const { data, error } = await (supabase as any)
        .from("forum_posts")
        .insert({
          user_id: activeUser.id,
          author_id: activeUser.id,
          author_name: displayName,
          location: location.trim() || "South Africa",
          title: title.trim().slice(0, 150),
          body: cleanBody,
          content: cleanBody,
          category: postCategory,
          created_at: postTimestamp,
        })
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data as ForumPostItem;
    },
    onSuccess: (newPost) => {
      queryClient.setQueryData(["forum-posts"], (old: ForumPostItem[] = []) => [
        newPost,
        ...(old || []).filter((p) => p.id !== newPost.id),
      ]);
      setTitle("");
      setBody("");
      setComposerOpen(false);
      toast.success("Post published to the top of the community feed!");
      queryClient.invalidateQueries({ queryKey: ["forum-posts"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to publish post.");
    },
  });

  // Toggle Like Mutation
  const toggleLikeMutation = useMutation({
    mutationFn: async (postId: string) => {
      if (!user?.id) {
        toast.error("Please sign in to like posts.");
        return;
      }

      const postIdStr = String(postId);
      const allVotes = likesQuery.data || [];
      const userHasLiked = allVotes.some(
        (v) => String(v.post_id) === postIdStr && String(v.user_id) === String(user.id)
      );

      if (userHasLiked) {
        const { error } = await (supabase as any)
          .from("forum_votes")
          .delete()
          .eq("post_id", postIdStr)
          .eq("user_id", user.id);

        if (error) throw error;
      } else {
        const { error } = await (supabase as any)
          .from("forum_votes")
          .insert({
            post_id: postIdStr,
            user_id: user.id,
          });

        if (error) throw error;
      }
    },
    onMutate: async (postId: string) => {
      await queryClient.cancelQueries({ queryKey: ["forum-votes"] });
      const previousVotes = queryClient.getQueryData<ForumVoteItem[]>(["forum-votes"]) || [];
      const postIdStr = String(postId);

      const alreadyLiked = previousVotes.some(
        (v) => String(v.post_id) === postIdStr && String(v.user_id) === String(user?.id)
      );

      if (alreadyLiked) {
        queryClient.setQueryData<ForumVoteItem[]>(
          ["forum-votes"],
          previousVotes.filter(
            (v) => !(String(v.post_id) === postIdStr && String(v.user_id) === String(user?.id))
          )
        );
      } else if (user?.id) {
        queryClient.setQueryData<ForumVoteItem[]>(["forum-votes"], [
          ...previousVotes,
          { post_id: postIdStr, user_id: user.id },
        ]);
      }

      return { previousVotes };
    },
    onError: (_err, _postId, context: any) => {
      if (context?.previousVotes) {
        queryClient.setQueryData(["forum-votes"], context.previousVotes);
      }
      toast.error("Could not register like.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["forum-votes"] });
    },
  });

  // Add Comment Mutation: Dynamically tries payload with author_name, falling back without it
  const addCommentMutation = useMutation({
    mutationFn: async (postId: string) => {
      const { data: authData } = await supabase.auth.getUser();
      const activeUser = authData?.user || user;

      if (!activeUser) throw new Error("Please sign in to reply.");
      const postIdStr = String(postId);
      const text = (replyText[postIdStr] || "").trim();
      if (!text) throw new Error("Please write a comment first.");

      const commentTimestamp = new Date().toISOString();

      // Ensure profile exists for joined author names
      await (supabase as any).from("profiles").upsert(
        {
          id: activeUser.id,
          full_name: displayName,
          updated_at: commentTimestamp,
        },
        { onConflict: "id" }
      );

      // Attempt 1: Full payload including author_name
      let { data, error } = await (supabase as any)
        .from("forum_comments")
        .insert({
          post_id: postIdStr,
          user_id: activeUser.id,
          author_name: displayName,
          body: text,
          content: text,
          created_at: commentTimestamp,
        })
        .select()
        .single();

      // Attempt 2: If author_name isn't in schema, strip it and rely on user_id -> profiles join
      if (error && error.message?.includes("author_name")) {
        const fallback = await (supabase as any)
          .from("forum_comments")
          .insert({
            post_id: postIdStr,
            user_id: activeUser.id,
            body: text,
            content: text,
            created_at: commentTimestamp,
          })
          .select()
          .single();

        if (fallback.error) throw new Error(fallback.error.message);
        data = fallback.data;
      } else if (error) {
        throw new Error(error.message);
      }

      setReplyText((prev) => ({ ...prev, [postIdStr]: "" }));
      return {
        ...data,
        author_name: displayName,
      } as ForumCommentItem;
    },
    onSuccess: () => {
      toast.success("Comment posted!");
      queryClient.invalidateQueries({ queryKey: ["forum-comments"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to post comment.");
    },
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20 font-sans">
      {/* Community Header Banner */}
      <div className="rounded-3xl border border-slate-700/60 bg-[#161d26]/90 p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 h-64 w-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-xs font-semibold text-emerald-300">
              <Sparkles className="h-3.5 w-3.5" /> South African Farmer Network
            </span>
            <h1 className="mt-3 text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Community Field Exchange
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
              Connect with fellow growers in real time. Share field observations, like posts, comment, and collaborate across all 9 provinces.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setComposerOpen(true)}
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-3 text-xs sm:text-sm font-bold text-white shadow-lg shadow-emerald-950/60 hover:from-emerald-500 hover:to-teal-500 transition active:scale-95 shrink-0 cursor-pointer"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span>Create New Post</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search discussions, symptoms, grower names, or regional alerts..."
            className="w-full h-12 pl-11 pr-4 rounded-2xl border border-slate-800 bg-[#111720]/90 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none transition shadow-inner"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 shrink-0 mr-1">
            <Filter className="h-3.5 w-3.5 text-emerald-400" /> Category:
          </span>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap cursor-pointer",
                selectedCategory === cat
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-950/50"
                  : "bg-[#111720] border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Social Posts Stream */}
      <div className="space-y-4">
        {filteredPosts.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-800 bg-[#131922]/50 p-12 text-center space-y-3">
            <MessageSquare className="h-8 w-8 text-slate-600 mx-auto" />
            <h3 className="font-bold text-sm text-slate-200">No community posts match your search</h3>
            <p className="text-xs text-slate-500">
              Try adjusting your search terms or switch categories to "All" to browse all discussions.
            </p>
          </div>
        ) : (
          filteredPosts.map((post) => {
            const postIdStr = String(post.id);

            const postVotes = (likesQuery.data ?? []).filter(
              (v) => String(v.post_id) === postIdStr
            );

            const totalLikes = postVotes.length;

            const isLikedByMe = Boolean(
              user?.id && postVotes.some((v) => String(v.user_id) === String(user.id))
            );

            const postComments = (commentsQuery.data ?? []).filter(
              (c) => String(c.post_id) === postIdStr
            );
            const isExpanded = openPostId === postIdStr;
            const currentDraft = replyText[postIdStr] || "";

            return (
              <div
                key={post.id}
                className="rounded-3xl border border-slate-800/90 bg-[#131922] p-6 shadow-xl space-y-4 transition hover:border-slate-700/80"
              >
                {/* Author Metadata Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center font-bold text-emerald-400 text-xs shrink-0 shadow-inner">
                      {post.author_name?.slice(0, 2).toUpperCase() || "SA"}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-white">
                          {post.author_name}
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#1a2332] text-emerald-400 border border-emerald-500/20">
                          {post.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5">
                        {post.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-emerald-400" /> {post.location}
                          </span>
                        )}
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-slate-500" />
                          {new Date(post.created_at).toLocaleDateString("en-ZA", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Title & Body */}
                <div className="space-y-2">
                  <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
                    {post.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                    {post.body || post.content}
                  </p>
                </div>

                {/* Social Buttons */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs text-slate-400">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => toggleLikeMutation.mutate(postIdStr)}
                      className={cn(
                        "flex items-center gap-1.5 font-bold transition active:scale-90 px-3 py-1.5 rounded-xl border cursor-pointer",
                        isLikedByMe
                          ? "bg-rose-500/20 text-rose-400 border-rose-500/40 shadow-xs"
                          : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
                      )}
                    >
                      <Heart
                        className={cn(
                          "h-4 w-4 transition-transform",
                          isLikedByMe && "fill-rose-500 stroke-rose-500 scale-110"
                        )}
                      />
                      <span>{totalLikes}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setOpenPostId(isExpanded ? null : postIdStr)}
                      className="flex items-center gap-1.5 font-semibold text-slate-400 hover:text-white transition active:scale-95 px-3 py-1.5 rounded-xl bg-slate-900/40 border border-slate-800 hover:border-slate-700 cursor-pointer"
                    >
                      <MessageCircle className="h-4 w-4 text-emerald-400" />
                      <span>
                        {postComments.length} {postComments.length === 1 ? "Comment" : "Comments"}
                      </span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      toast.success("Post link copied to clipboard");
                    }}
                    className="flex items-center gap-1.5 text-slate-400 hover:text-white transition cursor-pointer"
                  >
                    <Share2 className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Share</span>
                  </button>
                </div>

                {/* Social Commenting Thread */}
                {isExpanded && (
                  <div className="pt-4 space-y-3.5 border-t border-slate-800/60 animate-in fade-in duration-200">
                    {postComments.length > 0 ? (
                      <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                        {postComments.map((comment) => (
                          <div
                            key={comment.id}
                            className="p-3.5 rounded-2xl bg-[#0f151d] border border-slate-800/80 text-xs space-y-1"
                          >
                            <div className="flex items-center justify-between text-slate-400 text-[11px]">
                              <span className="font-bold text-slate-200">
                                {comment.author_name}
                              </span>
                              <span>
                                {new Date(comment.created_at).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                            <p className="text-slate-300 leading-relaxed whitespace-pre-line">
                              {comment.body || comment.content}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 italic py-1">
                        No comments yet. Be the first farmer to comment or share advice!
                      </p>
                    )}

                    {/* Comment Input Bar */}
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        value={currentDraft}
                        onChange={(e) =>
                          setReplyText((prev) => ({ ...prev, [postIdStr]: e.target.value }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addCommentMutation.mutate(postIdStr);
                          }
                        }}
                        placeholder="Write a comment or practical tip…"
                        className="flex-1 h-10 px-4 rounded-xl border border-slate-800 bg-[#0f151d] text-xs text-slate-100 placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none transition"
                      />
                      <button
                        type="button"
                        disabled={!currentDraft.trim() || addCommentMutation.isPending}
                        onClick={() => addCommentMutation.mutate(postIdStr)}
                        className="h-10 px-4 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 transition disabled:opacity-40 flex items-center gap-1.5 shrink-0 cursor-pointer"
                      >
                        <Send className="h-3.5 w-3.5" />
                        <span>Send</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modal Dialog: Create New Post */}
      {composerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl rounded-3xl border border-slate-700 bg-[#161d26] p-6 sm:p-8 shadow-2xl text-slate-100 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" /> New Discussion
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white mt-0.5">
                  Share with Farmers
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setComposerOpen(false)}
                className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                createPostMutation.mutate();
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Crop Category</label>
                  <select
                    value={postCategory}
                    onChange={(e) => setPostCategory(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-800 bg-[#111720] text-xs text-white focus:border-emerald-500 focus:outline-none transition font-medium"
                  >
                    {CATEGORIES.filter((c) => c !== "All").map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Your Location / Region</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Brits, North West"
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-800 bg-[#111720] text-xs text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none transition"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Title / Main Question</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Leaf discoloration after heavy morning fog on tomatoes"
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-800 bg-[#111720] text-xs text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none transition font-medium"
                  maxLength={140}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Field Details & Context</label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={4}
                  placeholder="Describe observed plant symptoms, chemical applications used, soil moisture, or what you've tried..."
                  className="w-full p-3.5 rounded-xl border border-slate-800 bg-[#111720] text-xs text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none transition resize-none leading-relaxed"
                  maxLength={3000}
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setComposerOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-xs font-semibold text-slate-300 hover:text-white transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createPostMutation.isPending}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-xs font-bold text-white shadow-lg shadow-emerald-950/40 hover:from-emerald-500 hover:to-teal-500 transition active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>{createPostMutation.isPending ? "Publishing…" : "Publish to Feed"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}