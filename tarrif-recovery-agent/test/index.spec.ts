import { env } from "cloudflare:test";
import { afterEach, describe, expect, it, vi } from "vitest";
import { auditLines, cleanQuestion, type CadLine, type InvoiceLine } from "../src/audit";
import { classifyLine, extractInvoice, runAudit, validateCad, validateInvoice, type Runner } from "../src/pipeline";
import { sampleCad, sampleInvoice } from "../src/sample";
import { normalizeCode } from "../src/tariff";
import worker from "../src/index";

afterEach(() => vi.restoreAllMocks());

const invoiceJson = JSON.stringify({
	lines: [
		{ line: 1, description: "Aluminum beverage cans, 355 mL, embossed", quantity: 400000, valueCad: 40000, size: "355 mL", certificateRef: "CERT-US-0914-A" },
		{ line: 2, description: "PET bottles, 500 mL, clear, for bottled water", quantity: 150000, valueCad: 15000, size: "500 mL", certificateRef: null },
		{ line: 3, description: "Empty glass bottles for soft drinks, amber", quantity: 100000, valueCad: 20000, size: null, certificateRef: "CERT-US-0914-B" },
		{ line: 4, description: "Plastic screw caps, 28 mm, for PET bottles", quantity: 150000, valueCad: 4500, size: null, certificateRef: "CERT-US-0914-B" },
	],
});
const cadJson = JSON.stringify({
	lines: [
		{ line: 1, declaredCode: "7612.90.99.90", treatment: "MFN", valueCad: 40000, dutyPaidCad: 2600 },
		{ line: 2, declaredCode: "3923.30.90.90", treatment: "MFN", valueCad: 15000, dutyPaidCad: 975 },
		{ line: 3, declaredCode: "7010.90.00.93", treatment: "MFN", valueCad: 20000, dutyPaidCad: 0 },
		{ line: 4, declaredCode: "3923.50.90.90", treatment: "UST", valueCad: 4500, dutyPaidCad: 0 },
	],
});

// Stands in for Workers AI: answers each step from the prompt text.
const fakeRunner: Runner = async (system, user) => {
	if (system.startsWith("You extract line items from a commercial invoice")) return invoiceJson;
	if (system.startsWith("You extract line items from a Canadian commercial accounting")) return cadJson;
	if (system.startsWith("You suggest a Canadian tariff line")) {
		const code = user.includes("embossed") ? "7612.90.91" : user.includes("screw caps") ? "3923.50.90" : user.includes("glass") ? "7010.90.00" : "3923.30.90";
		return JSON.stringify({ code, confidence: "high", reason: "Matches the description." });
	}
	return "What documentation supports the origin of these goods?";
};

describe("document reading checks", () => {
	it("normalizes 10-digit classifications to the 8-digit tariff item", () => {
		expect(normalizeCode("7612.90.99.90")).toBe("7612.90.99");
		expect(normalizeCode("76129099")).toBe("7612.90.99");
		expect(normalizeCode("7612")).toBeNull();
	});

	it("accepts extracted lines whose numbers appear in the source and derives certificates from reference numbers", () => {
		const lines = validateInvoice(JSON.parse(invoiceJson), sampleInvoice);
		expect(lines.map((line) => line.certificate)).toEqual(["on_file", "missing", "on_file", "on_file"]);
		expect(lines[0].size).toBe("355 mL");
		expect(validateCad(JSON.parse(cadJson), sampleCad)[0]).toMatchObject({ declaredCode: "7612.90.99.90", dutyPaidCad: 2600 });
	});

	it("rejects invented numbers and certificate text that is not a reference number", () => {
		const invented = JSON.parse(invoiceJson);
		invented.lines[0].valueCad = 41234;
		expect(() => validateInvoice(invented, sampleInvoice)).toThrow("value is not in the document");

		const guessed = JSON.parse(invoiceJson);
		guessed.lines[1].certificateRef = "none provided";
		expect(validateInvoice(guessed, sampleInvoice)[1].certificate).toBe("missing");

		const badCad = JSON.parse(cadJson);
		badCad.lines[0].dutyPaidCad = 2599;
		expect(() => validateCad(badCad, sampleCad)).toThrow("amounts are not in the document");
	});

	it("retries once after unusable output, then reports an extraction error", async () => {
		const run = vi.fn<Runner>().mockResolvedValueOnce("sorry, here is prose").mockResolvedValueOnce(invoiceJson);
		expect(await extractInvoice(run, sampleInvoice)).toHaveLength(4);
		expect(run).toHaveBeenCalledTimes(2);

		const failing = vi.fn<Runner>().mockResolvedValue("not json");
		await expect(extractInvoice(failing, sampleInvoice)).rejects.toThrow("could not be read reliably");
		expect(failing).toHaveBeenCalledTimes(2);
	});

	it("never accepts a suggested tariff line outside the sourced table", async () => {
		const line: InvoiceLine = { line: 1, description: "Steel drums", quantity: null, valueCad: null, size: null, certificate: "missing" };
		const run: Runner = async () => JSON.stringify({ code: "7310.10.00", confidence: "high", reason: "Steel drums." });
		expect(await classifyLine(run, line)).toBeNull();
	});
});

describe("audit rules", () => {
	const invoice = validateInvoice(JSON.parse(invoiceJson), sampleInvoice);
	const cad = validateCad(JSON.parse(cadJson), sampleCad);
	const suggest = (code: string) => ({ code, confidence: "high" as const, reason: "" });

	it("flags MFN duty with origin evidence, holds it without evidence, and finds nothing where rates match", () => {
		const classifications = new Map([[1, suggest("7612.90.91")], [2, suggest("3923.30.90")], [3, suggest("7010.90.00")], [4, suggest("3923.50.90")]]);
		const findings = auditLines(cad, invoice, classifications);
		expect(findings.map((item) => [item.potentialDifferenceCad, item.status])).toEqual([
			[2600, "review_adjustment"],
			[975, "needs_origin_evidence"],
			[0, "no_rate_difference"],
			[0, "no_rate_difference"],
		]);
		expect(findings[0].openIssues[0]).toContain("7612.90.91");
		expect(findings[0].alternativeNote).toContain("0%");
		expect(findings[1].openIssues).toEqual(["No CUSMA certification of origin is referenced on the invoice."]);
		expect(findings[2].openIssues).toEqual([]);
	});

	it("raises an issue for low confidence, a missing suggestion and an invoice value mismatch", () => {
		const mismatched: CadLine[] = [{ ...cad[2], valueCad: 25000 }, { ...cad[3] }];
		const classifications = new Map([[3, { code: "7010.90.00", confidence: "low" as const, reason: "" }]]);
		const [glass, caps] = auditLines(mismatched, invoice, classifications);
		expect(glass.openIssues.join(" ")).toContain("differs from the value for duty");
		expect(glass.openIssues.join(" ")).toContain("not specific enough");
		expect(caps.openIssues.join(" ")).toContain("could not be suggested");
	});

	it("does not compare rates for a tariff line outside the sourced table", () => {
		const [finding] = auditLines([{ ...cad[0], declaredCode: "0000.00.00.00" }], invoice, new Map());
		expect(finding.status).toBe("cannot_assess");
		expect(finding.potentialDifferenceCad).toBe(0);
		expect(finding.mfnPercent).toBeNull();
	});

	it("never reports a negative difference", () => {
		const [finding] = auditLines([{ ...cad[0], dutyPaidCad: 0 }], invoice, new Map());
		expect(finding.potentialDifferenceCad).toBe(0);
	});

	it("accepts one clean question and rejects labels, lists and rambling", () => {
		expect(cleanQuestion("Is 7612.90.91 a better fit than 7612.90.99?")).toBe("Is 7612.90.91 a better fit than 7612.90.99?");
		expect(cleanQuestion("- Where was the resin produced?")).toBe("Where was the resin produced?");
		expect(cleanQuestion("Here you go:\nWhere was the resin produced?")).toBeNull();
		expect(cleanQuestion("This is a statement, not a question.")).toBeNull();
		expect(cleanQuestion("Where? And why? And how?")).toBeNull();
	});
});

describe("audit pipeline and API", () => {
	it("reads both documents, classifies each line and asks for questions only where issues remain", async () => {
		const result = await runAudit(fakeRunner, sampleInvoice, sampleCad);
		expect(result.invoice).toHaveLength(4);
		expect(result.findings.map((finding) => finding.suggestedClassification?.code)).toEqual(["7612.90.91", "3923.30.90", "7010.90.00", "3923.50.90"]);
		expect(result.findings.map((finding) => finding.questionSource)).toEqual(["ai", "ai", null, null]);
		expect(result.findings[2].brokerQuestion).toBeNull();
	});

	it("falls back to a rule-based question when the AI question is unusable", async () => {
		const run: Runner = async (system, user, tokens, tier) => system.startsWith("You help a Canadian importer") ? "Not a question." : fakeRunner(system, user, tokens, tier);
		const result = await runAudit(run, sampleInvoice, sampleCad);
		expect(result.findings[1]).toMatchObject({ questionSource: "rules" });
		expect(result.findings[1].brokerQuestion).toContain("No CUSMA certification of origin is referenced on the invoice.");
	});

	it("serves the sample documents and runs the audit through the API", async () => {
		vi.spyOn(env.AI, "run").mockImplementation(async (_model, input) => {
			const [system, user] = (input as { messages: { content: string }[] }).messages.map((message) => message.content);
			return { response: await fakeRunner(system, user, 0) } as never;
		});
		const sample = await (await worker.fetch(new Request("https://example.com/api/sample"), env)).json();
		expect(sample.invoiceText).toBe(sampleInvoice);

		const response = await worker.fetch(new Request("https://example.com/api/audit", {
			method: "POST",
			body: JSON.stringify({ invoiceText: sample.invoiceText, cadText: sample.cadText }),
		}), env);
		const body = await response.json();
		expect(response.status).toBe(200);
		expect(body.findings[0]).toMatchObject({ status: "review_adjustment", potentialDifferenceCad: 2600 });
	});

	it("rejects missing, oversized or malformed input before calling the AI", async () => {
		const ai = vi.spyOn(env.AI, "run");
		const post = (body: string) => worker.fetch(new Request("https://example.com/api/audit", { method: "POST", body }), env);
		expect((await post("not json")).status).toBe(400);
		expect((await post("{}")).status).toBe(400);
		expect((await post(JSON.stringify({ invoiceText: "x".repeat(8001), cadText: "y" }))).status).toBe(400);
		expect(ai).not.toHaveBeenCalled();
	});

	it("reports unreadable documents as an error instead of returning invented results", async () => {
		vi.spyOn(env.AI, "run").mockResolvedValue({ response: "I cannot do that." } as never);
		const response = await worker.fetch(new Request("https://example.com/api/audit", {
			method: "POST",
			body: JSON.stringify({ invoiceText: sampleInvoice, cadText: sampleCad }),
		}), env);
		expect(response.status).toBe(502);
		expect((await response.json()).error).toContain("could not be read reliably");
	});
});
