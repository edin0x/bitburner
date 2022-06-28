/** @param {NS} ns */
export async function main(ns) {
	ns.print('running hacknet upgrades..')
	const getMoney = () => ns.getServerMoneyAvailable('home')
	const getPropertyStats = (stat) => Array.from(Array(ns.hacknet.numNodes())).map((_, i) => ns.hacknet.getNodeStats(i)[stat])

	ns.disableLog('getServerMoneyAvailable')
	ns.disableLog('sleep')

	const upgradeNodes = async (property, maxStat, upgradeCostFn, upgradeNodeFn) => {
		let propertyStats = getPropertyStats(property)

		const upgrades = propertyStats.map((stat, i) => {
			if (stat >= maxStat) return true

			const cost = upgradeCostFn(i)

			if (stat < maxStat && cost < getMoney()) {
				ns.print(`upgrading n0de ${i} to ${property} ${stat + 1}...`)
				return upgradeNodeFn(i)
			}

			return false
		})

		if (upgrades.some(upgradeSucceeded => !upgradeSucceeded)) {
			await ns.sleep(100)
		}
		propertyStats = getPropertyStats(property)
	}

	const purchaseNewNode = async () => {
		const newNodeIndex = ns.hacknet.purchaseNode()
		if (newNodeIndex >= 0) {
			ns.print(`purchased n0de ${newNodeIndex}.`)
		}
	}

	while (true) {
		await upgradeNodes('level', 200, (i) => ns.hacknet.getLevelUpgradeCost(i, 1), (i) => ns.hacknet.upgradeLevel(i, 1))
		await upgradeNodes('ram', 64, (i) => ns.hacknet.getRamUpgradeCost(i, 1), (i) => ns.hacknet.upgradeRam(i, 1))
		await upgradeNodes('cores', 16, (i) => ns.hacknet.getCoreUpgradeCost(i, 1), (i) => ns.hacknet.upgradeCore(i, 1))
		await purchaseNewNode()
		await ns.sleep(100)
	}
}