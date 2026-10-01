import { File } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { shareInvoicePdf } from '../shareInvoicePdf';

jest.mock('expo-file-system', () => ({
  Paths: { cache: {} },
  File: Object.assign(
    jest.fn().mockImplementation(() => ({})),
    { downloadFileAsync: jest.fn() },
  ),
}));
jest.mock('expo-sharing');

const mockedDownload = File.downloadFileAsync as jest.Mock;
const mockedShareAsync = Sharing.shareAsync as jest.Mock;

describe('shareInvoicePdf', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('downloads the PDF locally, then opens the native share sheet with it', async () => {
    mockedDownload.mockResolvedValue({ uri: 'file:///cache/faktura-133.pdf' });

    await shareInvoicePdf('https://example.com/invoices/133.pdf', 133);

    expect(mockedDownload).toHaveBeenCalledWith(
      'https://example.com/invoices/133.pdf',
      expect.anything(),
      { idempotent: true },
    );
    expect(mockedShareAsync).toHaveBeenCalledWith('file:///cache/faktura-133.pdf', {
      mimeType: 'application/pdf',
    });
  });

  it('falls back to a generic filename when the invoice has no number yet', async () => {
    mockedDownload.mockResolvedValue({ uri: 'file:///cache/faktura-okand.pdf' });

    await shareInvoicePdf('https://example.com/invoices/9.pdf', null);

    expect(mockedShareAsync).toHaveBeenCalledWith('file:///cache/faktura-okand.pdf', {
      mimeType: 'application/pdf',
    });
  });
});
