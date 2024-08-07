import { Progress } from 'antd';
import classNames from 'classnames';
import React, { memo, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import PageLoading from '@/components/PageLoading';
import { useLoadModel } from '@/hooks/useLoadModel';
import { useGlobalStore } from '@/store/global';
import { Agent } from '@/types/agent';
import { getModelPathByAgentId } from '@/utils/file';
import storage from '@/utils/storage';

import ToolBar from './ToolBar';
import { useStyles } from './style';

interface Props {
  agent: Agent;
  className?: string;
  height?: number | string;
  style?: React.CSSProperties;
  width?: number | string;
}

function AgentViewer(props: Props) {
  const { className, style, height, agent, width } = props;
  const { styles } = useStyles();
  const ref = useRef<HTMLDivElement>(null);
  const viewer = useGlobalStore((s) => s.viewer);
  const { t } = useTranslation('features');

  const { downloading, percent, fetchModelBlob } = useLoadModel();

  const canvasRef = useCallback(
    (canvas: HTMLCanvasElement) => {
      if (canvas) {
        viewer.setup(canvas);
        const modelPath = getModelPathByAgentId(agent.agentId);
        storage.getItem(modelPath).then((blob) => {
          if (!blob) {
            viewer.unloadVRM();
            fetchModelBlob(agent.agentId, agent.meta.model!).then((res) => {
              if (res) {
                const modelUrl = URL.createObjectURL(res);
                viewer.loadVrm(modelUrl);
              }
            });
          } else {
            const modelUrl = URL.createObjectURL(blob as Blob);
            viewer.loadVrm(modelUrl);
          }
        });

        // Drag and DropでVRMを差し替え
        canvas.addEventListener('dragover', function (event) {
          event.preventDefault();
        });

        canvas.addEventListener('drop', function (event) {
          event.preventDefault();

          const files = event.dataTransfer?.files;
          if (!files) {
            return;
          }

          const file = files[0];
          if (!file) {
            return;
          }

          const file_type = file.name.split('.').pop();
          switch (file_type) {
            case 'vrm': {
              const blob = new Blob([file], { type: 'application/octet-stream' });
              const url = window.URL.createObjectURL(blob);
              viewer.loadVrm(url);

              break;
            }
            case 'fbx': {
              const blob = new Blob([file], { type: 'application/octet-stream' });
              const url = window.URL.createObjectURL(blob);
              viewer.model?.loadFBX(url);

              break;
            }
            case 'vmd': {
              file.arrayBuffer().then((data) => {
                viewer.model?.dance(data);
              });

              break;
            }
            // No default
          }
        });
      }
    },
    [viewer, agent.agentId],
  );

  return (
    <div
      ref={ref}
      className={classNames(styles.viewer, className)}
      style={{ height, width, ...style }}
    >
      <ToolBar className={styles.toolbar} viewer={viewer} />
      {downloading ? (
        <PageLoading
          title={t('toolBar.downloadModel')}
          description={<Progress percent={percent} size="small" steps={50} />}
          className={styles.loading}
        />
      ) : null}
      <canvas ref={canvasRef} className={styles.canvas}></canvas>
    </div>
  );
}

export default memo(AgentViewer);
