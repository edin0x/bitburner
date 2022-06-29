/** @param {NS} ns */
export async function main(ns) {
	ns.disableLog('sleep')
	ns.disableLog('getServerMoneyAvailable')
	const ram = Math.pow(2, 16) // in GB. 2^16 = 64TB.
	const serverNamePrefix = 'h4ck-' // FIX: first server "hack-", second "hack--0"
	const maxAmountOfServers = 25

	const getAvailableMoney = () => ns.getServerMoneyAvailable('home')

	const purchaseServers = async () => {
		const serverCost = ns.getPurchasedServerCost(ram)
		ns.print(`purchasing servers with ${ram}gb ram for ${serverCost / 1000000}m. waiting for enough money to get available..`)

		while (ns.getPurchasedServers().length < maxAmountOfServers) {
			if (getAvailableMoney() >= serverCost) {
				const purchasedServer = ns.purchaseServer(serverNamePrefix, ram)

				if (purchasedServer) {
					ns.print(`purchased brand new server ${purchasedServer} with ${ns.getServerMaxRam(purchasedServer)}gb ram.`)
				} else {
					ns.print(`could not purchase server for some weird reason.`)
				}
			}

			await ns.sleep(1000)
		}

		ns.print(`maximum number of servers reached. quiting..`)
	}

	await purchaseServers()
}