import { VRM } from '@pixiv/three-vrm';

import { MotionManager } from './motionManager';
import { MotionPresetName, motionPresetMap } from './motionPresetMap';
import { MotionFileType } from './type';

export class MotionController {
  private motionManager: MotionManager;

  constructor(vrm: VRM) {
    this.motionManager = new MotionManager(vrm);
  }

  public async preloadMotion(motion: MotionPresetName) {
    const { type, url } = this.getMotionInfo(motion);
    await this.motionManager.preloadMotion(type, url);
  }

  public async preloadMotionUrl(fileType: MotionFileType, url: string) {
    await this.motionManager.preloadMotion(fileType, url);
  }

  /**
   * 目前都是 Mixamo 的 FBX 文件
   * @param motion
   */
  public playMotion(motion: MotionPresetName) {
    const { type, url } = this.getMotionInfo(motion);
    this.motionManager.loadMotionUrl(type, url);
  }

  public playMotionUrl(fileType: MotionFileType, url: string, loop: boolean = true) {
    this.motionManager.loadMotionUrl(fileType, url, loop);
  }

  public getMotionInfo(motion: MotionPresetName) {
    return motionPresetMap[motion];
  }

  public stopMotion() {
    this.motionManager.disposeCurrentMotion();
  }

  public update(delta: number) {
    this.motionManager.update(delta);
  }
}
