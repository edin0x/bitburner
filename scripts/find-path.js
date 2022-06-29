/** @param {NS} ns */
export async function main(ns) {
	const findRouteToHost = (host) => {
		const find = (hostToFind, thisHost, route) => {
			if (hostToFind === thisHost) {
				ns.tprint(`Route found to host ${hostToFind}!`)
				const path = route.concat([thisHost])
				ns.tprint(path)
				return path
			}

			const connectedNodes = ns.scan(thisHost)
			const nextNodesToCheck = connectedNodes.filter(node => !route.includes(node))
			
			if (nextNodesToCheck.length === 0) return undefined
			nextNodesToCheck.forEach(connectedNode => find(hostToFind, connectedNode, route.concat(thisHost)))
		}

		find(host, ns.getHostname(), [])
	}

	if (ns.args.length === 0) return ns.tprint(`[err0r] you need to define the name of the host`)

	findRouteToHost(ns.args[0])
}