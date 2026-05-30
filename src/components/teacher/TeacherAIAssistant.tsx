import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, Send, Loader2, Bot, User as UserIcon, Trash2, Copy, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";

type Msg = { role: "user" | "assistant"; content: string };

const MODELS = [
  { value: "gemini-flash", label: "Gemini Flash (fast, recommended)" },
  { value: "gemini-pro", label: "Gemini 2.5 Pro (deep reasoning)" },
  { value: "chatgpt", label: "ChatGPT (GPT-5)" },
  { value: "gpt-5-mini", label: "ChatGPT Mini (faster, cheaper)" },
  { value: "claude", label: "Claude (uses GPT-5 fallback)" },
  { value: "deepseek", label: "DeepSeek (uses Gemini fallback)" },
];

const TASKS = [
  { value: "general", label: "General assistant", prompt: "" },
  { value: "lesson", label: "Lesson planning", prompt: "Create a detailed lesson plan for: " },
  { value: "admin", label: "Admin writing", prompt: "Draft a professional memo about: " },
  { value: "grading", label: "Grading & feedback", prompt: "Write constructive feedback for a student who: " },
  { value: "email", label: "Email to parents", prompt: "Draft an email to a parent regarding: " },
];

export default function TeacherAIAssistant() {
  const { toast } = useToast();
  const [model, setModel] = useState("gemini-flash");
  const [task, setTask] = useState("general");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, streaming]);

  const send = async () => {
    if (!input.trim() || streaming) return;
    const userMsg: Msg = { role: "user", content: input.trim() };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setStreaming(true);

    let assistantSoFar = "";
    const upsert = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
        }
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/teacher-ai-assistant`;
      const resp = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: next, model, task }),
      });

      if (resp.status === 429) { toast({ title: "Rate limit", description: "Too many AI requests. Wait a moment and try again.", variant: "destructive" }); setStreaming(false); return; }
      if (resp.status === 402) { toast({ title: "AI credits exhausted", description: "Please contact your administrator.", variant: "destructive" }); setStreaming(false); return; }
      if (!resp.ok || !resp.body) { toast({ title: "AI error", description: "Failed to start AI response.", variant: "destructive" }); setStreaming(false); return; }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let done = false;
      while (!done) {
        const { done: d, value } = await reader.read();
        if (d) break;
        buffer += decoder.decode(value, { stream: true });
        let nl;
        while ((nl = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, nl);
          buffer = buffer.slice(nl + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") { done = true; break; }
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) upsert(content);
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }
    } catch (e: any) {
      toast({ title: "AI error", description: e.message || "Unknown error", variant: "destructive" });
    } finally {
      setStreaming(false);
    }
  };

  const onTaskChange = (v: string) => {
    setTask(v);
    const t = TASKS.find(x => x.value === v);
    if (t?.prompt && !input) setInput(t.prompt);
  };

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard" });
  };

  return (
    <Card className="border-primary/30">
      <CardHeader>
        <CardTitle className="font-heading flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" /> AI Assistant
          <Badge variant="secondary" className="ml-2">Multi-model</Badge>
        </CardTitle>
        <CardDescription>
          Chat with an AI tutor for lesson plans, admin writing, grading feedback and more. Pick your preferred model and task.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">AI Model</label>
            <Select value={model} onValueChange={setModel}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {MODELS.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Task type</label>
            <Select value={task} onValueChange={onTaskChange}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {TASKS.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="text-[11px] text-muted-foreground flex items-start gap-1.5 bg-muted/40 rounded-md p-2">
          <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
          <span>Claude and DeepSeek aren't on the integrated AI gateway yet — selecting them uses a close-equivalent model (GPT-5 or Gemini Pro) automatically.</span>
        </div>

        <ScrollArea className="h-[380px] border rounded-md p-3 bg-background">
          {messages.length === 0 && !streaming && (
            <div className="text-center text-muted-foreground text-sm py-12">
              <Bot className="h-10 w-10 mx-auto mb-2 opacity-40" />
              Start a conversation. Try: <em>"Plan a 40-min Form 3 lesson on photosynthesis"</em>.
            </div>
          )}
          <div className="space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                {m.role === "assistant" && <Bot className="h-5 w-5 text-primary shrink-0 mt-1" />}
                <div className={`rounded-lg px-3 py-2 max-w-[85%] text-sm ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                  {m.role === "assistant" ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none [&_p]:my-1 [&_ul]:my-1 [&_h1]:text-base [&_h2]:text-sm [&_h3]:text-sm">
                      <ReactMarkdown>{m.content || "…"}</ReactMarkdown>
                      {m.content && (
                        <Button size="sm" variant="ghost" className="h-6 px-2 -ml-2 mt-1" onClick={() => copy(m.content)}>
                          <Copy className="h-3 w-3 mr-1" /> Copy
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap">{m.content}</div>
                  )}
                </div>
                {m.role === "user" && <UserIcon className="h-5 w-5 text-muted-foreground shrink-0 mt-1" />}
              </div>
            ))}
            {streaming && messages[messages.length - 1]?.role === "user" && (
              <div className="flex gap-2"><Bot className="h-5 w-5 text-primary" /><div className="bg-muted rounded-lg px-3 py-2 text-sm"><Loader2 className="h-4 w-4 animate-spin" /></div></div>
            )}
            <div ref={endRef} />
          </div>
        </ScrollArea>

        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="Ask anything — lesson ideas, parent emails, grading feedback…"
            className="min-h-[60px] resize-none"
            disabled={streaming}
          />
          <div className="flex flex-col gap-2">
            <Button onClick={send} disabled={streaming || !input.trim()}>
              {streaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
            {messages.length > 0 && (
              <Button variant="outline" size="icon" onClick={() => setMessages([])} disabled={streaming} title="Clear chat">
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
