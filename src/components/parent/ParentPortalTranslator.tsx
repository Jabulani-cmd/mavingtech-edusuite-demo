import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { PARENT_PORTAL_DICTIONARY } from "@/lib/i18n/parentPortalDictionary";

/**
 * Auto-translates visible English text into isiZulu across the Parent Portal
 * subtree by walking text nodes and mutating them. Uses a MutationObserver
 * so dynamic content (dialogs, tabs, toasts) is translated as it renders.
 *
 * We store the original text on each node so switching back to English
 * restores the source text without a reload.
 */
export default function ParentPortalTranslator({ children }: { children: React.ReactNode }) {
  const { i18n } = useTranslation();
  const isZu = (i18n.language || "").toLowerCase().startsWith("zu");

  useEffect(() => {
    const root = document.body;

    // Sort keys longest first for phrase-priority replacement.
    const entries = Object.entries(PARENT_PORTAL_DICTIONARY).sort(
      (a, b) => b[0].length - a[0].length,
    );

    const ORIG = "__zuOrig";

    const translateText = (src: string): string => {
      let out = src;
      for (const [en, zu] of entries) {
        if (!out.includes(en)) continue;
        // Whole-token / phrase replace (case-sensitive; content is authored English).
        out = out.split(en).join(zu);
      }
      return out;
    };

    const shouldSkip = (node: Node): boolean => {
      let el: Node | null = node;
      while (el) {
        if (el.nodeType === 1) {
          const e = el as HTMLElement;
          const tag = e.tagName;
          if (tag === "SCRIPT" || tag === "STYLE" || tag === "NOSCRIPT" || tag === "CODE" || tag === "PRE") return true;
          if (e.getAttribute && e.getAttribute("data-no-translate") === "true") return true;
        }
        el = (el as any).parentNode;
      }
      return false;
    };

    const processTextNode = (node: Text, toZu: boolean) => {
      if (shouldSkip(node)) return;
      const anyNode = node as any;
      if (toZu) {
        const original = anyNode[ORIG] ?? node.nodeValue ?? "";
        const translated = translateText(original);
        if (translated !== node.nodeValue) {
          if (anyNode[ORIG] == null) anyNode[ORIG] = original;
          node.nodeValue = translated;
        }
      } else {
        if (anyNode[ORIG] != null) {
          node.nodeValue = anyNode[ORIG];
          delete anyNode[ORIG];
        }
      }
    };

    const walk = (root: Node, toZu: boolean) => {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      const nodes: Text[] = [];
      let n = walker.nextNode();
      while (n) {
        nodes.push(n as Text);
        n = walker.nextNode();
      }
      for (const t of nodes) processTextNode(t, toZu);
    };

    // Also translate common attributes: placeholder, title, aria-label, alt, value (button-like).
    const ATTRS = ["placeholder", "title", "aria-label", "alt"];
    const processAttrs = (el: Element, toZu: boolean) => {
      if (shouldSkip(el)) return;
      for (const attr of ATTRS) {
        const key = `__zuOrig_${attr}`;
        const anyEl = el as any;
        const cur = el.getAttribute(attr);
        if (toZu) {
          if (cur == null) continue;
          const original = anyEl[key] ?? cur;
          const translated = translateText(original);
          if (translated !== cur) {
            if (anyEl[key] == null) anyEl[key] = original;
            el.setAttribute(attr, translated);
          }
        } else {
          if (anyEl[key] != null) {
            el.setAttribute(attr, anyEl[key]);
            delete anyEl[key];
          }
        }
      }
    };

    const walkAttrs = (root: Element, toZu: boolean) => {
      processAttrs(root, toZu);
      const all = root.querySelectorAll("*");
      for (let i = 0; i < all.length; i++) processAttrs(all[i], toZu);
    };

    // Initial pass.
    walk(root, isZu);
    walkAttrs(root, isZu);

    if (!isZu) return; // Nothing to observe; English is source of truth.

    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === "characterData" && m.target.nodeType === 3) {
          processTextNode(m.target as Text, true);
        } else if (m.type === "childList") {
          m.addedNodes.forEach((n) => {
            if (n.nodeType === 3) {
              processTextNode(n as Text, true);
            } else if (n.nodeType === 1) {
              walk(n, true);
              walkAttrs(n as Element, true);
            }
          });
        } else if (m.type === "attributes" && m.target.nodeType === 1) {
          processAttrs(m.target as Element, true);
        }
      }
    });

    observer.observe(root, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: ATTRS,
    });

    return () => observer.disconnect();
  }, [isZu]);

  return <>{children}</>;
}
