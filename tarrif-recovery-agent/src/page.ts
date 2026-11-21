export const page = `<!doctype html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<title>DutyShield | Import duty review</title>
	<style>
		:root {
			--ink: #10242b; --muted: #546a6d; --line: #dde7e4; --bg: #f4f7f6; --card: #ffffff;
			--brand: #0b6b57; --brand-dark: #07493c; --brand-soft: #e2f3ed;
			--amber: #8a5a06; --amber-soft: #fff1cf; --grey-soft: #e9eef0; --red: #a13a2a;
			--radius: 16px; --shadow: 0 8px 28px rgba(16, 36, 43, .08);
		}
		* { box-sizing: border-box; }
		body { margin: 0; font-family: system-ui, -apple-system, "Segoe UI", sans-serif; color: var(--ink); background: var(--bg); line-height: 1.55; }
		a { color: var(--brand); }
		.wrap { max-width: 1080px; margin: 0 auto; padding: 0 22px; }
		nav { display: flex; justify-content: space-between; align-items: center; padding: 18px 0; }
		.brand { display: flex; align-items: center; gap: 10px; font-weight: 800; font-size: 1.25rem; color: #fff; }
		.logo { width: 34px; height: 34px; border-radius: 10px; background: #fff; color: var(--brand); display: grid; place-items: center; font-weight: 900; }
		.badge { background: rgba(255,255,255,.16); color: #fff; border: 1px solid rgba(255,255,255,.35); border-radius: 999px; padding: 6px 14px; font-size: .78rem; font-weight: 700; letter-spacing: .02em; }
		.hero { background: linear-gradient(135deg, #07493c 0%, #0b6b57 55%, #138a6f 100%); color: #fff; padding-bottom: 90px; }
		.hero h1 { font-size: clamp(2.1rem, 5.5vw, 3.4rem); line-height: 1.08; margin: 38px 0 14px; max-width: 760px; letter-spacing: -.02em; }
		.hero p { font-size: 1.1rem; max-width: 640px; color: #d4eee5; margin: 0 0 24px; }
		.steps { display: flex; flex-wrap: wrap; gap: 10px; margin: 0; padding: 0; list-style: none; }
		.steps li { background: rgba(255,255,255,.12); border-radius: 999px; padding: 8px 16px; font-size: .9rem; font-weight: 600; }
		.steps b { display: inline-grid; place-items: center; width: 22px; height: 22px; background: #fff; color: var(--brand); border-radius: 50%; margin-right: 8px; font-size: .78rem; }
		main { margin-top: -56px; padding-bottom: 50px; }
		.card { background: var(--card); border: 1px solid var(--line); border-radius: var(--radius); box-shadow: var(--shadow); padding: 28px; margin-bottom: 22px; }
		.card h2 { margin: 0 0 6px; font-size: 1.4rem; }
		.card h3 { margin: 24px 0 8px; font-size: 1.05rem; }
		.sub { color: var(--muted); margin: 0 0 20px; }
		.notice { border-radius: 12px; padding: 13px 16px; font-size: .92rem; margin-bottom: 20px; background: var(--amber-soft); color: #5f3f04; border: 1px solid #f0d58f; }
		.progress { display: flex; align-items: center; gap: 14px; margin-bottom: 20px; }
		.bar { flex: 1; height: 10px; background: var(--grey-soft); border-radius: 999px; overflow: hidden; }
		.bar span { display: block; height: 100%; width: 0; background: var(--brand); transition: width .3s; }
		.progress strong { white-space: nowrap; font-size: .9rem; }
		.docs { display: grid; grid-template-columns: repeat(auto-fit, minmax(310px, 1fr)); gap: 16px; }
		.doc { border: 2px dashed #c3d3ce; border-radius: 14px; padding: 18px; background: #fbfdfc; transition: border-color .2s, background .2s; }
		.doc.drag { border-color: var(--brand); background: var(--brand-soft); }
		.doc.done { border-style: solid; border-color: #98cfbd; background: #f3fbf8; }
		.doc-head { display: flex; justify-content: space-between; gap: 10px; align-items: flex-start; }
		.doc h3 { margin: 0; font-size: 1.02rem; }
		.tag { border-radius: 999px; padding: 2px 10px; font-size: .72rem; font-weight: 700; white-space: nowrap; }
		.req { background: var(--brand-soft); color: var(--brand-dark); }
		.opt { background: var(--grey-soft); color: var(--muted); }
		.doc p { margin: 8px 0 12px; font-size: .88rem; color: var(--muted); }
		.pick { display: inline-block; background: #fff; color: var(--brand-dark); border: 1px solid var(--brand); border-radius: 9px; padding: 8px 14px; font-size: .88rem; font-weight: 700; cursor: pointer; }
		.pick:hover, input:focus-visible + .pick { background: var(--brand-soft); }
		.doc input[type=file] { position: absolute; opacity: 0; width: 1px; height: 1px; }
		.files { list-style: none; margin: 10px 0 0; padding: 0; font-size: .86rem; }
		.files li { display: flex; justify-content: space-between; gap: 8px; align-items: center; padding: 6px 0; border-top: 1px solid var(--line); }
		.files button { background: none; border: 0; color: var(--red); cursor: pointer; font-weight: 700; font-size: .82rem; }
		.hint { font-size: .8rem; color: var(--muted); }
		.texts { display: grid; grid-template-columns: repeat(auto-fit, minmax(380px, 1fr)); gap: 16px; margin-bottom: 18px; }
		.texts label { font-weight: 700; font-size: .92rem; display: block; margin-bottom: 6px; }
		textarea { width: 100%; min-height: 330px; font: .8rem/1.5 ui-monospace, "Cascadia Mono", Consolas, monospace; border: 1px solid var(--line); border-radius: 12px; padding: 12px; color: var(--ink); background: #fbfdfc; resize: vertical; }
		textarea:focus { outline: 2px solid var(--brand); }
		.primary { background: var(--brand); color: #fff; border: 0; border-radius: 12px; padding: 15px 26px; font-size: 1.02rem; font-weight: 700; cursor: pointer; box-shadow: 0 4px 14px rgba(11,107,87,.3); }
		.primary:hover:not(:disabled) { background: var(--brand-dark); }
		.primary:disabled { opacity: .6; cursor: wait; }
		.link { background: none; border: 0; color: var(--brand); font-weight: 700; cursor: pointer; margin-left: 14px; font-size: .92rem; }
		#status { margin-left: 12px; color: var(--muted); }
		#status.error { color: var(--red); font-weight: 600; }
		.table-wrap { overflow-x: auto; }
		table { border-collapse: collapse; width: 100%; min-width: 600px; text-align: left; font-size: .88rem; }
		th, td { padding: 10px; border-bottom: 1px solid var(--line); vertical-align: top; }
		th { font-size: .74rem; text-transform: uppercase; letter-spacing: .04em; color: var(--muted); }
		.summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 14px; margin: 22px 0; }
		.stat { border-radius: 14px; padding: 18px; border: 1px solid var(--line); }
		.stat b { display: block; font-size: 1.7rem; letter-spacing: -.02em; }
		.stat span { font-size: .85rem; color: var(--muted); }
		.stat.good { background: var(--brand-soft); } .stat.warn { background: var(--amber-soft); } .stat.flat { background: var(--grey-soft); }
		.finding { border: 1px solid var(--line); border-radius: 14px; padding: 18px; margin-bottom: 14px; }
		.finding-head { display: flex; justify-content: space-between; gap: 12px; flex-wrap: wrap; align-items: center; }
		.finding h3 { margin: 0; font-size: 1.02rem; }
		.pill { border-radius: 999px; padding: 4px 12px; font-size: .78rem; font-weight: 700; }
		.review_adjustment { background: var(--brand-soft); color: var(--brand-dark); }
		.needs_origin_evidence { background: var(--amber-soft); color: var(--amber); }
		.no_rate_difference, .cannot_assess { background: var(--grey-soft); color: var(--muted); }
		.metrics { display: flex; flex-wrap: wrap; gap: 8px; margin: 12px 0; }
		.metrics span { background: var(--bg); border-radius: 8px; padding: 4px 10px; font-size: .82rem; }
		.finding p { margin: 6px 0; font-size: .92rem; }
		.finding .small { color: var(--muted); font-size: .82rem; }
		.ai-line { background: #f1f5ff; border-radius: 12px; padding: 10px 14px; margin: 10px 0; font-size: .9rem; }
		.ai-line b { font-size: .76rem; text-transform: uppercase; letter-spacing: .04em; color: #2c3e8a; }
		.question { background: var(--brand-soft); border-radius: 12px; padding: 12px 14px; margin: 10px 0; font-size: .92rem; }
		.question b { display: block; font-size: .76rem; text-transform: uppercase; letter-spacing: .04em; color: var(--brand-dark); margin-bottom: 4px; }
		.question small { display: block; margin-top: 6px; color: var(--muted); }
		footer { color: var(--muted); font-size: .86rem; padding: 10px 0 40px; }
		@media (max-width: 600px) { .card { padding: 20px; } .texts { grid-template-columns: 1fr; } }
	</style>
</head>
<body>
	<header class="hero">
		<div class="wrap">
			<nav><div class="brand"><span class="logo">D</span>DutyShield</div><span class="badge">PROOF OF CONCEPT</span></nav>
			<h1>Find import duties worth a second look.</h1>
			<p>For Canadian beverage and food processors importing from the United States. AI reads your invoice and customs entry, suggests the tariff line, and code checks it against the 2026 tariff.</p>
			<ol class="steps"><li><b>1</b>Add documents</li><li><b>2</b>AI reads and checks them</li><li><b>3</b>Take it to your broker</li></ol>
		</div>
	</header>
	<main class="wrap">
		<section class="card" aria-labelledby="docs-title">
			<h2 id="docs-title">1. Add your documents</h2>
			<p class="sub">These are the documents a broker would need to check a US-origin import. Drag files onto a box or choose them.</p>
			<div class="notice"><strong>Proof of concept:</strong> the AI currently reads only the <b>commercial invoice</b> and the <b>entry (CAD)</b>, as plain text (.txt or .csv files, or pasted below). Choosing a text file in those two boxes loads it into step 2. Other documents and PDFs stay in your browser and are not read yet. Please don't add real customer documents.</div>
			<div class="progress"><div class="bar"><span id="bar"></span></div><strong id="progress-text">0 of 5 required documents added</strong></div>
			<div class="docs" id="docs"></div>
		</section>

		<section class="card" aria-labelledby="run-title">
			<h2 id="run-title">2. Review the documents</h2>
			<p class="sub">Sample documents for <span id="company">a fictional importer</span> are loaded. All parties and amounts are invented. You can edit the text or replace it with your own illustrative documents.</p>
			<div class="texts">
				<div><label for="invoice-text">Commercial invoice (text)</label><textarea id="invoice-text" spellcheck="false" maxlength="8000"></textarea></div>
				<div><label for="cad-text">Entry / commercial accounting declaration (text)</label><textarea id="cad-text" spellcheck="false" maxlength="8000"></textarea></div>
			</div>
			<button class="primary" id="run" disabled>Read and review</button><button class="link" id="reset" type="button">Reset to sample</button><span id="status" role="status" aria-live="polite"></span>
		</section>

		<section class="card" id="results" hidden aria-labelledby="results-title">
			<h2 id="results-title">3. Results</h2>
			<h3>What the AI read</h3>
			<p class="sub">The AI turned the two documents into the structured lines below. Code checked that each number appears in the source text. Check this against your documents.</p>
			<div class="table-wrap"><table><thead><tr><th>Line</th><th>Invoice description</th><th>Qty</th><th>Value</th><th>CUSMA cert</th></tr></thead><tbody id="invoice-rows"></tbody></table></div>
			<div class="table-wrap" style="margin-top:16px"><table><thead><tr><th>Line</th><th>Declared code</th><th>Treatment</th><th>Value for duty</th><th>Duty paid</th></tr></thead><tbody id="cad-rows"></tbody></table></div>
			<h3>Review flags</h3>
			<p class="sub">Each flag compares duty paid with the duty implied by the sourced 2026 US-origin (UST) tariff rate. A flag applies only if the goods qualify as US-origin under CUSMA and a broker confirms the classification.</p>
			<div class="summary" id="summary"></div>
			<div id="findings"></div>
			<h3>Before acting on a finding</h3>
			<p class="sub">A customs professional must verify classification, origin, tariff rates and surtaxes for the import date, the supporting evidence and the deadlines. CBSA says adjustment and refund requests can generally be made within four years, with exceptions. Finance Canada also describes remission for some surtaxes on US goods used in food and beverage packaging; this prototype has not assessed eligibility. DutyShield does not submit anything to CBSA.</p>
		</section>
		<footer>
			Sources: <a href="https://www.cbsa-asfc.gc.ca/trade-commerce/tariff-tarif/2026/menu-eng.html">2026 Customs Tariff</a> ·
			<a href="https://www.cbsa-asfc.gc.ca/import/guide-3-eng.html">Duties and taxes</a> ·
			<a href="https://www.cbsa-asfc.gc.ca/import/guide-7-eng.html">Corrections, adjustments and refunds</a> ·
			<a href="https://www.canada.ca/en/department-finance/programs/international-trade-finance-policy/canadas-tariff-responses/tariff-relief-canadian-importing-goods-us.html">Tariff relief for US goods</a>
		</footer>
	</main>
	<script>
		const documents = [
			{ id: "cad", title: "Commercial accounting declaration (CAD) or entry export", required: true, target: "cad-text", why: "Shows the declared tariff code, tariff treatment, value for duty and duty paid." },
			{ id: "invoice", title: "Commercial invoice", required: true, target: "invoice-text", why: "Product description, supplier, quantity and price for each line." },
			{ id: "origin", title: "CUSMA certification of origin", required: true, why: "Supports a claim for the preferential US tariff (UST). CBSA says you must have proof of origin on hand." },
			{ id: "spec", title: "Product specification sheet", required: true, why: "Material, capacity and use help confirm the tariff classification, such as embossed beverage cans versus other aluminum cans." },
			{ id: "payment", title: "Duty and tax payment record", required: true, why: "A CARM statement or broker invoice that separates customs duty from GST and any surtax." },
			{ id: "shipping", title: "Bill of lading or shipping record", required: false, why: "Preferential claims can require direct shipment from the United States." },
		];
		const requiredCount = documents.filter((doc) => doc.required).length;
		const chosen = new Map(documents.map((doc) => [doc.id, []]));
		const docsEl = document.getElementById("docs");
		const labels = { review_adjustment: "Review for adjustment", needs_origin_evidence: "Needs origin evidence", no_rate_difference: "No rate difference", cannot_assess: "Cannot assess" };
		const currency = (amount) => new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD" }).format(amount);
		const el = (tag, className, text) => { const node = document.createElement(tag); if (className) node.className = className; if (text !== undefined) node.textContent = text; return node; };
		const size = (bytes) => bytes < 1048576 ? Math.max(1, Math.round(bytes / 1024)) + " KB" : (bytes / 1048576).toFixed(1) + " MB";
		const status = document.getElementById("status");
		const setStatus = (text, isError) => { status.textContent = text; status.className = isError ? "error" : ""; };

		function updateProgress() {
			const done = documents.filter((doc) => doc.required && chosen.get(doc.id).length > 0).length;
			document.getElementById("bar").style.width = (done / requiredCount * 100) + "%";
			document.getElementById("progress-text").textContent = done + " of " + requiredCount + " required documents added";
		}

		function loadText(doc, file) {
			if (!doc.target || !/\\.(txt|csv)$/i.test(file.name)) return;
			file.text().then((text) => {
				document.getElementById(doc.target).value = text.slice(0, 8000);
				setStatus("Loaded " + file.name + " into step 2.", false);
			});
		}

		function renderDoc(doc, box) {
			const files = chosen.get(doc.id);
			box.className = "doc" + (files.length ? " done" : "");
			box.replaceChildren();
			const head = el("div", "doc-head");
			head.append(el("h3", "", doc.title), el("span", "tag " + (doc.required ? "req" : "opt"), doc.required ? "Required" : "Optional"));
			box.append(head, el("p", "", doc.why));
			const input = el("input");
			input.type = "file"; input.id = "file-" + doc.id; input.multiple = true; input.accept = ".pdf,.csv,.txt,.xlsx,.png,.jpg,.jpeg";
			input.addEventListener("change", () => { add(doc, input.files); input.value = ""; });
			const pick = el("label", "pick", files.length ? "Add more" : "Choose files");
			pick.htmlFor = input.id;
			box.append(input, pick, el("span", "hint", doc.target ? "  Text read by AI: .txt or .csv" : "  PDF, CSV, XLSX, PNG or JPG (not read yet)"));
			if (files.length) {
				const list = el("ul", "files");
				files.forEach((file, index) => {
					const item = el("li");
					item.append(el("span", "", file.name + " (" + size(file.size) + ")"));
					const remove = el("button", "", "Remove");
					remove.type = "button";
					remove.addEventListener("click", () => { files.splice(index, 1); renderDoc(doc, box); updateProgress(); });
					item.append(remove);
					list.append(item);
				});
				box.append(list);
			}
			box.ondragover = (event) => { event.preventDefault(); box.classList.add("drag"); };
			box.ondragleave = () => box.classList.remove("drag");
			box.ondrop = (event) => { event.preventDefault(); box.classList.remove("drag"); add(doc, event.dataTransfer.files); };
		}

		function add(doc, fileList) {
			const added = Array.from(fileList);
			chosen.get(doc.id).push(...added);
			added.forEach((file) => loadText(doc, file));
			renderDoc(doc, document.getElementById("box-" + doc.id));
			updateProgress();
		}

		for (const doc of documents) {
			const box = el("div", "doc");
			box.id = "box-" + doc.id;
			docsEl.append(box);
			renderDoc(doc, box);
		}

		const run = document.getElementById("run");
		const invoiceText = document.getElementById("invoice-text");
		const cadText = document.getElementById("cad-text");
		let sample = null;

		async function loadSample() {
			try {
				const response = await fetch("/api/sample");
				if (!response.ok) throw new Error("Could not load the sample documents.");
				sample = await response.json();
				document.getElementById("company").textContent = sample.company;
				invoiceText.value = sample.invoiceText;
				cadText.value = sample.cadText;
				run.disabled = false;
			} catch (error) { setStatus(error.message, true); }
		}
		document.getElementById("reset").addEventListener("click", () => {
			if (!sample) return;
			invoiceText.value = sample.invoiceText;
			cadText.value = sample.cadText;
			setStatus("Sample documents restored.", false);
		});

		function cells(row, values) { values.forEach((value) => row.append(el("td", "", value))); return row; }

		function stat(kind, value, label) {
			const box = el("div", "stat " + kind);
			box.append(el("b", "", value), el("span", "", label));
			return box;
		}

		function renderRead(data) {
			const invoiceRows = document.getElementById("invoice-rows");
			invoiceRows.replaceChildren(...data.invoice.map((line) => cells(el("tr"), [
				String(line.line),
				line.description + (line.size && !line.description.toLowerCase().includes(line.size.toLowerCase()) ? " (" + line.size + ")" : ""),
				line.quantity === null ? "-" : line.quantity.toLocaleString("en-CA"),
				line.valueCad === null ? "-" : currency(line.valueCad),
				line.certificate === "on_file" ? "Referenced" : "Not referenced",
			])));
			document.getElementById("cad-rows").replaceChildren(...data.cad.map((line) => cells(el("tr"), [
				String(line.line), line.declaredCode, line.treatment, currency(line.valueCad), currency(line.dutyPaidCad),
			])));
		}

		function renderFindings(findings) {
			const total = (kind) => findings.filter((f) => f.status === kind).reduce((sum, f) => sum + f.potentialDifferenceCad, 0);
			document.getElementById("summary").replaceChildren(
				stat("good", currency(total("review_adjustment")), "Ready for broker review"),
				stat("warn", currency(total("needs_origin_evidence")), "Needs origin evidence first"),
				stat("flat", String(findings.filter((f) => f.status === "no_rate_difference").length), "Lines with no rate difference"),
			);
			const list = document.getElementById("findings");
			list.replaceChildren();
			for (const finding of findings) {
				const item = el("div", "finding");
				const head = el("div", "finding-head");
				head.append(el("h3", "", "Line " + finding.line + " · " + (finding.description || "No invoice description")), el("span", "pill " + finding.status, labels[finding.status]));
				const metrics = el("div", "metrics");
				const facts = ["Declared " + finding.declaredCode + " (" + finding.treatment + ")"];
				if (finding.mfnPercent !== null) facts.push("MFN " + finding.mfnPercent + "%", "UST " + finding.ustPercent + "%");
				facts.push("Duty paid " + currency(finding.dutyPaidCad), "Potential difference " + currency(finding.potentialDifferenceCad));
				facts.forEach((text) => metrics.append(el("span", "", text)));
				item.append(head, metrics, el("p", "", finding.reason));
				const suggestion = finding.suggestedClassification;
				const ai = el("div", "ai-line");
				ai.append(el("b", "", "AI suggested line"));
				ai.append(el("div", "", suggestion
					? suggestion.code + " (" + suggestion.confidence + " confidence): " + suggestion.description + " - " + (suggestion.matchesDeclared ? "matches the declared line." : "differs from the declared line.")
					: "No suggestion could be made."));
				if (suggestion && suggestion.reason) ai.append(el("div", "small", "Reason given: " + suggestion.reason));
				item.append(ai);
				if (finding.alternativeNote) item.append(el("p", "", finding.alternativeNote));
				if (finding.brokerQuestion) {
					const question = el("div", "question");
					question.append(el("b", "", "Question for your broker"), el("span", "", finding.brokerQuestion));
					question.append(el("small", "", finding.questionSource === "ai" ? "Drafted by AI from the open issues; check it before sending." : "Generated from rules because the AI did not return a usable question."));
					item.append(question);
				} else {
					item.append(el("p", "small", "No open questions from the documents provided."));
				}
				if (finding.surtaxCheck) item.append(el("p", "small", "Surtax check: " + finding.surtaxCheck));
				if (finding.sourceUrl) {
					const source = el("p", "small", "Rate source: ");
					const link = el("a", "", "CBSA tariff chapter");
					link.href = finding.sourceUrl;
					source.append(link);
					item.append(source);
				}
				list.append(item);
			}
		}

		run.addEventListener("click", async () => {
			run.disabled = true;
			setStatus("AI is reading the documents and checking each line. This can take about 15 seconds...", false);
			try {
				const response = await fetch("/api/audit", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ invoiceText: invoiceText.value, cadText: cadText.value }) });
				const data = await response.json();
				if (!response.ok) throw new Error(data.error || "The review failed.");
				renderRead(data);
				renderFindings(data.findings);
				const results = document.getElementById("results");
				results.hidden = false;
				results.scrollIntoView({ behavior: "smooth", block: "start" });
				setStatus("Done. Every result needs broker review.", false);
			} catch (error) { setStatus(error.message || "The review failed.", true); }
			finally { run.disabled = false; }
		});
		loadSample();
	</script>
</body>
</html>`;
