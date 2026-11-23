
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import {
  Pencil,
  Eye,
  Code2,
  FileText,
} from "lucide-react";

import "highlight.js/styles/github-dark.css";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function MarkdownEditor({
  value,
  onChange,
}: MarkdownEditorProps) {
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");

  return (
    <div className="overflow-hidden rounded-xl border border-[#45A29E]/30 bg-[#1F2833]">
      {/* Editor header */}
      <div className="flex flex-col justify-between gap-3 border-b border-[#45A29E]/20 bg-[#0B0C10]/50 px-4 py-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <Code2 size={17} className="text-[#66FCF1]" />

          <span className="text-sm font-semibold text-[#C5C6C7]">
            Markdown Editor
          </span>
        </div>

        <span className="text-xs text-[#C5C6C7]/40">
          Write documentation with Markdown
        </span>
      </div>

      {/* Editor tabs */}
      <div className="flex border-b border-[#45A29E]/20 bg-[#0B0C10]/30">
        <button
          type="button"
          onClick={() => setActiveTab("write")}
          className={`inline-flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-medium transition ${
            activeTab === "write"
              ? "border-[#66FCF1] text-[#66FCF1]"
              : "border-transparent text-[#C5C6C7]/50 hover:text-[#C5C6C7]"
          }`}
        >
          <Pencil size={15} />
          Write
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("preview")}
          className={`inline-flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-medium transition ${
            activeTab === "preview"
              ? "border-[#66FCF1] text-[#66FCF1]"
              : "border-transparent text-[#C5C6C7]/50 hover:text-[#C5C6C7]"
          }`}
        >
          <Eye size={16} />
          Preview
        </button>
      </div>

      {/* Write mode */}
      {activeTab === "write" && (
        <>
          <textarea
            value={value}
            onChange={(event) => onChange(event.target.value)}
            rows={20}
            spellCheck={false}
            placeholder={`# Article title

Write your article here.

## Introduction

Use **bold**, *italic*, and lists.

- First point
- Second point

## Java example

\`\`\`java
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, DocHub!");
    }
}
\`\`\`

## Python example

\`\`\`python
def hello():
    print("Hello, DocHub!")
\`\`\`
`}
            className="min-h-[400px] w-full resize-y border-0 bg-[#1F2833] px-5 py-5 font-mono text-sm leading-7 text-[#C5C6C7] outline-none placeholder:text-[#C5C6C7]/25 focus:ring-0"
          />

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#45A29E]/20 bg-[#0B0C10]/40 px-5 py-3">
            <div className="flex items-center gap-2 text-xs text-[#C5C6C7]/45">
              <FileText size={14} />
              Markdown supported
            </div>

            <span className="text-xs text-[#C5C6C7]/40">
              {value.length} characters
            </span>
          </div>
        </>
      )}

      {/* Preview mode */}
      {activeTab === "preview" && (
        <div className="min-h-[400px] overflow-x-auto bg-[#1F2833] px-5 py-7 sm:px-8">
          {value.trim() ? (
            <div
              className="
                prose prose-invert max-w-none
                prose-headings:font-semibold
                prose-headings:tracking-tight
                prose-headings:text-[#C5C6C7]
                prose-p:leading-8
                prose-p:text-[#C5C6C7]/75
                prose-strong:text-[#C5C6C7]
                prose-a:text-[#66FCF1]
                prose-a:no-underline
                hover:prose-a:underline
                prose-blockquote:border-l-[#66FCF1]
                prose-blockquote:text-[#C5C6C7]/65
                prose-li:text-[#C5C6C7]/75
                prose-hr:border-[#45A29E]/25
                prose-th:border-[#45A29E]/30
                prose-th:bg-[#0B0C10]
                prose-th:px-4
                prose-th:py-3
                prose-th:text-[#66FCF1]
                prose-td:border-[#45A29E]/20
                prose-td:px-4
                prose-td:py-3
                prose-pre:overflow-x-auto
                prose-pre:rounded-xl
                prose-pre:border
                prose-pre:border-[#45A29E]/25
                prose-pre:bg-[#0B0C10]
                prose-code:text-[#66FCF1]
                prose-code:before:content-none
                prose-code:after:content-none
                prose-img:rounded-xl
              "
            >
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
              >
                {value}
              </ReactMarkdown>
            </div>
          ) : (
            <div className="flex min-h-[340px] flex-col items-center justify-center text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#45A29E]/15 text-[#66FCF1]">
                <FileText size={23} />
              </div>

              <p className="font-medium text-[#C5C6C7]">
                Nothing to preview yet
              </p>

              <p className="mt-2 text-sm text-[#C5C6C7]/45">
                Start writing your article to see the preview.
              </p>

              <button
                type="button"
                onClick={() => setActiveTab("write")}
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#66FCF1] transition hover:text-[#45A29E]"
              >
                <Pencil size={15} />
                Start writing
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
