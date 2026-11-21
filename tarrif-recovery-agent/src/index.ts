import { sampleCad, sampleCompany, sampleInvoice } from "./sample";
import { ExtractionError, runAudit, type Runner } from "./pipeline";
import { page } from "./page";

const MAX_DOCUMENT_CHARS = 8000;

function aiText(result: unknown): string {
	if (typeof result !== "object" || result === null) {
		throw new Error("Workers AI returned an unexpected response");
	}
	if ("response" in result && typeof result.response === "string" && result.response.trim()) {
		return result.response.trim();
	}
	if ("choices" in result && Array.isArray(result.choices)) {
		const choice: unknown = result.choices[0];
		if (typeof choice === "object" && choice !== null && "message" in choice) {
			const message: unknown = choice.message;
			if (typeof message === "object" && message !== null && "content" in message &&
				typeof message.content === "string" && message.content.trim()) {
				return message.content.trim();
			}
		}
	}
	throw new Error("Workers AI returned no text");
}

function documentText(value: unknown): string | null {
	return typeof value === "string" && value.trim().length > 0 && value.length <= MAX_DOCUMENT_CHARS ? value : null;
}

export default {
	async fetch(request, env): Promise<Response> {
		const path = new URL(request.url).pathname;
		if (path === "/" && request.method === "GET") {
			return new Response(page, { headers: { "content-type": "text/html; charset=utf-8" } });
		}
		if (path === "/api/sample" && request.method === "GET") {
			return Response.json({ company: sampleCompany, invoiceText: sampleInvoice, cadText: sampleCad });
		}
		if (path === "/api/audit" && request.method === "POST") {
			let body: unknown;
			try {
				body = await request.json();
			} catch {
				return Response.json({ error: "The request was not valid JSON." }, { status: 400 });
			}
			const input = (typeof body === "object" && body !== null ? body : {}) as Record<string, unknown>;
			const invoiceText = documentText(input.invoiceText);
			const cadText = documentText(input.cadText);
			if (!invoiceText || !cadText) {
				return Response.json({ error: `Provide both documents as text of at most ${MAX_DOCUMENT_CHARS} characters.` }, { status: 400 });
			}

			const models = { fast: "@cf/ibm-granite/granite-4.0-h-micro", strong: "@cf/meta/llama-3.3-70b-instruct-fp8-fast" } as const;
			const run: Runner = async (system, user, maxTokens, tier = "fast") =>
				aiText(await env.AI.run(models[tier], {
					messages: [{ role: "system", content: system }, { role: "user", content: user }],
					max_tokens: maxTokens,
					temperature: 0.1,
				}));
			try {
				return Response.json(await runAudit(run, invoiceText, cadText));
			} catch (error) {
				if (error instanceof ExtractionError) {
					return Response.json({ error: `${error.message} Check the text and try again.` }, { status: 502 });
				}
				console.error("Audit failed", error);
				return Response.json({ error: "The review failed. Try again." }, { status: 502 });
			}
		}
		return new Response("Not found", { status: 404 });
	},
} satisfies ExportedHandler<Env>;
