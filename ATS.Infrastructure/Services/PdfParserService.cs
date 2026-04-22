using iText.Kernel.Pdf;
using iText.Kernel.Pdf.Canvas.Parser;
using iText.Kernel.Pdf.Canvas.Parser.Listener;

namespace ATS.Infrastructure.Services;

public class PdfParserService
{
    public string ExtractText(Stream pdfStream)
    {
        var text = new System.Text.StringBuilder();

        using var memoryStream = new MemoryStream();
        pdfStream.CopyTo(memoryStream);
        memoryStream.Position = 0;

        using var pdfReader = new PdfReader(memoryStream);
        using var pdfDocument = new PdfDocument(pdfReader);

        for (int page = 1; page <= pdfDocument.GetNumberOfPages(); page++)
        {
            var strategy = new SimpleTextExtractionStrategy();
            var pageText = PdfTextExtractor.GetTextFromPage(
                pdfDocument.GetPage(page), strategy);

            text.AppendLine(pageText);
        }

        return text.ToString().Trim();
    }
}