import { observable, action, runInAction, computed } from 'mobx';

import getConfig from 'next/config';

import {
  FetchGraphql,
  makeFetchGraphql,
} from '@cityofboston/next-client-common';

import { UploadResponse } from '../../lib/upload-types';
import { CertificateType } from '../types';

import deleteBirthCertificateUploadedFile from '../queries/delete-birth-certificate-uploaded-file';
import deleteMarriageCertificateUploadedFile from '../queries/delete-marriage-certificate-uploaded-file';

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

export type UploadableFileRecord = {
  readonly attachmentKey: string | null;
  readonly name: string | null;
};

export type minXMLHttpRequest = {
  statusCode: number;
  statusText: string;
  error: string;
  message: string;
};

/**
 * Binary files provided by the user are immediately uploaded to (or deleted
 * from) the db server. Because an input may accept multiple files at once,
 * each UploadableFile is responsible for uploading or deleting its File on the
 * server.
 */
export default class UploadableFile {
  private readonly fetchGraphql: FetchGraphql;
  readonly file: File | null;
  readonly name: string;

  private readonly uploadSessionId: string;
  private readonly label: string | undefined;
  private readonly filesize: number;

  @observable status: Status;
  @observable progress: number; // 0 - 100
  @observable attachmentKey: string | null;

  @observable.ref uploadRequest: XMLHttpRequest | null = null;
  @observable errorMessage: string | null = null;

  public static fromRecord(
    rec: UploadableFileRecord,
    uploadSessionId: string,
    label?: string
  ): UploadableFile {
    const uploadableFile = new UploadableFile(
      rec.name || 'unknown file name',
      uploadSessionId,
      label
    );

    uploadableFile.status = 'success';
    uploadableFile.attachmentKey = rec.attachmentKey;

    return uploadableFile;
  }

  constructor(file: File | string, uploadSessionId: string, label?: string) {
    this.fetchGraphql = fetchGraphql();
    const megabyteInt = 1048576;

    if (file instanceof File) {
      this.file = file;
      this.name = file.name;

      const modulus = file.size % megabyteInt;
      const percentRemainder = parseFloat((modulus / megabyteInt).toFixed(2));
      const wholeInt = (file.size - modulus) / megabyteInt;
      this.filesize = parseFloat((wholeInt + percentRemainder).toFixed(2));
    } else {
      this.file = null;
      this.name = file;
      this.filesize = 0;
    }

    this.label = label;
    this.uploadSessionId = uploadSessionId;
    this.status = 'idle';
    this.progress = 0;
    this.attachmentKey = null;
  }

  getStatusText = (xhr: XMLHttpRequest | minXMLHttpRequest) => {
    return xhr.statusText &&
      typeof xhr.statusText === 'string' &&
      xhr.statusText.length > 0
      ? `: ${xhr.statusText}`
      : '';
  };

  @computed
  get record(): UploadableFileRecord | null {
    // We only want to save files that have uploaded.
    if (this.status === 'success') {
      return {
        attachmentKey: this.attachmentKey || null,
        name: this.file ? this.file.name : null,
      };
    } else {
      return null;
    }
  }

  @action
  upload(certificateType: CertificateType) {
    if (!this.file) {
      throw new Error(
        'upload called on UploadableFile that came from an UploadableFileRecord'
      );
    }

    const uploadRequest = new XMLHttpRequest();
    const formData = new FormData();
    const orderType = certificateType === 'marriage' ? 'MC' : 'BC';

    // Explicitly setting the filename keeps IE from sending the whole file’s
    // path as the file name.
    formData.append('file', this.file, this.file.name);
    formData.append('type', orderType);
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
  async delete(
    certificateType: CertificateType,
    didCancel?: boolean
  ): Promise<boolean> {
    if (!this.attachmentKey) {
      return false;
    }

    didCancel ? (this.status = 'canceling') : (this.status = 'deleting');

    try {
      const result =
        certificateType === 'birth'
          ? await deleteBirthCertificateUploadedFile(
              this.fetchGraphql,
              this.uploadSessionId,
              this.attachmentKey
            )
          : await deleteMarriageCertificateUploadedFile(
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
    let statMessage: string = '';

    if (!(xhr instanceof XMLHttpRequest)) {
      return;
    }

    // TODO: We are limiting uploads to 15mb, this is an ad-hoc approach to prevent image from uploading if its greater than the size limit
    if (this.filesize > 15) {
      this.status = 'uploadError';
      this.errorMessage = `Upload failed: Image Too Large`;
      return;
    }

    try {
      json = JSON.parse(xhr.responseText);
    } catch (e) {
      statMessage = this.getStatusText(xhr);
      this.status = 'uploadError';
      this.errorMessage = `Upload failed${statMessage}`;
      return;
    }

    if (xhr.status >= 200 && xhr.status <= 299 && json) {
      this.status = 'success';
      this.attachmentKey = json.attachmentKey;
    } else {
      statMessage = this.getStatusText(xhr);
      this.status = 'uploadError';
      this.errorMessage = `Upload failed${statMessage}`;
    }
  }

  @action.bound
  handleProgress(ev: ProgressEvent) {
    if (ev.lengthComputable) {
      this.progress = (ev.loaded / ev.total) * 100;
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
}

function fetchGraphql(): FetchGraphql {
  const config = getConfig();

  return makeFetchGraphql(config);
}
