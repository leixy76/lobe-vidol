'use client';

import { LobeHub } from '@lobehub/ui/brand';
import { createStyles } from 'antd-style';
import Link from 'next/link';
import { memo } from 'react';
import { Flexbox, FlexboxProps } from 'react-layout-kit';

import { ORG_NAME } from '@/constants/branding';
import { UTM_SOURCE } from '@/constants/url';
import { isCustomORG } from '@/constants/version';

const useStyles = createStyles(({ token, css }) => ({
  logoLink: css`
    line-height: 1;
    color: inherit;

    &:hover {
      color: ${token.colorLink};
    }
  `,
}));

const BrandWatermark = memo<Omit<FlexboxProps, 'children'>>(({ style, ...rest }) => {
  const { styles, theme } = useStyles();
  return (
    <Flexbox
      align={'center'}
      flex={'none'}
      gap={4}
      horizontal
      style={{ color: theme.colorTextDescription, fontSize: 12, ...style }}
      {...rest}
    >
      <span>Powered by</span>
      {isCustomORG ? (
        <span>{ORG_NAME}</span>
      ) : (
        <Link
          className={styles.logoLink}
          href={`https://lobehub.com?utm_source=${UTM_SOURCE}&utm_content=brand_watermark`}
          target={'_blank'}
        >
          <LobeHub size={20} type={'text'} />
        </Link>
      )}
    </Flexbox>
  );
});

export default BrandWatermark;
