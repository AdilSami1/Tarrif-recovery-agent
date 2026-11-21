export interface TariffLine {
	description: string;
	mfnPercent: number;
	ustPercent: number;
	sourceUrl: string;
	surtaxCheck: string;
}

const chapter39 = "https://www.cbsa-asfc.gc.ca/trade-commerce/tariff-tarif/2026/html/02/ch39-eng.html";
const chapter70 = "https://www.cbsa-asfc.gc.ca/trade-commerce/tariff-tarif/2026/html/00/ch70-eng.html";
const chapter76 = "https://www.cbsa-asfc.gc.ca/trade-commerce/tariff-tarif/2026/html/02/ch76-eng.html";

const aluminumSurtaxCheck =
	"Item 7612 is not listed in Schedules 1 or 1.1 of the United States Surtax Order (Steel and Aluminum 2025), current to 2026-10-29. The separate complete counter-tariff list was not fully checked.";
const plasticSurtaxCheck =
	"Only plastic sacks and bags of heading 3923 were seen on the complete counter-tariff list; bottles and closures were not found there. Verify against the full list.";

// Rates are from the CBSA Customs Tariff 2026 chapter pages retrieved on 2026-11-21.
// Confirm the tariff version in force on each import date before relying on them.
export const tariffLines: Record<string, TariffLine> = {
	"7612.90.91": {
		description: "Embossed aluminum cans for use in the packaging of beverages",
		mfnPercent: 0,
		ustPercent: 0,
		sourceUrl: chapter76,
		surtaxCheck: aluminumSurtaxCheck,
	},
	"7612.90.99": {
		description: "Aluminum cans and similar containers, other",
		mfnPercent: 6.5,
		ustPercent: 0,
		sourceUrl: chapter76,
		surtaxCheck: aluminumSurtaxCheck,
	},
	"7612.10.00": {
		description: "Aluminum collapsible tubular containers",
		mfnPercent: 6.5,
		ustPercent: 0,
		sourceUrl: chapter76,
		surtaxCheck: aluminumSurtaxCheck,
	},
	"7010.90.00": {
		description: "Glass bottles and similar containers used for packing goods (statistical suffix 93: soft drink containers)",
		mfnPercent: 0,
		ustPercent: 0,
		sourceUrl: chapter70,
		surtaxCheck: "Not found in the steel and aluminum surtax order. The complete counter-tariff list was not checked for this item.",
	},
	"3923.30.90": {
		description: "Plastic carboys, bottles, flasks and similar articles, other",
		mfnPercent: 6.5,
		ustPercent: 0,
		sourceUrl: chapter39,
		surtaxCheck: plasticSurtaxCheck,
	},
	"3923.50.90": {
		description: "Plastic stoppers, lids, caps and other closures, other",
		mfnPercent: 6.5,
		ustPercent: 0,
		sourceUrl: chapter39,
		surtaxCheck: plasticSurtaxCheck,
	},
};

// Reduces a 10-digit Canadian classification such as 7612.90.99.90 to its 8-digit tariff item.
export function normalizeCode(raw: string): string | null {
	const digits = raw.replace(/\D/g, "");
	if (digits.length < 8) return null;
	return `${digits.slice(0, 4)}.${digits.slice(4, 6)}.${digits.slice(6, 8)}`;
}
