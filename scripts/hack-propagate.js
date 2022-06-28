/** @param {NS} ns */
export async function main(ns) {
	ns.disableLog('sleep')
	ns.disableLog('brutessh')
	ns.disableLog('ftpcrack')
	ns.disableLog('relaysmtp')
	ns.disableLog('relaysmtp')
	ns.disableLog('sqlinject')
	ns.disableLog('scp')
	ns.disableLog('nuke')
	ns.disableLog('scan')
	ns.disableLog('exec')
	ns.disableLog('getServerMaxRam')
	ns.disableLog('getServerNumPortsRequired')
	ns.disableLog('getServerUsedRam')

	const hackScriptFileName = 'hack.js'
	const minimumFreeRamOnHomeServer = 20 // in GB

	const openPortPrograms = {
		'BruteSSH.exe': ns.brutessh,
		'FTPCrack.exe': ns.ftpcrack,
		'relaySMTP.exe': ns.relaysmtp,
		'HTTPWorm.exe': ns.httpworm,
		'SQLInject.exe': ns.sqlinject
	}

	const getMaxNumberOfThreads = (target, scriptFileName) => Math.floor(ns.getServerMaxRam(target) / ns.getScriptRam(scriptFileName, target))

	const killHackScript = (host) => ns.scriptKill(hackScriptFileName, host)

	const getAvailablePrograms = () => Object.keys(openPortPrograms).filter(program => ns.fileExists(program, 'home'))

	const openPorts = (node) => getAvailablePrograms().forEach((program) => openPortPrograms[program](node))

	const nuke = (node) => {
		if (ns.getServerNumPortsRequired(node) <= getAvailablePrograms().length) ns.nuke(node)
	}

	const getNetwork = () => {
		let network = []
		let toScan = ['home']
		while (toScan.length > 0) {
			const nodeToScan = toScan[0]
			toScan = toScan.slice(1)
			network = network.concat([nodeToScan])

			const connectedNodes = ns.scan(nodeToScan)
			const newNodes = connectedNodes.filter(node => !network.includes(node) && !toScan.includes(node))
			toScan = toScan.concat(newNodes)
		}

		return network
	}

	const r00t = (node) => {
		openPorts(node)
		nuke(node)
	}

	const runHackScript = async (node) => {
		killHackScript(node)
		if (node !== 'home') await ns.scp(hackScriptFileName, node)
		const maxNumOfThreads = getMaxNumberOfThreads(node, hackScriptFileName)

		if (maxNumOfThreads > 0) ns.exec(hackScriptFileName, node, maxNumOfThreads)
	}

	const h4ck = async (node) => {
		r00t(node)

		if (ns.hasRootAccess(node) && node !== 'home') await runHackScript(node)
	}

	const propagate = async (network) => {
		for (const node of network) {
			await h4ck(node)
		}
	}

	const runOnPurchasedServers = async () => {
		const purchasedServers = ns.getPurchasedServers()
		for (const node of purchasedServers) {
			await runHackScript(node)
		}
	}

	const runOnHomeServer = async () => {
		
		const scriptRam = ns.getScriptRam(hackScriptFileName)
		const threadsToKeepFree = (minimumFreeRamOnHomeServer + ns.getServerUsedRam('home')) / scriptRam
		const maxNumberOfThreads = getMaxNumberOfThreads('home', hackScriptFileName) - threadsToKeepFree
		 
		// TODO: determine optimal target to hack
		if (maxNumberOfThreads > 0) ns.exec(hackScriptFileName, 'home', maxNumberOfThreads, 'foodnstuff')
	}

	const getRootedNodes = (network) => network.filter(node => ns.hasRootAccess(node))
	const getNotRootedNodes = (network) => network.filter(node => !ns.hasRootAccess(node))

	const network = getNetwork()
	ns.print(`[inf0] found ${network.length} total nodes in network.`)

	await propagate(network)

	await runOnPurchasedServers()
	await runOnHomeServer()

	const initiallyRootedNodes = getRootedNodes(network)
	const initiallyNotRootedNodes = getNotRootedNodes(network)
	const initiallyAvailablePrograms = getAvailablePrograms()

	ns.print(`[inf0] already r00ted (${initiallyRootedNodes.length}): ${initiallyRootedNodes}.`)
	ns.print(`[inf0] not already r00ted (${initiallyNotRootedNodes.length}): ${initiallyNotRootedNodes}.`)
	ns.print(`[inf0] will re-hack as soon as new programs become available..`)

	let rootedNodes = initiallyRootedNodes
	let availablePrograms = initiallyAvailablePrograms
	while (true) {
		const currentlyAvailablePrograms = getAvailablePrograms()
		if (currentlyAvailablePrograms.length > availablePrograms.length) {
			await propagate(network)

			const newRootedNodes = getRootedNodes(network).filter(node => !rootedNodes.includes(node))
			if (newRootedNodes.length > 0) {
				ns.print(`[inf0] new r00ted nodes (${newRootedNodes.length}): ${newRootedNodes}`)
			}

			rootedNodes = rootedNodes.concat(newRootedNodes)
			availablePrograms = availablePrograms.concat(currentlyAvailablePrograms.filter(program => !availablePrograms.includes(program)))
		}

		await ns.sleep(1000)
	}

	// TODO: backdoor
}