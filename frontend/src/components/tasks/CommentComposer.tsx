import { useState, type FormEvent } from 'react';
import { SendIcon } from '../ui/icons';

interface CommentComposerProps {
  onSubmit?: (body: string) => void;
}

export function CommentComposer({ onSubmit }: CommentComposerProps) {
  const [body, setBody] = useState('');

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const text = body.trim();
    if (!text) return;
    onSubmit?.(text);
    setBody('');
  };

  return (
    <form onSubmit={submit} className="flex h-10 shrink-0 items-center gap-2 rounded-[10px] border border-line-control pl-3 pr-1.5">
      <input
        type="text"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Escribe un comentario…"
        aria-label="Escribe un comentario"
        className="min-w-0 flex-grow border-0 bg-transparent text-[12.5px] outline-none placeholder:text-ink-muted"
      />
      <button
        type="submit"
        aria-label="Enviar comentario"
        className="flex h-[30px] w-[30px] shrink-0 cursor-pointer items-center justify-center rounded-lg border-0 bg-primary text-white"
      >
        <SendIcon size={14} />
      </button>
    </form>
  );
}
