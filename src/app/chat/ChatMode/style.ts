import { createStyles } from 'antd-style';

import { CHAT_HEADER_HEIGHT, CHAT_INPUT_WIDTH } from '@/constants/token';

export const useStyles = createStyles(({ css, token, responsive }) => ({
  chat: css``,
  list: css`
    margin-top: ${CHAT_HEADER_HEIGHT}px;
  `,
  input: css`
    width: ${CHAT_INPUT_WIDTH};
    min-width: 360px;
    max-width: 100vw;

    ${responsive.mobile} {
      width: 100%;
    }
  `,

  docker: css`
    width: 100%;
    padding: ${token.paddingSM}px;
  `,
}));
