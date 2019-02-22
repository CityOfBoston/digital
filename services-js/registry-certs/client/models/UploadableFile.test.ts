import nock from 'nock';
import { autorun } from 'mobx';

import UploadableFile, { Status } from './UploadableFile';

jest.mock('../queries/delete-birth-certificate-uploaded-file');

import deleteBirthCertificateUploadedFile from '../queries/delete-birth-certificate-uploaded-file';
const deleteBirthCertificateUploadedFileMock: jest.MockInstance<
  ReturnType<typeof deleteBirthCertificateUploadedFile>,
  Parameters<typeof deleteBirthCertificateUploadedFile>
> = deleteBirthCertificateUploadedFile as any;

const serverSuccessResponse = '{"filename":"sample.pdf","attachmentKey":"17"}';
const serverErrorResponse =
  '{"error":{"code":500,"message":"Internal Server Error"}}';

describe('UploadableFile', () => {
  afterEach(() => nock.cleanAll());

  it('will instantiate', () => {
    const file = sampleFile();

    expect(file.status).toBe('idle');
  });

  it('will continually reflect progress as upload proceeds', () => {});

  it('will receive an attachmentKey from the server on upload success', async () => {
    const file = sampleFile('idle');

    nock('http://localhost')
      .post('/upload')
      .reply(200, serverSuccessResponse);

    await sampleFileUploadComplete(file);

    expect(file.uploadResponse && file.uploadResponse.attachmentKey).toBe('17');
    expect(file.status).toBe('success');
  });

  it('will have the status “uploadError” if the server returns an error', async () => {
    const file = sampleFile('idle');

    nock('http://localhost')
      .post('/upload')
      .reply(500, serverErrorResponse);

    await sampleFileUploadComplete(file);

    expect(file.status).toBe('uploadError');
  });

  it('will have the status “deleted” if file is successfully deleted from the server', async () => {
    const file = sampleFile('idle');

    nock('http://localhost')
      .post('/upload')
      .reply(200, serverSuccessResponse);

    await sampleFileUploadComplete(file);

    deleteBirthCertificateUploadedFileMock.mockReturnValue(
      Promise.resolve({ success: true, message: null })
    );

    await file.delete();

    expect(file.status).toBe('deleted');
    expect(deleteBirthCertificateUploadedFileMock).toHaveBeenCalledWith(
      expect.anything(),
      'sampleId',
      '17'
    );
  });

  xit('will have the status “deletionError” if file is not deleted from the server', () => {});
});

function sampleFile(status?: Status, progress?: number) {
  return new UploadableFile(
    new File([], 'sample.pdf', { type: 'application/pdf' }),
    'sampleId',
    status,
    progress
  );
}

function sampleFileUploadComplete(file: UploadableFile) {
  return new Promise(resolve => {
    file.upload();

    const disposer = autorun(() => {
      if (file.status !== 'uploading') {
        disposer();
        resolve();
      }
    });
  });
}
