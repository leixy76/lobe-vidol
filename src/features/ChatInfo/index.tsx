'use client';

import { DraggablePanel } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import React, { useState } from 'react';
import { Flexbox } from 'react-layout-kit';

import { CHAT_INFO_MAX_WIDTH, CHAT_INFO_WIDTH } from '@/constants/token';
import Header from '@/features/ChatInfo/Header';
import ChatList from '@/features/ChatList';
import MotionList from '@/features/MotionList';
import PlayList from '@/features/PlayList';
import PostureList from '@/features/PostureList';
import { useGlobalStore } from '@/store/global';

import { Tab } from './type';

const useStyles = createStyles(({ css, token }) => ({
  content: css`
    position: relative;
    display: flex;
    flex-direction: column;
  `,
  header: css`
    border-bottom: 1px solid ${token.colorBorder};
  `,
}));

export default () => {
  const [showChatSidebar, setChatSidebar] = useGlobalStore((s) => [
    s.showChatSidebar,
    s.setChatSidebar,
  ]);

  const [tab, setTab] = useState<Tab>(Tab.History);

  const { styles } = useStyles();

  return (
    <DraggablePanel
      classNames={{ content: styles.content }}
      minWidth={CHAT_INFO_WIDTH}
      maxWidth={CHAT_INFO_MAX_WIDTH}
      mode={'fixed'}
      onExpandChange={(expand) => {
        setChatSidebar(expand);
      }}
      expand={showChatSidebar}
      placement={'right'}
    >
      <Header tab={tab} setTab={setTab} />
      <Flexbox height={'calc(100vh - 128px)'}>
        {tab === Tab.History && <ChatList />}
        {tab === Tab.PlayList && <PlayList />}
        {tab === Tab.Motions && <MotionList />}
        {tab === Tab.Posture && <PostureList />}
      </Flexbox>
    </DraggablePanel>
  );
};
