import { normalizeCode, tariffLines } from "./tariff";

export type Certificate = "on_file" | "missing";
export type Treatment = "MFN" | "UST";
export type Confidence = "high" | "medium" | "low";
export type FindingStatus = "review_adjustment" | "needs_origin_evidence" | "no_rate_difference" | "cannot_assess";

export interface InvoiceLine {
	line: number;
	description: string;
	quantity: number | null;
	valueCad: number | null;
	size: string | null;
	certificate: Certificate;
}

export interface CadLine {
	line: number;
	declaredCode: string;
	treatment: Treatment;
	valueCad: number;
	dutyPaidCad: number;
}

export interface Classification {
	code: string;
	confidence: Confidence;
	reason: string;
}

const round = (amount: number) => Math.round(amount * 100) / 100;

// Rates, arithmetic and open issues come from code and sourced data; the AI only reads documents and suggests lines.
export function auditLines(cad: CadLine[], invoice: InvoiceLine[], classifications: Map<number, Classification | null>) {
	return cad.map((entry) => {
		const code = normalizeCode(entry.declaredCode);
		const tariff = code ? tariffLines[code] : undefined;
		const invoiceLine = invoice.find((line) => line.line === entry.line);
		const proposed = classifications.get(entry.line) ?? null;
		const proposedTariff = proposed ? tariffLines[proposed.code] : undefined;

		const openIssues: string[] = [];
		if (!invoiceLine) {
			openIssues.push("No matching invoice line was found for this entry line.");
		} else {
			if (invoiceLine.certificate === "missing") openIssues.push("No CUSMA certification of origin is referenced on the invoice.");
			if (invoiceLine.valueCad !== null && Math.abs(invoiceLine.valueCad - entry.valueCad) > 0.5) {
				openIssues.push(`The invoice value (${invoiceLine.valueCad}) differs from the value for duty (${entry.valueCad}).`);
			}
		}

		let alternativeNote: string | null = null;
		if (!proposed) {
			openIssues.push("A tariff line could not be suggested from the description.");
		} else if (proposed.confidence === "low") {
			openIssues.push("The goods description is not specific enough to confirm the declared tariff line.");
		} else if (proposed.code !== code && proposedTariff) {
			openIssues.push(`The declared line is ${code ?? entry.declaredCode}, but the description suggests ${proposed.code} (${proposedTariff.description}).`);
			alternativeNote = `The suggested line ${proposed.code} has an MFN rate of ${proposedTariff.mfnPercent}%${tariff ? `, compared with ${tariff.mfnPercent}% for the declared line` : ""}.`;
		}

		let status: FindingStatus = "cannot_assess";
		let reason = `Tariff line ${code ?? entry.declaredCode} is not in this prototype's sourced table, so no rate comparison was made. A broker should check it.`;
		let potentialDifferenceCad = 0;
		if (tariff) {
			potentialDifferenceCad = Math.max(0, round(entry.dutyPaidCad - (entry.valueCad * tariff.ustPercent) / 100));
			if (potentialDifferenceCad === 0) {
				status = "no_rate_difference";
				reason = "Duty paid is not higher than the duty implied by the sourced US-origin (UST) rate. No rate-based difference found.";
			} else if (invoiceLine?.certificate === "on_file") {
				status = "review_adjustment";
				reason = "Duty paid exceeds the duty implied by the sourced UST rate. Origin evidence is referenced on the invoice, so a broker should review whether an adjustment or refund request is appropriate.";
			} else {
				status = "needs_origin_evidence";
				reason = "A difference would exist only if the goods qualify for the UST rate. No proof of origin is referenced on the invoice, so eligibility cannot be assessed.";
			}
		}

		return {
			line: entry.line,
			description: invoiceLine?.description ?? null,
			size: invoiceLine?.size ?? null,
			declaredCode: code ?? entry.declaredCode,
			treatment: entry.treatment,
			valueCad: entry.valueCad,
			dutyPaidCad: entry.dutyPaidCad,
			mfnPercent: tariff?.mfnPercent ?? null,
			ustPercent: tariff?.ustPercent ?? null,
			potentialDifferenceCad,
			status,
			reason,
			suggestedClassification: proposed
				? { ...proposed, description: proposedTariff?.description ?? "", matchesDeclared: proposed.code === code }
				: null,
			alternativeNote,
			surtaxCheck: tariff?.surtaxCheck ?? null,
			sourceUrl: tariff?.sourceUrl ?? null,
			openIssues,
		};
	});
}

export type Finding = ReturnType<typeof auditLines>[number];

// Accepts a single question and rejects labels, lists and rambling so unusable output falls back to rules.
export function cleanQuestion(text: string): string | null {
	const lines = text.split("\n").map((line) => line.trim()).filter(Boolean);
	if (lines.length !== 1) return null;
	const question = lines[0].replace(/^(\d+\s*:|[-*]\s*)\s*/, "");
	return question.length >= 15 && question.length <= 350 && question.indexOf("?") === question.length - 1
		? question
		: null;
}
