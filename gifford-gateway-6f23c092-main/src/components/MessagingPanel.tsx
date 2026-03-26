// @ts-nocheck
import { useState, useEffect, useRef, useCallback } from "react";
import { MessageSquare, Send, Plus, Users, User, Search, ArrowLeft, Megaphone, AlertCircle, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";

interface Conversation {
  id: string;
  type: string;
  name: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  last_message?: string;
  last_message_at?: string;
  unread_count?: number;
  participants?: { user_id: string; profiles?: { full_name: string; avatar_url: string | null } }[];
}

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: string;
  created_at: string;
  sender_name?: string;
}

export default function MessagingPanel() {
  const { user, role } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [search, setSearch] = useState("");
  const [totalUnread, setTotalUnread] = useState(0);

  // New conversation dialog
  const [newConvOpen, setNewConvOpen] = useState(false);
  const [newConvType, setNewConvType] = useState<"direct" | "group" | "broadcast">("direct");
  const [newConvName, setNewConvName] = useState("");
  const [newConvMessage, setNewConvMessage] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [userResults, setUserResults] = useState<any[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
  const [creating, setCreating] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const profileCache = useRef<Record<string, string>>({});

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const { data: participations } = await supabase
      .from("conversation_participants")
      .select("conversation_id, last_read_at")
      .eq("user_id", user.id);

    if (!participations || participations.length === 0) {
      setConversations([]);
      setTotalUnread(0);
      setLoading(false);
      return;
    }

    const convIds = participations.map(p => p.conversation_id);
    const lastReadMap: Record<string, string> = {};
    participations.forEach(p => { lastReadMap[p.conversation_id] = p.last_read_at || ""; });

    const { data: convs } = await supabase
      .from("conversations")
      .select("*")
      .in("id", convIds)
      .order("updated_at", { ascending: false });

    if (!convs) { setLoading(false); return; }

    // Get participants for each conv
    const { data: allParticipants } = await supabase
      .from("conversation_participants")
      .select("conversation_id, user_id")
      .in("conversation_id", convIds);

    // Get last message for each conversation
    let unreadTotal = 0;
    const enriched: Conversation[] = [];

    for (const conv of convs) {
      // Get last message
      const { data: lastMsgs } = await supabase
        .from("messages")
        .select("content, created_at, sender_id")
        .eq("conversation_id", conv.id)
        .order("created_at", { ascending: false })
        .limit(1);

      const lastMsg = lastMsgs?.[0];

      // Count unread
      const lastRead = lastReadMap[conv.id] || conv.created_at;
      const { count } = await supabase
        .from("messages")
        .select("id", { count: "exact", head: true })
        .eq("conversation_id", conv.id)
        .gt("created_at", lastRead)
        .neq("sender_id", user.id);

      const unread = count || 0;
      unreadTotal += unread;

      // Get participant names for display
      const convParticipants = (allParticipants || []).filter(p => p.conversation_id === conv.id);
      const otherUserIds = convParticipants.filter(p => p.user_id !== user.id).map(p => p.user_id);

      let displayName = conv.name;
      if (!displayName && conv.type === "direct" && otherUserIds.length > 0) {
        const otherId = otherUserIds[0];
        if (!profileCache.current[otherId]) {
          const { data: profile } = await supabase.from("profiles").select("full_name").eq("user_user_id", otherId).single();
          profileCache.current[otherId] = profile?.full_name || "Unknown";
        }
        displayName = profileCache.current[otherId];
      }

      enriched.push({
        ...conv,
        name: displayName || (conv.type === "group" ? "Group Chat" : conv.type === "broadcast" ? "Broadcast" : "Chat"),
        last_message: lastMsg?.content || "",
        last_message_at: lastMsg?.created_at || conv.created_at,
        unread_count: unread,
        participants: convParticipants as any,
      });
    }

    setConversations(enriched);
    setTotalUnread(unreadTotal);
    setLoading(false);
  }, [user]);

  // Fetch messages for active conversation
  const fetchMessages = useCallback(async (convId: string) => {
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", convId)
      .order("created_at", { ascending: true })
      .limit(100);

    if (data) {
      // Enrich with sender names
      const enriched: Message[] = [];
      for (const msg of data) {
        if (!profileCache.current[msg.sender_id]) {
          const { data: profile } = await supabase.from("profiles").select("full_name").eq("user_id", msg.sender_id).single();
          profileCache.current[msg.sender_id] = profile?.full_name || "Unknown";
        }
        enriched.push({ ...msg, sender_name: profileCache.current[msg.sender_id] });
      }
      setMessages(enriched);
    }

    // Mark as read
    if (user) {
      await supabase
        .from("conversation_participants")
        .update({ last_read_at: new Date().toISOString() })
        .eq("conversation_id", convId)
        .eq("user_id", user.id);
    }
  }, [user]);

  // Real-time subscription for new messages
  useEffect(() => {
    if (!user) return;
    fetchConversations();

    const channel = supabase
      .channel("user-messages")
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "messages",
      }, (payload) => {
        const newMsg = payload.new as Message;
        // If in active conv, add message
        if (activeConv && newMsg.conversation_id === activeConv.id) {
          const senderName = profileCache.current[newMsg.sender_id] || "Unknown";
          setMessages(prev => [...prev, { ...newMsg, sender_name: senderName }]);
          // Mark as read
          supabase
            .from("conversation_participants")
            .update({ last_read_at: new Date().toISOString() })
            .eq("conversation_id", newMsg.conversation_id)
            .eq("user_id", user.id);
        }
        // Refresh conversation list
        fetchConversations();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, activeConv, fetchConversations]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Open conversation
  const openConversation = async (conv: Conversation) => {
    setActiveConv(conv);
    await fetchMessages(conv.id);
  };

  // Send message
  const sendMessage = async () => {
    if (!newMessage.trim() || !activeConv || !user) return;
    setSendingMessage(true);
    const { error } = await supabase.from("messages").insert({
      conversation_id: activeConv.id,
      sender_id: user.id,
      content: newMessage.trim(),
      message_type: "text",
    });
    if (error) {
      toast({ title: "Failed to send", description: error.message, variant: "destructive" });
    } else {
      setNewMessage("");
      // Update conversation timestamp
      await supabase.from("conversations").update({ updated_at: new Date().toISOString() }).eq("id", activeConv.id);
    }
    setSendingMessage(false);
  };

  // Search users for new conversation
  const searchUsers = async (query: string) => {
    setUserSearch(query);
    if (query.length < 2) { setUserResults([]); return; }
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .ilike("full_name", `%${query}%`)
      .neq("id", user?.id || "")
      .limit(10);
    if (data) setUserResults(data);
  };

  const addUserToSelection = (u: any) => {
    if (!selectedUsers.find(s => s.id === u.id)) {
      setSelectedUsers(prev => [...prev, u]);
    }
    setUserSearch("");
    setUserResults([]);
  };

  const removeUserFromSelection = (id: string) => {
    setSelectedUsers(prev => prev.filter(u => u.id !== id));
  };

  // Create new conversation
  const createConversation = async () => {
    if (!user || selectedUsers.length === 0 || !newConvMessage.trim()) return;
    setCreating(true);

    try {
      // For direct messages, check if conversation already exists
      if (newConvType === "direct" && selectedUsers.length === 1) {
        const targetId = selectedUsers[0].id;
        // Check existing direct convs
        const { data: myConvs } = await supabase
          .from("conversation_participants")
          .select("conversation_id")
          .eq("user_id", user.id);

        if (myConvs) {
          for (const mc of myConvs) {
            const { data: conv } = await supabase
              .from("conversations")
              .select("*")
              .eq("id", mc.conversation_id)
              .eq("type", "direct")
              .single();

            if (conv) {
              const { data: otherPart } = await supabase
                .from("conversation_participants")
                .select("user_id")
                .eq("conversation_id", conv.id)
                .eq("user_id", targetId);

              if (otherPart && otherPart.length > 0) {
                // Existing conversation found, send message there
                await supabase.from("messages").insert({
                  conversation_id: conv.id,
                  sender_id: user.id,
                  content: newConvMessage.trim(),
                  message_type: "text",
                });
                await supabase.from("conversations").update({ updated_at: new Date().toISOString() }).eq("id", conv.id);
                toast({ title: "Message sent" });
                resetNewConv();
                fetchConversations();
                setCreating(false);
                return;
              }
            }
          }
        }
      }

      // Create new conversation
      const { data: conv, error: convErr } = await supabase
        .from("conversations")
        .insert({
          type: newConvType,
          name: newConvType !== "direct" ? (newConvName || null) : null,
          created_by: user.id,
        })
        .select()
        .single();

      if (convErr || !conv) throw convErr || new Error("Failed to create conversation");

      // Add participants (creator + selected users)
      const participants = [
        { conversation_id: conv.id, user_id: user.id },
        ...selectedUsers.map(u => ({ conversation_id: conv.id, user_id: u.id })),
      ];

      const { error: partErr } = await supabase.from("conversation_participants").insert(participants);
      if (partErr) throw partErr;

      // Send first message
      const { error: msgErr } = await supabase.from("messages").insert({
        conversation_id: conv.id,
        sender_id: user.id,
        content: newConvMessage.trim(),
        message_type: newConvType === "broadcast" ? "alert" : "text",
      });
      if (msgErr) throw msgErr;

      toast({ title: newConvType === "broadcast" ? "Broadcast sent" : "Conversation created" });
      resetNewConv();
      fetchConversations();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
    setCreating(false);
  };

  const resetNewConv = () => {
    setNewConvOpen(false);
    setNewConvType("direct");
    setNewConvName("");
    setNewConvMessage("");
    setSelectedUsers([]);
    setUserSearch("");
    setUserResults([]);
  };

  const filteredConversations = conversations.filter(c => {
    if (!search) return true;
    return c.name?.toLowerCase().includes(search.toLowerCase());
  });

  const typeIcon = (type: string) => {
    if (type === "direct") return <User className="h-4 w-4 text-muted-foreground" />;
    if (type === "group") return <Users className="h-4 w-4 text-muted-foreground" />;
    return <Megaphone className="h-4 w-4 text-muted-foreground" />;
  };

  const canCreateBroadcast = role === "admin" || role === "teacher";

  return (
    <>
      {/* Floating button */}
      <Button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground"
        size="icon"
      >
        <MessageSquare className="h-6 w-6" />
        {totalUnread > 0 && (
          <Badge className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full p-0 text-[10px]">
            {totalUnread > 99 ? "99+" : totalUnread}
          </Badge>
        )}
      </Button>

      {/* Messaging panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 flex h-[520px] w-[380px] flex-col overflow-hidden rounded-xl border bg-background shadow-2xl sm:w-[420px]"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b bg-primary px-4 py-3">
              <div className="flex items-center gap-2">
                {activeConv && (
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-primary-foreground hover:bg-primary-foreground/20" onClick={() => { setActiveConv(null); setMessages([]); fetchConversations(); }}>
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                )}
                <MessageSquare className="h-5 w-5 text-primary-foreground" />
                <h3 className="text-sm font-semibold text-primary-foreground">
                  {activeConv ? activeConv.name : "Messages"}
                </h3>
                {activeConv && (
                  <Badge variant="outline" className="text-[10px] border-primary-foreground/30 text-primary-foreground/80">
                    {activeConv.type}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-1">
                {!activeConv && (
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-primary-foreground hover:bg-primary-foreground/20" onClick={() => setNewConvOpen(true)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                )}
                <Button variant="ghost" size="icon" className="h-7 w-7 text-primary-foreground hover:bg-primary-foreground/20" onClick={() => setOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Body */}
            {!activeConv ? (
              /* Conversation List */
              <div className="flex flex-1 flex-col overflow-hidden">
                <div className="border-b px-3 py-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      placeholder="Search conversations..."
                      className="h-8 pl-8 text-xs"
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                    />
                  </div>
                </div>
                <ScrollArea className="flex-1">
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                  ) : filteredConversations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                      <MessageSquare className="h-10 w-10 text-muted-foreground/30 mb-3" />
                      <p className="text-sm text-muted-foreground">No conversations yet</p>
                      <Button variant="outline" size="sm" className="mt-3" onClick={() => setNewConvOpen(true)}>
                        <Plus className="mr-1 h-3.5 w-3.5" /> Start a conversation
                      </Button>
                    </div>
                  ) : (
                    filteredConversations.map(conv => (
                      <button
                        key={conv.id}
                        onClick={() => openConversation(conv)}
                        className="w-full flex items-start gap-3 border-b px-4 py-3 text-left transition-colors hover:bg-muted/50"
                      >
                        <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-muted">
                          {typeIcon(conv.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-medium truncate">{conv.name}</p>
                            {conv.last_message_at && (
                              <span className="flex-shrink-0 text-[10px] text-muted-foreground">
                                {format(new Date(conv.last_message_at), "MMM d")}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs text-muted-foreground truncate">{conv.last_message || "No messages yet"}</p>
                            {(conv.unread_count || 0) > 0 && (
                              <Badge className="h-5 min-w-5 flex-shrink-0 flex items-center justify-center rounded-full p-0 text-[10px]">
                                {conv.unread_count}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </ScrollArea>
              </div>
            ) : (
              /* Chat View */
              <div className="flex flex-1 flex-col overflow-hidden">
                <ScrollArea className="flex-1 px-4 py-3">
                  <div className="space-y-3">
                    {messages.length === 0 && (
                      <p className="text-center text-xs text-muted-foreground py-8">No messages yet. Say hello!</p>
                    )}
                    {messages.map(msg => {
                      const isMe = msg.sender_id === user?.id;
                      const isSystem = msg.message_type === "system" || msg.message_type === "alert";
                      if (isSystem) {
                        return (
                          <div key={msg.id} className="flex justify-center">
                            <div className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5">
                              <AlertCircle className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">{msg.content}</span>
                            </div>
                          </div>
                        );
                      }
                      return (
                        <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-[75%] rounded-2xl px-3.5 py-2 ${isMe ? "bg-primary text-primary-foreground rounded-br-md" : "bg-muted rounded-bl-md"}`}>
                            {!isMe && (
                              <p className="text-[10px] font-semibold mb-0.5 opacity-70">{msg.sender_name}</p>
                            )}
                            <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                            <p className={`text-[9px] mt-1 ${isMe ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                              {format(new Date(msg.created_at), "h:mm a")}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Message input */}
                <div className="border-t px-3 py-2">
                  <form onSubmit={e => { e.preventDefault(); sendMessage(); }} className="flex items-center gap-2">
                    <Input
                      placeholder="Type a message..."
                      className="h-9 text-sm"
                      value={newMessage}
                      onChange={e => setNewMessage(e.target.value)}
                      disabled={sendingMessage}
                    />
                    <Button type="submit" size="icon" className="h-9 w-9 flex-shrink-0" disabled={!newMessage.trim() || sendingMessage}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* New Conversation Dialog */}
      <Dialog open={newConvOpen} onOpenChange={v => { if (!v) resetNewConv(); else setNewConvOpen(true); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>New Conversation</DialogTitle>
            <DialogDescription>Start a direct message, group chat, or broadcast announcement.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={newConvType} onValueChange={v => setNewConvType(v as any)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="direct">Direct Message</SelectItem>
                  <SelectItem value="group">Group Chat</SelectItem>
                  {canCreateBroadcast && <SelectItem value="broadcast">Broadcast Announcement</SelectItem>}
                </SelectContent>
              </Select>
            </div>

            {newConvType !== "direct" && (
              <div className="space-y-2">
                <Label>{newConvType === "broadcast" ? "Subject" : "Group Name"}</Label>
                <Input value={newConvName} onChange={e => setNewConvName(e.target.value)} placeholder={newConvType === "broadcast" ? "e.g. Fee Reminder" : "e.g. Form 4 Science"} />
              </div>
            )}

            <div className="space-y-2">
              <Label>Recipients</Label>
              {selectedUsers.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {selectedUsers.map(u => (
                    <Badge key={u.id} variant="secondary" className="gap-1 pr-1">
                      {u.full_name}
                      <button onClick={() => removeUserFromSelection(u.id)} className="ml-0.5 rounded-full hover:bg-muted-foreground/20 p-0.5">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search users by name..."
                  className="pl-8"
                  value={userSearch}
                  onChange={e => searchUsers(e.target.value)}
                />
              </div>
              {userResults.length > 0 && (
                <div className="border rounded-md max-h-32 overflow-y-auto divide-y">
                  {userResults.map(u => (
                    <button key={u.id} className="w-full text-left px-3 py-2 hover:bg-muted/50 text-sm flex justify-between" onClick={() => addUserToSelection(u)}>
                      <span>{u.full_name}</span>
                      <span className="text-xs text-muted-foreground">{u.email}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Message</Label>
              <Textarea
                value={newConvMessage}
                onChange={e => setNewConvMessage(e.target.value)}
                placeholder="Type your message..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetNewConv}>Cancel</Button>
            <Button onClick={createConversation} disabled={creating || selectedUsers.length === 0 || !newConvMessage.trim()}>
              {creating && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
              {newConvType === "broadcast" ? "Send Broadcast" : "Send"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
