import type { User } from '../../api/types';
import { avatarBgClass } from '../../lib/styles';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const sizeClass: Record<AvatarSize, string> = {
  xs: 'h-6 w-6 text-[9.5px]',
  sm: 'h-[26px] w-[26px] text-[10px]',
  md: 'h-7 w-7 text-[9.5px]',
  lg: 'h-[38px] w-[38px] text-[12px]',
  xl: 'h-10 w-10 text-[13px]',
};

interface AvatarProps {
  user: Pick<User, 'initials' | 'avatarColor' | 'fullName'>;
  size?: AvatarSize;
  className?: string;
}

export function Avatar({ user, size = 'xs', className = '' }: AvatarProps) {
  return (
    <span
      title={user.fullName}
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-extrabold text-white ${avatarBgClass[user.avatarColor]} ${sizeClass[size]} ${className}`}
    >
      {user.initials}
    </span>
  );
}
