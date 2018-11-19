import TranslateDialog from './TranslateDialog';

describe('findLanguage', () => {
  it('defaults to null', () => {
    const code = TranslateDialog.findLanguage([
      { code: 'fr', region: 'CA', quality: 1.0 },
    ]);

    expect(code).toEqual(null);
  });

  it('detects Vietnamese', () => {
    const code = TranslateDialog.findLanguage([
      { code: 'vi', region: null, quality: 1.0 },
    ]);

    expect(code).toEqual('vi');
  });

  it('detects a Chinese region', () => {
    const code = TranslateDialog.findLanguage([
      { code: 'zh', region: 'TW', quality: 1 },
      { code: 'zh', region: null, quality: 0.8 },
      { code: 'en', region: 'US', quality: 0.6 },
      { code: 'en', region: null, quality: 0.4 },
    ]);

    expect(code).toEqual('zh-TW');
  });
});
