// @ts-nocheck
import { Button } from "@/components/ui/button";
import { Eye, Printer, Download } from "lucide-react";
import type { DocActions } from "@/lib/finance/documentActions";

interface Props {
  actions: DocActions | (() => Promise<DocActions> | DocActions);
  size?: "sm" | "icon";
  labels?: boolean;
}

async function resolve(a: Props["actions"]): Promise<DocActions> {
  if (typeof a === "function") return await a();
  return a;
}

export default function DocActionButtons({ actions, size = "icon", labels = false }: Props) {
  const handle = async (key: "view" | "print" | "download") => {
    const resolved = await resolve(actions);
    resolved[key]();
  };

  if (labels) {
    return (
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={() => handle("view")}>
          <Eye className="mr-1 h-4 w-4" /> View
        </Button>
        <Button variant="outline" size="sm" onClick={() => handle("print")}>
          <Printer className="mr-1 h-4 w-4" /> Print
        </Button>
        <Button variant="outline" size="sm" onClick={() => handle("download")}>
          <Download className="mr-1 h-4 w-4" /> Download
        </Button>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-1">
      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handle("view")} title="View">
        <Eye className="h-3.5 w-3.5" />
      </Button>
      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handle("print")} title="Print">
        <Printer className="h-3.5 w-3.5" />
      </Button>
      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handle("download")} title="Download">
        <Download className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
