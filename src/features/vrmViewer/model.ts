import { VRM, VRMLoaderPlugin, VRMUtils } from '@pixiv/three-vrm';
import * as THREE from 'three';
import { AnimationAction, AnimationClip } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

import { convert } from '@/libs/VMDAnimation/vmd2vrmanim';
import { bindToVRM, toOffset } from '@/libs/VMDAnimation/vmd2vrmanim.binding';
import IKHandler from '@/libs/VMDAnimation/vrm-ik-handler';
import { VRMAnimation } from '@/libs/VRMAnimation/VRMAnimation';
import { loadMixamoAnimation } from '@/libs/VRMAnimation/loadMixamoAnimation';
import { loadVRMAnimation } from '@/libs/VRMAnimation/loadVRMAnimation';
import { VRMLookAtSmootherLoaderPlugin } from '@/libs/VRMLookAtSmootherLoaderPlugin/VRMLookAtSmootherLoaderPlugin';
import { Screenplay } from '@/types/touch';

import { EmoteController } from '../emoteController/emoteController';
import { LipSync } from '../lipSync/lipSync';

/**
 * 3Dキャラクターを管理するクラス
 */
export class Model {
  public vrm?: VRM | null;
  public mixer?: THREE.AnimationMixer;
  public ikHandler?: IKHandler;
  public emoteController?: EmoteController;

  private _lookAtTargetParent: THREE.Object3D;
  private _lipSync?: LipSync;
  private _action: AnimationAction | undefined;
  private _clip: AnimationClip | undefined;

  constructor(lookAtTargetParent: THREE.Object3D) {
    this._lookAtTargetParent = lookAtTargetParent;
    this._lipSync = new LipSync(new AudioContext());
    this._action = undefined;
    this._clip = undefined;
  }

  public async loadVRM(url: string): Promise<void> {
    const loader = new GLTFLoader();
    loader.crossOrigin = 'anonymous';

    loader.register(
      (parser) =>
        new VRMLoaderPlugin(parser, {
          lookAtPlugin: new VRMLookAtSmootherLoaderPlugin(parser),
          autoUpdateHumanBones: true,
        }),
    );

    const gltf = await loader.loadAsync(url);

    // 提升性能
    VRMUtils.removeUnnecessaryVertices(gltf.scene);
    VRMUtils.removeUnnecessaryJoints(gltf.scene);

    const vrm = (this.vrm = gltf.userData.vrm);
    vrm.scene.name = 'VRMRoot';

    VRMUtils.rotateVRM0(vrm);
    this.mixer = new THREE.AnimationMixer(vrm.scene);

    this.ikHandler = IKHandler.get(vrm);

    this.emoteController = new EmoteController(vrm, this._lookAtTargetParent);
  }

  public unLoadVrm() {
    if (this.vrm) {
      VRMUtils.deepDispose(this.vrm.scene);
      this.vrm = null;
    }
  }

  /**
   * VRMアニメーションを読み込む
   *
   * https://github.com/vrm-c/vrm-specification/blob/master/specification/VRMC_vrm_animation-1.0/README.ja.md
   */
  public async loadAnimation(vrmAnimation: VRMAnimation): Promise<void> {
    const { vrm, mixer } = this;
    if (!vrm || !mixer) {
      console.error('You have to load VRM first');
      return;
    }
    if (this._action) this._action.stop();
    if (this._clip) {
      mixer.uncacheAction(this._clip);
      mixer.uncacheClip(this._clip);
      this._clip = undefined;
    }

    const clip = vrmAnimation.createAnimationClip(vrm);

    const action = mixer.clipAction(clip);
    action.play();
    this._action = action;
    this._clip = clip;
  }

  public async loadIdleAnimation() {
    const vrma = await loadVRMAnimation('/idle_loop.vrma');
    if (vrma) this.loadAnimation(vrma);
  }

  public async loadFBX(animationUrl: string) {
    const { vrm, mixer } = this;

    if (vrm && mixer) {
      mixer.stopAllAction();
      if (this._action) this._action.stop();
      if (this._clip) {
        mixer.uncacheAction(this._clip);
        mixer.uncacheClip(this._clip);
        this._clip = undefined;
      }
      // Load animation
      const clip = await loadMixamoAnimation(animationUrl, vrm);
      // Apply the loaded animation to mixer and play
      const action = mixer.clipAction(clip);
      action.play();
      this._action = action;
      this._clip = clip;
    }
  }

  /**
   * 播放舞蹈
   * @param buffer ArrayBuffer
   */
  public async dance(buffer: ArrayBuffer) {
    const { vrm, mixer } = this;
    if (vrm && mixer) {
      mixer.stopAllAction();
      if (this._action) this._action.stop();
      if (this._clip) {
        mixer.uncacheAction(this._clip);
        mixer.uncacheClip(this._clip);
        this._clip = undefined;
      }
      const animation = convert(buffer, toOffset(vrm));
      const clip = bindToVRM(animation, vrm);
      const action = mixer.clipAction(clip);
      action.play(); // play animation
      this._action = action;
      this._clip = clip;
    }
  }

  public async stopDance() {
    const { vrm, mixer } = this;
    if (vrm && mixer) {
      mixer.stopAllAction();
      this.ikHandler?.disableAll();
      await this.loadIdleAnimation();
    }
  }
  /**
   * 语音播放，配合人物表情动作
   * @param buffer
   * @param screenplay
   */
  public async speak(buffer: ArrayBuffer, screenplay: Screenplay) {
    this.emoteController?.playEmotion(screenplay.emotion);
    this._lipSync?.playFromArrayBuffer(buffer);
  }

  /**
   * 停止语音
   */
  public stopSpeak() {
    this._lipSync?.stopPlay();
    this.emoteController?.playEmotion('neutral');
  }

  public update(delta: number): void {
    if (this._lipSync) {
      const { volume } = this._lipSync.update();
      this.emoteController?.lipSync('aa', volume);
    }

    this.emoteController?.update(delta);
    this.mixer?.update(delta);
    this.vrm?.update(delta);
    this.ikHandler?.update();
  }
}
