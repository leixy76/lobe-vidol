import { LobeChat, LobeChatProps } from '@lobehub/ui/brand';
import { memo } from 'react';

import { isCustomBranding } from '@/constants/version';

import CustomLogo from './Custom';

export const ProductLogo = memo<LobeChatProps>((props) => {
  if (isCustomBranding) {
    return <CustomLogo {...props} />;
  }

  return <LobeChat {...props} />;
});
