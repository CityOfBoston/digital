// @flow

import 'isomorphic-fetch';
import { observable, computed, action, reaction } from 'mobx';
import type { IObservable } from 'mobx';

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

// Uploader that pushes Files to Cloudinary. Expects to get File objects from
// react-dropzone, which have a preview URL on them.
//
// The pattern of this file is to have it act on the main mobx store without
// coupling the mobx store to it. Hence we accept an observable object that
// we set based on this object's results.
export default class CloudinaryImageUpload {
  config: ?Config = null;

  @observable.ref file: ?File = null;

  @observable.ref uploadRequest: ?XMLHttpRequest = null;
  @observable uploadingProgress: number = 0;

  @observable.ref uploadResponse: ?UploadResponse = null;
  @observable errorMessage: ?string = null;

  // set this to get it updated with the URL after upload
  @observable adoptedUrlObservable: ?IObservable<?string> = null;

  constructor() {
    // reaction to update our observed mediaURL when we get a new uploadedUrl
    reaction(
      () => this.uploadedUrl,
      (uploadedUrl) => {
        if (this.adoptedUrlObservable) {
          this.adoptedUrlObservable.set(uploadedUrl);
        }
      },
    );
  }

  // file is expected to also have a .preview field set by react-dropzone
  @action
  upload(file: File) {
    const { config } = this;

    if (!config) {
      throw new Error('Trying to upload a file without configuring Cloudinary');
    }

    this.remove();

    this.file = file;

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

  @action
  remove() {
    const { config } = this;

    this.file = null;
    this.errorMessage = null;

    // If a file is already uploaded, we want to try and delete it just to
    // keep things tidy. We don't really care if this call succeeds or fails
    // (i.e. we wouldn't fail a "remove" if the API call didn't work)
    if (this.uploadResponse) {
      if (!config) {
        throw new Error('Trying to remove a file without configuring Cloudinary');
      }

      const formData = new FormData();
      formData.append('token', this.uploadResponse.delete_token);

      fetch(`${config.url}/delete_by_token`, {
        method: 'POST',
        body: formData,
      });

      this.uploadResponse = null;
    }

    if (this.uploadRequest) {
      this.uploadRequest.abort();
      this.uploadRequest = null;
    }

    // In all cases, remove the adopted URL. The reaction above will only update
    // it if we already had an uploaded file, because uploadedUrl would change.
    // If we didn't and someone just called remove() after pressing "Back" to
    // the form, we still need to clear the URL.
    if (this.adoptedUrlObservable) {
      this.adoptedUrlObservable.set(null);
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

    this.file = null;
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

  @computed get uploadedUrl(): ?string {
    return this.uploadResponse ? this.uploadResponse.secure_url : null;
  }

  @computed get displayUrl(): ?string {
    return this.previewUrl || (this.adoptedUrlObservable && this.adoptedUrlObservable.get());
  }

  @computed get canRemove(): boolean {
    return this.loaded || !!(this.adoptedUrlObservable && this.adoptedUrlObservable.get());
  }
}
