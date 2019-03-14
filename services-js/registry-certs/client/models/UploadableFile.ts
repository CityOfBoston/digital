import { observable, computed, action, runInAction } from 'mobx';

import getConfig from 'next/config';

import {
  FetchGraphql,
  makeFetchGraphql,
} from '@cityofboston/next-client-common';

import { UploadResponse } from '../../lib/upload-types';

import deleteBirthCertificateUploadedFile from '../queries/delete-birth-certificate-uploaded-file';

export type Status =
  | 'idle'
  | 'success'
  | 'uploading'
  | 'canceling'
  | 'deleting'
  | 'deleted'
  | 'uploadError'
  | 'deletionError';

// todo: ie11 not displaying files in supporting docs list

/**
 * Binary files provided by the user are immediately uploaded to (or deleted
 * from) the db server. Because an input may accept multiple files at once,
 * each UploadableFile is responsible for uploading or deleting its File on the
 * server.
 */
export default class UploadableFile {
  private readonly fetchGraphql: FetchGraphql;
  readonly file: File;
  private readonly uploadSessionId: string;
  private readonly label: string | undefined;

  @observable status: Status;
  @observable progress: number; // 0 - 100

  @observable.ref uploadRequest: XMLHttpRequest | null = null;
  @observable.ref uploadResponse: UploadResponse | null = null;
  @observable errorMessage: string | null = null;

  constructor(file: File, uploadSessionId: string, label?: string) {
    this.fetchGraphql = fetchGraphql();

    this.file = file;
    this.label = label;
    this.uploadSessionId = uploadSessionId;
    this.status = 'idle';
    this.progress = 0;
  }

  @action
  upload() {
    const uploadRequest = new XMLHttpRequest();
    const formData = new FormData();

    // Explicitly setting the filename keeps IE from sending the whole file’s
    // path as the file name.
    formData.append('file', this.file, this.file.name);
    formData.append('type', 'BC');
    if (this.label) {
      formData.append('label', this.label);
    }
    formData.append('uploadSessionId', this.uploadSessionId);

    uploadRequest.onload = this.handleLoad;
    uploadRequest.onerror = this.handleError;
    uploadRequest.onloadend = this.handleLoadEnd;

    if (uploadRequest.upload) {
      uploadRequest.upload.onprogress = this.handleProgress;
    }

    this.progress = 0;
    this.status = 'uploading';

    uploadRequest.open('POST', '/upload');
    uploadRequest.send(formData);
  }

  // If the user is trying to cancel an in-progress upload, we want to express
  // the appropriate status while the cancellation is pending.
  @action
  async delete(didCancel?: boolean): Promise<boolean> {
    if (!this.attachmentKey) {
      return false;
    }

    didCancel ? (this.status = 'canceling') : (this.status = 'deleting');

    try {
      const result = await deleteBirthCertificateUploadedFile(
        this.fetchGraphql,
        this.uploadSessionId,
        this.attachmentKey
      );

      if (result.success) {
        runInAction(() => {
          this.status = 'deleted';
        });

        return true;
      } else {
        throw new Error(result.message || 'Unknown error');
      }
    } catch (e) {
      runInAction(() => {
        this.status = 'deletionError';
      });

      return false;
    }
  }

  @action.bound
  handleLoad(ev: ProgressEvent) {
    const xhr = ev.target;
    let json: UploadResponse | null = null;

    if (!(xhr instanceof XMLHttpRequest)) {
      return;
    }

    try {
      json = JSON.parse(xhr.responseText);
    } catch (e) {
      this.status = 'uploadError';
      this.errorMessage = `Upload failed: ${xhr.statusText}`;
      return;
    }

    if (xhr.status >= 200 && xhr.status <= 299) {
      this.status = 'success';
      this.uploadResponse = json;
    } else {
      this.status = 'uploadError';
      this.errorMessage = `Upload failed: ${xhr.statusText}`;
    }
  }

  @action.bound
  handleProgress(ev: ProgressEvent) {
    if (ev.lengthComputable) {
      this.progress = ev.loaded / ev.total * 100;
    }
  }

  @action.bound
  handleError(ev: ProgressEvent | null) {
    this.status = 'uploadError';

    if (!ev || ev.target !== this.uploadRequest || !this.uploadRequest) {
      return;
    }

    if (this.uploadRequest.status !== XMLHttpRequest.UNSENT) {
      this.errorMessage = 'Network error';
    }
  }

  @action.bound
  handleLoadEnd(ev: ProgressEvent) {
    if (ev.target !== this.uploadRequest) {
      return;
    }

    this.uploadRequest = null;
    this.progress = 0;
  }

  // Unique value returned from the server on upload success. Used to identify
  // files on the server when deleting.
  @computed
  get attachmentKey(): string | null {
    return this.uploadResponse ? this.uploadResponse.attachmentKey : null;
  }
}

function fetchGraphql(): FetchGraphql {
  const config = getConfig();

  return makeFetchGraphql(config);
}
