export const sampleCompany = "Maple Shore Beverages Inc. (fictional)";

// Illustrative documents. Every party, number and amount is invented.
export const sampleInvoice = `COMMERCIAL INVOICE (ILLUSTRATIVE SAMPLE - NOT A REAL DOCUMENT)
Invoice No: NA-48213          Date: 2026-09-14
Seller: Lakeshore Packaging Supply LLC, Buffalo, New York, USA
Buyer: Maple Shore Beverages Inc. (fictional), Ontario, Canada
Country of origin of goods: United States
Currency: CAD

Line 1: Aluminum beverage cans, 355 mL, embossed, for filling with carbonated drinks. Qty 400,000 units. Line total CAD 40,000.00. CUSMA certification ref: CERT-US-0914-A.
Line 2: PET bottles, 500 mL, clear, for bottled water. Qty 150,000 units. Line total CAD 15,000.00. CUSMA certification: none provided.
Line 3: Empty glass bottles for soft drinks, amber. Qty 100,000 units. Line total CAD 20,000.00. CUSMA certification ref: CERT-US-0914-B.
Line 4: Plastic screw caps, 28 mm, for PET bottles. Qty 150,000 units. Line total CAD 4,500.00. CUSMA certification ref: CERT-US-0914-B.

Payment terms: Net 30`;

export const sampleCad = `COMMERCIAL ACCOUNTING DECLARATION (ILLUSTRATIVE SAMPLE - NOT A REAL DOCUMENT)
Importer: Maple Shore Beverages Inc. (fictional)     Accounting date: 2026-09-17
Port of entry: Fort Erie     Currency: CAD
Origin: US     Related invoice: NA-48213

Line | Tariff classification | Treatment | Value for duty | Customs duty paid
1 | 7612.90.99.90 | MFN | 40,000.00 | 2,600.00
2 | 3923.30.90.90 | MFN | 15,000.00 | 975.00
3 | 7010.90.00.93 | MFN | 20,000.00 | 0.00
4 | 3923.50.90.90 | UST | 4,500.00 | 0.00

GST and other taxes are shown on a separate statement.`;
