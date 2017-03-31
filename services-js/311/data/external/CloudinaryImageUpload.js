// @flow

import 'isomorphic-fetch';
import { observable, computed, action } from 'mobx';

export type Config = {
  url: string,
  uploadPreset: string,
}

export type UploadResponse = {
  bytes: number,
  created_at: string,
  delete_token: string,
  etag: string,
  format: string,
  height: number,
  original_filename: string,
  public_id: string,
  resource_type: string,
  secure_url: string,
  signature: string,
  tags: string[],
  type: string,
  url: string,
  version: number,
  width: number,
};

export default class CloudinaryImageUpload {
  config: Config;

  @observable.ref _file: ?File = null;

  @observable.ref uploadRequest: ?XMLHttpRequest = null;
  @observable uploadingProgress: number = 0;

  @observable.ref uploadResponse: ?UploadResponse = null;
  @observable errorMessage: ?string = null;

  constructor(config: Config) {
    this.config = config;
  }

  @computed get file(): ?File {
    return this._file;
  }

  set file(file: ?File) {
    this._file = file;
    this.errorMessage = null;

    // If a file is already uploaded, we want to try and delete it just to
    // keep things tidy. We don't really care if this call succeeds or fails
    // (i.e. we wouldn't fail a "remove" if the API call didn't work)
    if (this.uploadResponse) {
      const formData = new FormData();
      formData.append('token', this.uploadResponse.delete_token);

      fetch(`${this.config.url}/delete_by_token`, {
        method: 'POST',
        body: formData,
      });

      this.uploadResponse = null;
    }

    if (this.uploadRequest) {
      this.uploadRequest.abort();
      this.uploadRequest = null;
    }

    if (file) {
      const { config } = this;
      const uploadRequest = new XMLHttpRequest();
      this.uploadRequest = uploadRequest;

      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', config.uploadPreset);

      uploadRequest.onload = this.handleLoad;
      uploadRequest.onerror = this.handleError;
      uploadRequest.onloadend = this.handleLoadEnd;

      if (uploadRequest.upload) {
        uploadRequest.upload.onprogress = this.handleProgress;
      }

      uploadRequest.open('POST', `${config.url}/image/upload`, true);
      uploadRequest.send(formData);

      this.uploadingProgress = 0;
    }
  }

  @computed get uploading(): boolean {
    return !!this.uploadRequest;
  }

  @computed get loaded(): boolean {
    return !!this.uploadResponse;
  }

  @action.bound
  handleProgress(ev: ProgressEvent) {
    if (ev.lengthComputable) {
      this.uploadingProgress = ev.loaded / ev.total;
    }
  }

  @action.bound
  handleLoad(ev: ProgressEvent) {
    const xhr = ev.target;
    if (!(xhr instanceof XMLHttpRequest)) {
      return;
    }

    let json = null;
    try {
      json = JSON.parse(xhr.responseText);
    } catch (e) {
      // ignore
    }

    if (xhr.status >= 200 && xhr.status <= 299) {
      this.uploadResponse = json;
    } else {
      if (json) {
        this.errorMessage = json.error.message;
      } else {
        this.errorMessage = xhr.statusText;
      }
    }
  }

  @action.bound
  handleError(ev: ?ProgressEvent) {
    if (!ev || ev.target !== this.uploadRequest || !this.uploadRequest) {
      return;
    }

    this._file = null;
    if (!this.uploadRequest.aborted) {
      this.errorMessage = 'Network error during upload';
    }
  }

  @action.bound
  handleLoadEnd(ev: ProgressEvent) {
    if (ev.target !== this.uploadRequest) {
      return;
    }

    this.uploadRequest = null;
  }

  @computed get previewUrl(): ?string {
    if (this.file && typeof this.file.preview === 'string') {
      return this.file.preview;
    } else {
      return null;
    }
  }

  @computed get mediaUrl(): ?string {
    return this.uploadResponse ? this.uploadResponse.secure_url : null;
  }
}
