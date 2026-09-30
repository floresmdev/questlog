import type { CommentWithAuthor } from '../../api/types';
import { relativeTime } from '../../lib/format';
import { Avatar } from '../ui/Avatar';

interface CommentItemProps {
  comment: CommentWithAuthor;
  /** Show the author's job title (used for people other than the assignee). */
  showJobTitle?: boolean;
}

/** Renders build references like "#214" in bold monospace. */
function CommentBody({ body }: { body: string }) {
  return (
    <>
      {body.split(/(#\d+)/).map((part, i) =>
        /^#\d+$/.test(part) ? (
          <b key={i} className="font-mono font-semibold">
            {part}
          </b>
        ) : (
          part
        ),
      )}
    </>
  );
}

export function CommentItem({ comment, showJobTitle }: CommentItemProps) {
  const meta = [showJobTitle && comment.author.jobTitle, relativeTime(comment.createdAt)].filter(Boolean).join(' · ');

  return (
    <div className="flex gap-2.5">
      <Avatar user={comment.author} size="md" />
      <div className="flex flex-grow flex-col gap-[3px] rounded-[4px_10px_10px_10px] bg-bubble px-2.5 py-2">
        <span className="text-[11.5px] font-bold text-ink">
          {comment.author.fullName} <span className="font-medium text-ink-muted">· {meta}</span>
        </span>
        <span className="text-xs leading-[1.45] text-ink-2">
          <CommentBody body={comment.body} />
        </span>
      </div>
    </div>
  );
}
