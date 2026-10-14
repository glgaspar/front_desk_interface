export function getUsageColor(percentage: number) {
	if (percentage < 30) return "#48b53c";
	if (percentage < 70) return "#b5a13c";
	return "#b53c3c";
}
