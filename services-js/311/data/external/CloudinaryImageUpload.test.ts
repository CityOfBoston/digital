import FakeXMLHttpRequest from 'fake-xml-http-request';
import fetchMock from 'fetch-mock';

import { reaction } from 'mobx';

import CloudinaryImageUpload, { UploadResponse } from './CloudinaryImageUpload';

let previousXMLHttpRequest;

const FAKE_CONFIG = {
  url: 'https://cloudinary',
  uploadPreset: 'preset-code',
};

const FAKE_UPLOAD_RESPONSE: UploadResponse = {
  public_id: 'cob-311-staging/poaqtvjcgoiuspnz4fak',
  version: 1490979693,
  signature: 'bdd21f61ffec31069df8a826b4c2330cbb3dd452',
  width: 1536,
  height: 974,
  format: 'jpg',
  resource_type: 'image',
  created_at: '2017-03-31T17:01:33Z',
  tags: [],
  bytes: 211575,
  type: 'upload',
  etag: '5896cf0797b48ebe199e054b2d20d908',
  url:
    'http://res.cloudinary.com/spot-boston/image/upload/v1490979693/cob-311-staging/poaqtvjcgoiuspnz4fak.jpg',
  secure_url:
    'https://res.cloudinary.com/spot-boston/image/upload/v1490979693/cob-311-staging/poaqtvjcgoiuspnz4fak.jpg',
  original_filename: 'Screen Shot 2017-02-22 at 11.17.52 AM',
  delete_token:
    'ebfcb90e9a00a99170dc4fb92339f150f3d556a7fa1d21f17bc1daa680a4286fa8843ad653b33b8fb9969f9d086943d33e0835a77ac2b842f953525bb722929293d1f913d8da9c7296b96c29fcae867bd9cb6e83464a1e211de28007f6c8fb5c7c0786184da7cf6ff6c3aaff36ba6eae435d01bdf7589f4dbe0f0c43bd73946707610034dc1c8de7db1c455722d42148',
};

const FAKE_UPLOAD_ERROR = {
  error: { message: 'Upload preset must be whitelisted for unsigned uploads' },
};

beforeAll(() => {
  previousXMLHttpRequest = XMLHttpRequest;
  (global as any).XMLHttpRequest = FakeXMLHttpRequest;
});

afterAll(() => {
  (global as any).XMLHttpRequest = previousXMLHttpRequest;
});

beforeEach(() => {
  fetchMock.post(`${FAKE_CONFIG.url}/delete_by_token`, { result: 'ok' });
});

afterEach(fetchMock.restore);

let imageUpload;
let mediaUrl;
let mediaUrlUpdaterDisposer;
let file: any;

beforeEach(() => {
  imageUpload = new CloudinaryImageUpload();
  imageUpload.config = FAKE_CONFIG;

  file = {
    preview: 'data:file-preview',
  };

  mediaUrl = null;
  mediaUrlUpdaterDisposer = reaction(
    () => imageUpload.uploadedUrl,
    url => {
      mediaUrl = url;
    }
  );
});

afterEach(() => {
  mediaUrlUpdaterDisposer();
});

describe('upload', () => {
  it('starts uploading', () => {
    expect(imageUpload.loaded).toEqual(false);

    imageUpload.upload(file);

    expect(imageUpload.previewUrl).toEqual('data:file-preview');
    expect(imageUpload.uploading).toEqual(true);
    expect(imageUpload.loaded).toEqual(false);
    expect(imageUpload.uploadedUrl).toBeNull();
    expect(mediaUrl).toBeNull();
  });

  it('updates progress', () => {
    imageUpload.upload(file);

    const ev = {
      lengthComputable: true,
      total: 500,
      loaded: 100,
    };

    if (!imageUpload.uploadRequest) {
      expect(imageUpload.uploadRequest).toBeDefined();
      return;
    }

    if (!imageUpload.uploadRequest.upload) {
      expect(imageUpload.uploadRequest.upload).toBeDefined();
      return;
    }

    imageUpload.uploadRequest.upload.onprogress(ev as any);

    expect(imageUpload.uploadingProgress).toEqual(0.2);
  });

  it('provides a URL after upload succeeds', () => {
    imageUpload.upload(file);

    if (!imageUpload.uploadRequest) {
      expect(imageUpload.uploadRequest).toBeDefined();
      return;
    }

    (imageUpload.uploadRequest as FakeXMLHttpRequest).respond(
      200,
      { 'Content-Type': 'application/json' },
      JSON.stringify(FAKE_UPLOAD_RESPONSE)
    );

    expect(imageUpload.loaded).toEqual(true);
    expect(imageUpload.uploadedUrl).toEqual(FAKE_UPLOAD_RESPONSE.secure_url);
    expect(mediaUrl).toEqual(FAKE_UPLOAD_RESPONSE.secure_url);
    expect(imageUpload.uploading).toEqual(false);
    expect(imageUpload.errorMessage).toEqual(null);
  });

  it('shows a Cloudinary error message', () => {
    imageUpload.upload(file);

    if (!imageUpload.uploadRequest) {
      expect(imageUpload.uploadRequest).toBeDefined();
      return;
    }

    (imageUpload.uploadRequest as FakeXMLHttpRequest).respond(
      401,
      { 'Content-Type': 'application/json' },
      JSON.stringify(FAKE_UPLOAD_ERROR)
    );
    expect(imageUpload.errorMessage).toEqual(
      'Upload preset must be whitelisted for unsigned uploads'
    );
  });
});

describe('remove', () => {
  it('aborts if a new upload is made', () => {
    imageUpload.upload(file);
    imageUpload.remove();

    expect(imageUpload.uploading).toEqual(false);
    expect(imageUpload.loaded).toEqual(false);
    expect(imageUpload.previewUrl).toBeNull();
    expect(imageUpload.uploadedUrl).toBeNull();
    expect(mediaUrl).toBeNull();
  });

  it('deletes the image when removing', () => {
    imageUpload.upload(file);

    if (!imageUpload.uploadRequest) {
      expect(imageUpload.uploadRequest).toBeDefined();
      return;
    }

    (imageUpload.uploadRequest as FakeXMLHttpRequest).respond(
      200,
      { 'Content-Type': 'application/json' },
      JSON.stringify(FAKE_UPLOAD_RESPONSE)
    );

    imageUpload.remove();
    expect(fetchMock.called('https://cloudinary/delete_by_token')).toEqual(
      true
    );
    expect(imageUpload.loaded).toEqual(false);
    expect(imageUpload.previewUrl).toBeNull();
    expect(imageUpload.uploadedUrl).toBeNull();
    expect(mediaUrl).toBeNull();
  });
});
