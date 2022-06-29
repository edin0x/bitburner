/** @param {NS} ns */
export async function main(ns) {
	const scanNetwork = () => {
		let network = []
		let toScan = ['home']
		while (toScan.length > 0) {
			const nodeToScan = toScan[0]
			toScan = toScan.slice(1)
			network = network.concat([nodeToScan])

			const connectedNodes = ns.scan(nodeToScan)
			ns.tprint(`${nodeToScan} -> ${connectedNodes}`)
			const newNodes = connectedNodes.filter(node => !network.includes(node) && !toScan.includes(node))
			toScan = toScan.concat(newNodes)
		}
	}

	scanNetwork()
}